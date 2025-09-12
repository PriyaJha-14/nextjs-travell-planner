import { startLocationScraping, startPackageScraping } from "./scraping";
import { Browser } from "puppeteer-core";
import { default as prisma } from "@/lib/prisma";

console.log("🚀 instrumentation.ts loaded");

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
            throw navErr; // propagate so status = fail
          }

          // 2. Handle job types
          if (job.data.jobType.type === "location") {
            console.log("📌 6. Starting location scrape...");
            await page.waitForSelector(".packages-container", { timeout: 6000000 });
            const rawPackages = await startLocationScraping(page);
            console.log(`✅ 7. Scraped ${rawPackages.length} packages from ${job.data.url}`);

            // Transform: ensure every field required by Trips model exists and types match!
            const transformedPackages = rawPackages.map(pkg => ({
              id: pkg.id || crypto.randomUUID(),
              name: pkg.name || "",
              nights: pkg.nights || 0,
              days: pkg.days || 0,
              destinationItinerary: pkg.destinationItinerary || [],
              images: pkg.images || [],
              inclusions: pkg.inclusions || [],
              themes: pkg.themes || [],
              price: pkg.price || 0,
              destinationDetails: pkg.destinationDetails || [],
              detailedIntineary: pkg.detailedIntineary || [],
              description: pkg.description || "",
              packageIteniary: pkg.packageIteniary || [],
              scrapedOn: new Date()
            }));

            // Save trips individually (will ALWAYS work with correct types)
            for (const trip of transformedPackages) {
              try {
                await prisma.trips.create({ data: trip });
              } catch (e) {
                // Ignore duplicate errors (unique id)
                if (!String(e).includes('Unique constraint failed')) {
                  console.error('❌ Failed to save trip', trip.id, e);
                }
              }
            }

            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" }
            });

            // enqueue new package jobs as before...
            // -- omitted for brevity --

          } else if (job.data.jobType.type === "package") {
            console.log("📦 6. Starting package scrape...");
            const alreadyScraped = await prisma.trips.findUnique({
              where: { id: job.data.packageDetails.id },
            });
            if (!alreadyScraped) {
              const pkg = await startPackageScraping(page, job.data.packageDetails);
              console.log("✅ 7. Scraped package details:", pkg);
              // Optionally save to Prisma here...
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
