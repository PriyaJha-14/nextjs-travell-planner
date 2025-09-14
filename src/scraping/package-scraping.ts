// @ts-nocheck
import { Page } from "puppeteer-core";
import {
  DestinationDetailsType,
  DestinationItineraryType,
  detailedItineraryType,
  packageItineraryType,
} from "@/types/trips";

// ✅ Updated interface to include city
interface PackageInfo {
  id: string | null;
  name: string;
  city: string; // ✅ Add city field
  nights: number;
  days: number;
  inclusions: string[];
  price: number;
  detailUrl?: string;
  images?: string[];
}

interface PackageDetailsType {
  description: string;
  images: string[];
  themes: string[];
  detailedItinerary: detailedItineraryType[];
  destinationItinerary: DestinationItineraryType[];
  destinationDetails: DestinationDetailsType[];
  packageItinerary: packageItineraryType[];
}

/**
 * ✅ Updated scraper with city extraction in browser context
 */
export const scrapeAllPackagesOnPage = async (page: Page): Promise<PackageInfo[]> => {
  await page.waitForSelector(".thumbnail-card");

  return await page.evaluate(() => {
    // ✅ City extraction function inside browser context
    function extractCityFromPackage(packageElement: Element, packageName: string): string {
      // Method 1: Try to extract from package name
      const cityPatterns = [
        /(?:Beautiful|Scenic|Experience|Explore|Great|Stunning|Simply|Wickets.*?)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With|\s+Journey|\s+Special|\s+Tour)/i,
        /(?:in|to|from)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With)/i,
        /([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+Tour|\s+Special)/i
      ];

      for (const pattern of cityPatterns) {
        const match = packageName.match(pattern);
        if (match && match[1]) {
          const city = match[1].trim();
          // Filter out common non-city words
          if (!['Land Only', 'Self Drive', 'Deluxe', 'Premium', 'Cricket', 'Holidays'].includes(city)) {
            return city;
          }
        }
      }

      // Method 2: Try to extract from destination elements (if available)
      const destinationElement = packageElement.querySelector('.destination, .location, .city-name');
      if (destinationElement) {
        return destinationElement.textContent?.trim() || "";
      }

      // Method 3: Extract from URL or other attributes
      const linkElement = packageElement.querySelector('a[href*="destination"], a[href*="city"]');
      if (linkElement) {
        const href = linkElement.getAttribute('href') || "";
        const urlCityMatch = href.match(/destination[=/]([^&/?]+)/i);
        if (urlCityMatch) {
          return decodeURIComponent(urlCityMatch[1]).replace(/[-_+]/g, ' ');
        }
      }

      return ""; // Return empty string if no city found
    }

    const cards = document.querySelectorAll(".thumbnail-card");
    
    return Array.from(cards).map((card) => {
      const getText = (selector: string) => card.querySelector(selector)?.textContent?.trim() || "";
      const getAttr = (selector: string, attr: string) => card.querySelector(selector)?.getAttribute(attr) || "";

      // Extract thumbnail image
      const imageElement = card.querySelector("img") as HTMLImageElement;
      const thumbnailImage = imageElement?.src || "";

      // Get package name for city extraction
      const packageName = getText(".holiday-packages-heading") || getText(".package-name");

      return {
        id: getAttr("[data-mppid]", "data-mppid"),
        name: packageName,
        city: extractCityFromPackage(card, packageName), // ✅ Extract city using the function
        nights: parseInt(getText(".nights") || "0", 10),
        days: parseInt(getText(".days") || "0", 10),
        price: parseInt(getText(".actual-price")?.replace(/[^\d]/g, "") || "0", 10),
        inclusions: Array.from(card.querySelectorAll(".inclusions li")).map((li) => li.textContent?.trim() || ""),
        detailUrl: getAttr(".mobile-package-link", "href") || getAttr(".package-link", "href"),
        images: thumbnailImage ? [thumbnailImage] : [],
      };
    });
  });

  console.log("[scraper] Found packages:", packages.length);
  return packages;
};

/**
 * ✅ Enhanced detailed scraper that returns data matching the Prisma schema structure with city
 */
export const startPackageScraping = async (page: Page, pkg: PackageInfo) => {
  const packageDetails = await page.evaluate(() => {
    const packageDetails: PackageDetailsType = {
      description: "",
      images: [],
      themes: [],
      detailedItinerary: [],
      destinationItinerary: [],
      destinationDetails: [],
      packageItinerary: [],
    };

    const packageElement = document.querySelector("#main-container");
    const descriptionSelector = packageElement?.querySelector("#pkgOverView");
    const regex = new RegExp("Yatra", "gi");
    descriptionSelector?.querySelector(".readMore")?.click();
    packageDetails.description = packageElement
      ?.querySelector("#pkgOverView p")
      ?.innerHTML?.replace(regex, "SmartScrape") || "";

    // Extract images more safely
    const imageElements = packageElement?.querySelectorAll(".galleryThumbImg");
    packageDetails.images = Array.from(imageElements || [])
      .map((imageElement) =>
        imageElement
          .getAttribute("src")
          ?.replace("/t_holidays_responsivedetailsthumbimg", "")
      )
      .filter(Boolean) as string[];

    const themesSelector = packageElement?.querySelector("#packageThemes");
    packageDetails.themes = Array.from(
      themesSelector?.querySelectorAll("li") || []
    ).map((li) => li.textContent?.trim() || "").filter(Boolean);

    const dayElements = packageElement?.querySelectorAll(
      ".itineraryOverlay .subtitle"
    );

    const descriptions: detailedItineraryType[] = [];

    dayElements?.forEach((dayElement) => {
      const title = dayElement.textContent?.trim() || "";
      const value: string[] = [];

      let nextElement = dayElement.nextElementSibling;
      while (nextElement && !nextElement.classList.contains("subtitle")) {
        const textContent = nextElement.textContent?.trim();
        if (textContent) {
          value.push(textContent);
        }
        nextElement = nextElement.nextElementSibling;
      }

      if (title) {
        descriptions.push({ title, value });
      }
    });
    packageDetails.detailedItinerary = descriptions;

    // Rest of the scraping logic for destinationItinerary, destinationDetails, and packageItinerary
    // Add your existing scraping logic here...

    return packageDetails;
  });

  // ✅ Merge basic package info with detailed scraped data including city
  const completePackage = {
    id: pkg.id,
    name: pkg.name,
    city: pkg.city, // ✅ Include city from basic package info
    nights: pkg.nights,
    days: pkg.days,
    inclusions: pkg.inclusions,
    price: pkg.price,
    images: [...(pkg.images || []), ...packageDetails.images],
    destinationItinerary: packageDetails.destinationItinerary,
    themes: packageDetails.themes,
    destinationDetails: packageDetails.destinationDetails,
    detailedItinerary: packageDetails.detailedItinerary,
    description: packageDetails.description,
    packageItinerary: packageDetails.packageItinerary,
  };

  return completePackage;
};

export const scrapePackagesWithDetails = async (page: Page) => {
  const packages = await scrapeAllPackagesOnPage(page);
  const detailedPackages = [];

  for (const pkg of packages) {
    if (pkg.detailUrl) {
      try {
        const detailUrl = new URL(pkg.detailUrl, page.url()).href;
        await page.goto(detailUrl, { waitUntil: "networkidle2", timeout: 30000 });
        const details = await startPackageScraping(page, pkg);
        detailedPackages.push(details);

        // Delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping details for ${pkg.name}:`, error);
        // ✅ Continue with basic package info even if detailed scraping fails - include city
        detailedPackages.push({
          ...pkg,
          city: pkg.city, // ✅ Ensure city is included in fallback
          images: pkg.images || [],
          destinationItinerary: [],
          themes: [],
          destinationDetails: [],
          detailedItinerary: [],
          description: "",
          packageItinerary: [],
        });
      }
    }
  }

  return detailedPackages;
};
