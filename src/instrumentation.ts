// instrumentation.ts

import { startLocationScraping } from "./scraping";
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

        console.log(`👷 Worker picked up job:`, {
          id: job.data.id,
          type: job.data.jobType?.type,
          url: job.data.url,
        });

        try {
          // 1. Connect to Bright Data browser
          // 1. Connect to Bright Data browser
          browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS,
          });

          const page = await browser.newPage();
          await page.setViewport({ width: 1366, height: 768 });

          console.log("🌍 Navigating to:", job.data.url);
          await page.goto(job.data.url, {
            timeout: 30000,
            waitUntil: "domcontentloaded",
          });


          // 2. Handle job types
          if (job.data.jobType.type === "location") {
            console.log("📌 Starting location scrape...");

            await page.waitForSelector(".packages-container", { timeout: 30000 });
            const packages = await startLocationScraping(page);

            console.log(`✅ Scraped ${packages.length} packages from ${job.data.url}`);
            if (packages.length > 0) {
              console.log("📦 Sample package:", packages[0]);
            }

            // mark this job as complete
            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });

            // enqueue new package jobs
            for (const pkg of packages) {
              const packageUrl = `https://packages.yatra.com/holidays/intl/details.htm?packageId=${pkg?.id}`;
              const jobCreated = await prisma.jobs.findFirst({
                where: { url: packageUrl },


              });

              if (!jobCreated) {
                const newJob = await prisma.jobs.create({
                  data: {
                    url: packageUrl,
                    jobType: { type: "package" },
                  },
                });

                await jobsQueue.add("package", { ...newJob, packageDetails: pkg });
                console.log("🆕 Enqueued package job:", packageUrl);
              }
            }
          } else if (job.data.jobType.type === "package") {
            console.log("📦 Handling package job:", job.data.url);

            // TODO: implement package scraper
          } else {
            console.warn("⚠️ Unknown job type:", job.data.jobType);
          }
        } catch (error) {
          console.error("❌ Worker error:", error);

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
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );
  }
};
