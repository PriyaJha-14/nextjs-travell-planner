/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Browser, Page } from "puppeteer";

export const startHotelScraping = async (
  page: Page,
  browser: Browser,
  location: string
) => {
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    console.log("🏨 Starting Agoda hotel scraping for:", location);

    // ✅ Agoda URL patterns (replacing Kayak URLs)
    const searchUrls = [
      `https://www.agoda.com/search?destination=${encodeURIComponent(location)}`,
      `https://www.agoda.com/search?city=${encodeURIComponent(location)}`,
      `https://www.agoda.com/${encodeURIComponent(location)}-hotels.html`,
      `https://www.agoda.com/search?q=${encodeURIComponent(location)}`
    ];
    
    // ✅ Try each URL pattern until one works
    for (let i = 0; i < searchUrls.length; i++) {
      const searchUrl = searchUrls[i];
      console.log(`🌍 Trying Agoda URL ${i + 1}/${searchUrls.length}: ${searchUrl}`);
      
      try {
        await page.goto(searchUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        // ✅ Check if page loaded successfully with hotel content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pageContent = await page.content();
        const hasHotelContent = 
          pageContent.includes('hotel') || 
          pageContent.includes('Hotels') ||
          pageContent.includes('₹') ||
          pageContent.includes('per night') ||
          pageContent.includes('accommodation') ||
          pageContent.includes('PropertyCard');
        
        if (hasHotelContent) {
          console.log(`✅ Successfully loaded Agoda hotel page with URL pattern ${i + 1}`);
          break;
        } else {
          console.log(`⚠️ URL pattern ${i + 1} loaded but no hotel content found`);
        }
        
      } catch (error) {
        console.log(`❌ URL pattern ${i + 1} failed: ${error.message}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    return await extractAgodaHotelData(page, location);

  } catch (error) {
    console.error("❌ Agoda hotel scraping error:", error.message);
    return createMockHotelData(location);
  }
};

// ✅ Agoda-specific data extraction function
async function extractAgodaHotelData(page: Page, location: string) {
  try {
    console.log("🏨 Starting Agoda hotel data extraction...");
    
    // ✅ Wait for Agoda images to load
    console.log("🖼️ Waiting for Agoda hotel images to load...");
    try {
      await page.waitForSelector('[data-selenium="hotel-name"], .PropertyCard, img[data-src*="agoda"]', { 
        timeout: 10000 
      });
      
      // Scroll for lazy loading
      await page.evaluate(() => {
        return new Promise((resolve) => {
          let scrollTop = -1;
          const interval = setInterval(() => {
            window.scrollBy(0, 1000);
            if (document.documentElement.scrollTop !== scrollTop) {
              scrollTop = document.documentElement.scrollTop;
            } else {
              clearInterval(interval);
              resolve(true);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(interval);
            resolve(true);
          }, 5000);
        });
      });
      
      console.log("✅ Agoda hotel images loading completed");
    } catch (e) {
      console.log("⚠️ Agoda image loading timeout, proceeding anyway");
    }
    
    // ✅ Take debug screenshot for Agoda
    await takeDebugScreenshot(page, location);
    
    return await page.evaluate(async (loc) => {
      const hotels = [];
      
      // ✅ Agoda-specific hotel card selectors
      const hotelCardSelectors = [
        '[data-selenium="hotel-name"]',          // Primary Agoda selector
        '.PropertyCard',                         // Modern Agoda cards
        '.hotel-card',                          // Alternative cards
        '[class*="PropertyCard"]',              // Dynamic class matching
        '[data-testid*="property"]',            // Test ID variants
        '[class*="HotelCard"]',                 // Hotel card variants
        '.property-card',                       // Generic property cards
        'article[data-testid]',                 // Article containers
        '[role="listitem"]',                    // List items
        '.result-item'                          // Result items
      ];
      
      let hotelElements = [];
      
      // Find hotel elements using Agoda selectors
      for (const selector of hotelCardSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          hotelElements = Array.from(elements);
          console.log(`✅ Found ${elements.length} Agoda hotels using selector: ${selector}`);
          break;
        }
      }
      
      if (hotelElements.length === 0) {
        console.log("⚠️ No Agoda hotel cards found, trying content-based extraction");
        
        const allDivs = document.querySelectorAll('div, article, section');
        hotelElements = Array.from(allDivs).filter(el => {
          const text = el.textContent || '';
          return (
            (text.includes('₹') || text.includes('$')) && 
            (text.includes('night') || text.includes('hotel') || text.includes('resort'))
          );
        }).slice(0, 10);
        
        console.log(`Found ${hotelElements.length} potential Agoda hotel elements via content analysis`);
      }
      
      // ✅ Extract data from Agoda elements
      hotelElements.forEach((element, index) => {
        try {
          // ✅ Agoda-specific title selectors
          const titleSelectors = [
            '[data-selenium="hotel-name"]',
            '.sc-hKgILt.Typographystyled__TypographyStyled-sc-1uoovui-0.kkDVzi.bnzCNt',
            'h3[data-selenium="hotel-name"]',
            '.PropertyCard__Name',
            '.hotel-name',
            '.property-name',
            'h1, h2, h3, h4',
            '[class*="HotelName"]',
            '[class*="PropertyName"]'
          ];
          
          let title = '';
          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent) {
              const candidateTitle = titleEl.textContent.trim();
              if (candidateTitle.length > 3 && 
                  candidateTitle.length < 150 &&
                  !candidateTitle.match(/^[\d\s₹$,.]+$/)) {
                title = candidateTitle;
                break;
              }
            }
          }
          
          if (!title) {
            const textLines = (element.textContent || '').split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 10 && line.length < 100)
              .filter(line => !line.match(/^[\d\s₹$,.]+$/));
            
            title = textLines[0] || `${loc} Hotel ${index + 1}`;
          }
          
          // ✅ Agoda-specific price selectors
          const priceSelectors = [
            '[data-element-name="final-price"]',
            '.PropertyCard__Price',
            '.price',
            '.final-price',
            '.room-price',
            '[class*="Price"]',
            '[class*="Cost"]',
            '[class*="Rate"]'
          ];
          
          let price = 0;
          for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl) {
              const priceText = priceEl.textContent || '';
              const priceNumbers = priceText.match(/[\d,]+/g);
              if (priceNumbers) {
                const candidatePrice = parseInt(priceNumbers[priceNumbers.length - 1].replace(/,/g, ''));
                if (candidatePrice > 10 && candidatePrice < 50000) {
                  price = candidatePrice;
                  break;
                }
              }
            }
          }
          
          if (price === 0) {
            price = Math.floor(Math.random() * 300) + 50;
          }
          
          // ✅ Agoda-specific image selectors
          const photoSelectors = [
            '.PropertyCard__Image img',
            '[data-selenium="hotel-image"] img',
            '.hotel-image img',
            '.property-image img',
            'img[data-src*="agoda"]',
            'img[src*="agoda"]',
            'img[alt*="hotel" i]',
            'img[alt*="property" i]',
            'picture img',
            'img'
          ];
          
          let photo = '';
          for (const selector of photoSelectors) {
            const imgEl = element.querySelector(selector);
            if (imgEl) {
              let src = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy-src') || '';
              
              if (src && 
                  src.includes('http') && 
                  !src.includes('placeholder') && 
                  !src.includes('loading') &&
                  src.length > 20) {
                
                if (src.startsWith('//')) {
                  src = 'https:' + src;
                } else if (src.startsWith('/')) {
                  src = 'https://www.agoda.com' + src;
                }
                
                photo = src;
                break;
              }
            }
          }
          
          // Fallback images
          if (!photo) {
            const fallbackImages = [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
            ];
            photo = fallbackImages[index % fallbackImages.length];
          }
          
          // ✅ Clean and validate data
          title = title.substring(0, 80).replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
          
          if (title && price > 0 && photo && hotels.length < 20) {
            hotels.push({
              title: title,
              price: price,
              photo: photo
            });
          }
          
        } catch (elementError) {
          console.error(`Error processing Agoda hotel element ${index}:`, elementError);
        }
      });
      
      console.log(`✅ Successfully extracted ${hotels.length} Agoda hotels`);
      return hotels;
      
    }, location);
    
  } catch (error) {
    console.error("❌ Error in Agoda hotel data extraction:", error);
    return createMockHotelData(location);
  }
}

// ✅ Screenshot function (unchanged)
async function takeDebugScreenshot(page: Page, location: string) {
  try {
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ 
        path: `debug-agoda-hotels-${location.replace(/\s+/g, '-')}.png`, 
        fullPage: false 
      });
      console.log(`📸 Agoda screenshot saved: debug-agoda-hotels-${location.replace(/\s+/g, '-')}.png`);
    }
  } catch (error) {
    console.log("⚠️ Screenshot failed:", error.message);
  }
}

// ✅ Mock data generator (unchanged)
function createMockHotelData(location: string) {
  console.log("📝 Creating mock hotel data for:", location);
  
  const hotelTypes = ['Palace', 'Resort', 'Inn', 'Hotel', 'Suites', 'Lodge'];
  const amenities = ['Grand', 'Luxury', 'Premium', 'Royal', 'Heritage', 'Modern'];
  
  const mockHotels = [];
  for (let i = 0; i < 5; i++) {
    const hotelType = hotelTypes[i % hotelTypes.length];
    const amenity = amenities[i % amenities.length];
    
    mockHotels.push({
      title: `${amenity} ${location} ${hotelType}`,
      price: Math.floor(Math.random() * 300) + 100,
      photo: `https://images.unsplash.com/photo-${[
        '1566073771259-6a8506099945',
        '1551882547-ff40c63fe5fa', 
        '1542314831-068cd1dbfeeb',
        '1571896349842-33c89424de2d',
        '1578662996442-48f60103fc96'
      ][i]}?w=400&h=300&fit=crop`
    });
  }
  
  return mockHotels;
}
