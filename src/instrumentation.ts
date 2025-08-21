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
    // const BROWSER_WS = "wss://brd-customer-hl_b90fade8-zone-smartscrape:v1vb43yptwed@brd.superproxy.io:9222";

    const BROWSER_WS = `wss://brd-customer-${process.env.hl_9a1ef175}-zone-${process.env.smartscrape}:${process.env.ezfhjjsqay1y}@brd.superproxy.io:9222`;

    
    new Worker("jobsQueue", async (job) => {
      let browser: undefined | Browser = undefined;
      try {
        browser = await puppeteer.connect({
          browserWSEndpoint: BROWSER_WS,
        });
        const page = await browser.newPage();
        console.log("Connected! Navigating to " + job.data.url);
        await page.goto(job.data.url, { timeout: 20000 });
        console.log("Navigated! Scraping page content...");
        const html = await page.content();
        console.log(html);


        if (job.data.jobType.type === "location") {
          // await page.goto(job.data.url, { timeout: 10000 });
          // console.log("Navigated! Scraping page content...");
          await page.waitForSelector(".packages-container", { timeout: 30000 });
          const packages = await startLocationScraping(page);
          await prisma.jobs.update({
            where: { id: job.data.update },
            data: { isComplete: true, status: "complete"},
          });
          for (const pkg of packages) {
            const jobCreated = await prisma.jobs.findFirst({
              where: {
                url: `https://packages.yatra.com/holidays/intl/details.htm?packageId=${pkg?.id}`,
              },
            });
            if (!jobCreated) {
              const job = await prisma.jobs.create({
                data: {
                  url: `https://packages.yatra.com/holidays/intl/details.htm?packageId=${pkg?.id}`,
                  jobType: { type: "package" },
                },
              });
              jobsQueue.add("package", { ...job, packageDetails: pkg});
            }
          }
        } else if (job.data.jobType.type === "package") {
          console.log(job.data);
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




