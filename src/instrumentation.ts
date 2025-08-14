// // import puppeteer from "puppeteer";
import { Browser } from "puppeteer";
import { startLocationScraping } from "./scraping";
import { default as prisma } from "@/lib/prisma";

export const register = async () => {
  if (process.env.NEXT_RUNTIME === "node.js") {
    const { Worker } = await import("bullmq");
    const { connection } = await import("@/lib/redis.server");
    const { jobsQueue } = await import("@/lib/queue");
    const puppeteer = await import("puppeteer");
    const BROWSER_WS = "wss://brd-customer-hl_9a1ef175-zone-smartscrape:ezfhjjsqay1y@brd.superproxy.io:9222";

    new Worker("jobsQueue", async (job) => {
      let browser: undefined | Browser = undefined;
      try {
        browser = await puppeteer.connect({
          browserWSEndpoint: BROWSER_WS,
        });
        const page = await browser.newPage();
        console.log("Connected! Navigating to " + job.data.url);
        if (job.data.jobType.type === "location") {
          await page.goto(job.data.url, { timeout: 60000 });
          console.log("Navigated! Scraping page content...");
          const packages = await startLocationScraping(page);
          console.log({ packages });
        }
      } catch (error) {
        console.log(error);
        await prisma.jobs.update({
          where: { id: job.data.id },
          data: { isComplete: true, status: "failed" },
        });
      } finally {
        await browser?.close();
        console.log("Browser closed successfully");
      }
    },
      {
        connection: connection,
        concurrency: 10,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      });
  }
};





