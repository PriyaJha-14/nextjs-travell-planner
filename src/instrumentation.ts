import { startLocationScraping, startPackageScraping } from "./scraping";
import { startFlightScraping } from "./scraping/flights-scraping";
import { startHotelScraping } from "./scraping/hotels-scraping"; // ✅ Add hotel scraping import
import { Browser } from "puppeteer-core";
import { default as prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

console.log("🚀 instrumentation.ts loaded");

// ✅ City Extraction Function (keeping your existing logic)
function extractCityFromPackageName(packageName: string): string {
  if (!packageName) return "";

  const cityPatterns = [
    /(?:Beautiful|Scenic|Experience|Explore|Great|Stunning|Simply|Wickets.*?)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With|\s+Journey|\s+Special|\s+Tour)/i,
    /(?:in|to|from)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With)/i,
    /([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+Tour|\s+Special)/i
  ];

  for (const pattern of cityPatterns) {
    const match = packageName.match(pattern);
    if (match && match[1]) {
      let city = match[1].trim();
      
      city = city.replace(/\s+(Land Only|Self Drive|Deluxe|Premium|Cricket|Holidays|Tour|Special)$/i, '');
      
      const nonCities = ['Land Only', 'Self Drive', 'Deluxe', 'Premium', 'Cricket', 'Holidays', 'Tour', 'Special', 'Journey'];
      if (!nonCities.some(nonCity => city.toLowerCase() === nonCity.toLowerCase()) && city.length > 0) {
        return city;
      }
    }
  }

  return "";
}

export const register = async () => {
  console.log("📡 register() triggered, runtime:", process.env.NEXT_RUNTIME);

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Worker } = await import("bullmq");
    const { connection } = await import("@/lib/redis");
    const { jobsQueue } = await import("@/lib/queue");
    const puppeteer = await import("puppeteer-core");

    // ✅ Bright Data WS endpoint
    const BROWSER_WS = `wss://brd-customer-${process.env.BRIGHT_DATA_CUSTOMER}-zone-${process.env.BRIGHT_DATA_ZONE}:${process.env.BRIGHT_DATA_PASSWORD}@brd.superproxy.io:9222`;

    console.log("🔑 Bright Data creds loaded:", {
      customer: process.env.BRIGHT_DATA_CUSTOMER,
      zone: process.env.BRIGHT_DATA_ZONE,
      pass: process.env.BRIGHT_DATA_PASSWORD ? "***" : "MISSING",
    });

    new Worker(
      "jobsQueue",
      async (job) => {
        let browser: Browser | undefined;
        let page: any;

        console.log(`👷 Worker picked up job:`, {
          id: job.data.id,
          type: job.data.jobType?.type,
          url: job.data.url,
        });

        try {
          console.log("🐞 1. Attempting Puppeteer connect...");
          browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS,
          });
          console.log("🌍 2. Puppeteer Browser connected.");

          page = await browser.newPage();
          console.log("📄 3. New Page opened.");

          await page.setViewport({ width: 1366, height: 768 });
          console.log("✅ 4. Viewport set.");

          try {
            await page.goto(job.data.url, {
              timeout: 10000000,
              waitUntil: "networkidle2",
            });
            console.log("🌍 5. Navigated to:", job.data.url);
          } catch (navErr) {
            console.error("❌ Navigation failed!", navErr);
            throw navErr;
          }

          // Handle job types
          if (job.data.jobType.type === "location") {
            // ✅ Keep your existing trip scraping logic intact
            console.log("📌 6. Starting location scrape...");
            await page.waitForSelector(".packages-container", { timeout: 6000000 });
            const rawPackages = await startLocationScraping(page);
            console.log(`✅ 7. Scraped ${rawPackages.length} packages from ${job.data.url}`);

            const transformedPackages = rawPackages.map(pkg => {
              const extractedCity = pkg.city || extractCityFromPackageName(pkg.name);
              
              return {
                id: pkg.id || uuidv4(),
                name: pkg.name || "Unnamed Package",
                city: extractedCity,
                nights: pkg.nights || 0,
                days: pkg.days || 0,
                destinationItinerary: JSON.stringify(pkg.destinationItinerary || []),
                images: JSON.stringify(pkg.images || []),
                inclusions: JSON.stringify(pkg.inclusions || []),
                themes: JSON.stringify(pkg.themes || []),
                price: pkg.price || 0,
                destinationDetails: JSON.stringify(pkg.destinationDetails || []),
                detailedItinerary: JSON.stringify(pkg.detailedItinerary || []),
                description: pkg.description || "",
                packageItinerary: JSON.stringify(pkg.packageItinerary || []),
                scrapedOn: new Date(),
                status: "active"
              };
            });

            for (const trip of transformedPackages) {
              try {
                await prisma.trips.create({ data: trip });
                console.log(`✅ Saved trip: ${trip.name} (${trip.id}) - City: ${trip.city || 'No city'}`);
              } catch (e) {
                if (String(e).includes('Unique constraint failed')) {
                  console.log(`⚠️ Trip ${trip.id} already exists, skipping`);
                } else {
                  console.error('❌ Failed to save trip', trip.id, e);
                }
              }
            }

            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" }
            });

          } else if (job.data.jobType.type === "package") {
            // ✅ Keep your existing package scraping logic intact
            console.log("📦 6. Starting package scrape...");
            const alreadyScraped = await prisma.trips.findUnique({
              where: { id: job.data.packageDetails.id },
            });
            
            if (!alreadyScraped) {
              const pkg = await startPackageScraping(page, job.data.packageDetails);
              console.log("✅ 7. Scraped package details:", pkg);
              
              const extractedCity = pkg.city || extractCityFromPackageName(pkg.name);
              
              const transformedPackage = {
                id: pkg.id || uuidv4(),
                name: pkg.name || "Unnamed Package",
                city: extractedCity,
                nights: pkg.nights || 0,
                days: pkg.days || 0,
                destinationItinerary: JSON.stringify(pkg.destinationItinerary || []),
                images: JSON.stringify(pkg.images || []),
                inclusions: JSON.stringify(pkg.inclusions || []),
                themes: JSON.stringify(pkg.themes || []),
                price: pkg.price || 0,
                destinationDetails: JSON.stringify(pkg.destinationDetails || []),
                detailedItinerary: JSON.stringify(pkg.detailedItinerary || []),
                description: pkg.description || "",
                packageItinerary: JSON.stringify(pkg.packageItinerary || []),
                scrapedOn: new Date(),
                status: "active"
              };

              try {
                await prisma.trips.upsert({
                  where: { id: transformedPackage.id },
                  create: transformedPackage,
                  update: transformedPackage
                });
                console.log(`✅ Saved detailed package: ${transformedPackage.name} - City: ${transformedPackage.city || 'No city'}`);
              } catch (e) {
                console.error('❌ Failed to save detailed package:', e);
              }
            }

          } else if (job.data.jobType.type === "flight") {
            // ✅ Keep your existing flight scraping logic intact
            console.log("✈️ 6. Starting flight scrape...");
            console.log("Connected! Navigating to " + job.data.url);
            
            const flights = await startFlightScraping(page);
            console.log(`✅ 7. Scraped ${flights.length} flights from ${job.data.url}`);
            
            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });
            
            for (const flight of flights) {
              try {
                await prisma.flights.create({
                  data: {
                    name: flight.airlineName,
                    logo: flight.airlineLogo,
                    from: job.data.jobType.source || "",
                    to: job.data.jobType.destination || "",
                    departureTime: flight.departureTime,
                    arrivalTime: flight.arrivalTime,
                    duration: flight.flightDuration,
                    price: flight.price,
                    jobId: job.data.id,
                  },
                });
                console.log(`✅ Saved flight: ${flight.airlineName} (${job.data.jobType.source} → ${job.data.jobType.destination})`);
              } catch (e) {
                console.error('❌ Failed to save flight:', flight.airlineName, e);
              }
            }

          } else if (job.data.jobType.type === "hotels") {
            // ✅ Add hotel scraping logic from YouTube reference
            console.log("🏨 6. Starting hotel scrape...");
            console.log("Connected! Navigating to " + job.data.url);
            
            await page.goto(job.data.url, { timeout: 120000 });
            console.log("Navigated! Scraping page content...");
            
            const hotels = await startHotelScraping(
              page,
              browser,
              job.data.location
            );
            console.log(`✅ 7. Scraped ${hotels.length} hotels from ${job.data.url}`);
            console.log(`Scraping Complete, ${hotels.length} hotels found.`);
            
            // Update job status to complete
            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });
            console.log("Job Marked as complete.");
            
            // Save hotels to database
            console.log("Starting Loop for Hotels");
            for (const hotel of hotels) {
              try {
                await prisma.hotels.create({
                  data: {
                    name: hotel.title,
                    image: hotel.photo,
                    price: hotel.price,
                    jobId: job.data.id,
                    location: job.data.location.toLowerCase(),
                  },
                });
                console.log(`✅ Saved hotel: ${hotel.title} in ${job.data.location}`);
              } catch (e) {
                console.error('❌ Failed to save hotel:', hotel.title, e);
              }
            }
            console.log("COMPLETE.");

          } else {
            console.warn("⚠️ Unknown job type:", job.data.jobType);
          }
        } catch (error) {
          console.error("❌ Worker MAIN ERROR:", error);

          try {
            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "failed" },
            });
          } catch (dbError) {
            console.error("❌ Failed to update job status in DB:", dbError);
          }
        } finally {
          if (browser) {
            try {
              await browser.close();
              console.log("✅ Browser closed");
            } catch (closeErr) {
              console.error("⚠️ Error closing browser:", closeErr);
            }
          }
        }
      },
      {
        connection,
        concurrency: 10,
        removeOnComplete: { count: 5000 },
        removeOnFail: { count: 1000 },
      }
    );
  }
};
