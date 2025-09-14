import { startLocationScraping, startPackageScraping } from "./scraping";
import { Browser } from "puppeteer-core";
import { default as prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid'; // Import UUID properly

console.log("🚀 instrumentation.ts loaded");

// ✅ City Extraction Function
function extractCityFromPackageName(packageName: string): string {
  if (!packageName) return "";

  // Patterns to match common city names in travel package titles
  const cityPatterns = [
    // "Beautiful Munnar & Thekkady" -> "Munnar & Thekkady"
    /(?:Beautiful|Scenic|Experience|Explore|Great|Stunning|Simply|Wickets.*?)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With|\s+Journey|\s+Special|\s+Tour)/i,
    
    // "Holidays in Australia" -> "Australia"
    /(?:in|to|from)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With)/i,
    
    // "Melbourne Special" -> "Melbourne"
    /([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+Tour|\s+Special)/i
  ];

  for (const pattern of cityPatterns) {
    const match = packageName.match(pattern);
    if (match && match[1]) {
      let city = match[1].trim();
      
      // Clean up common suffixes and prefixes
      city = city.replace(/\s+(Land Only|Self Drive|Deluxe|Premium|Cricket|Holidays|Tour|Special)$/i, '');
      
      // Filter out obvious non-cities
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
            console.log("📌 6. Starting location scrape...");
            await page.waitForSelector(".packages-container", { timeout: 6000000 });
            const rawPackages = await startLocationScraping(page);
            console.log(`✅ 7. Scraped ${rawPackages.length} packages from ${job.data.url}`);

            // ✅ Transform packages to match Prisma schema exactly with city extraction
            const transformedPackages = rawPackages.map(pkg => {
              // Extract city from package name if not already extracted in scraping
              const extractedCity = pkg.city || extractCityFromPackageName(pkg.name);
              
              return {
                id: pkg.id || uuidv4(), // Use proper UUID
                name: pkg.name || "Unnamed Package",
                city: extractedCity, // ✅ Include extracted city
                nights: pkg.nights || 0,
                days: pkg.days || 0,
                // Convert arrays to JSON strings for database storage
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

            // Save trips individually with error handling
            for (const trip of transformedPackages) {
              try {
                await prisma.trips.create({ data: trip });
                console.log(`✅ Saved trip: ${trip.name} (${trip.id}) - City: ${trip.city || 'No city'}`);
              } catch (e) {
                // Handle duplicate key errors gracefully
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
            console.log("📦 6. Starting package scrape...");
            const alreadyScraped = await prisma.trips.findUnique({
              where: { id: job.data.packageDetails.id },
            });
            
            if (!alreadyScraped) {
              const pkg = await startPackageScraping(page, job.data.packageDetails);
              console.log("✅ 7. Scraped package details:", pkg);
              
              // ✅ Transform and save detailed package data with city extraction
              const extractedCity = pkg.city || extractCityFromPackageName(pkg.name);
              
              const transformedPackage = {
                id: pkg.id || uuidv4(),
                name: pkg.name || "Unnamed Package",
                city: extractedCity, // ✅ Include extracted city
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
