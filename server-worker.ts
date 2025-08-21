
// import { register } from "./src/instrumentation";



// register().catch((err) => {
//   console.error("Worker failed to start", err);
// });



// gpt-code


import puppeteer from "puppeteer-core";
import Redis from "ioredis";

// Bright Data WebSocket endpoint
// const BROWSER_WS =
//   "wss://brd-customer-hl_9a1ef175-zone-smartscrape:ezfhjjsqay1y@brd.superproxy.io:9222";

const BROWSER_WS = `wss://brd-customer-${process.env.hl_9a1ef175}-zone-${process.env.smartscrape}:${process.env.ezfhjjsqay1y}@brd.superproxy.io:9222`;


// Connect to Redis
const redis = new Redis();

async function runWorker() {
  console.log("🚀 Worker started. Waiting for jobs...");

  while (true) {
    try {
      // 1. Fetch a job from Redis queue
      const job = await redis.lpop("scrape-jobs");
      if (!job) {
        await new Promise((res) => setTimeout(res, 2000));
        continue; // no job yet
      }

      const parsedJob = JSON.parse(job);
      console.log("📥 Job received:", parsedJob);

      // 2. Connect to Bright Data browser
      console.log("🌐 Connecting to Bright Data browser...");
      const browser = await puppeteer.connect({
        browserWSEndpoint: BROWSER_WS,
      });
      console.log("✅ Connected to Bright Data browser");

      const page = await browser.newPage();

      // 3. Navigate to URL
      console.log("🌍 Navigating to:", parsedJob.url);
      await page.goto(parsedJob.url, { waitUntil: "domcontentloaded" });

      // 4. Get page content
      const html = await page.content();
      console.log("📄 HTML length scraped:", html.length);

      // Example extraction (check if packages exist)
      const exists = await page.$(".packages-container");
      console.log(
        exists ? "✅ Packages container found!" : "❌ Packages container not found!"
      );

      // 5. Save result (for now just log)
      console.log("💾 Scrape finished for:", parsedJob.url);

      await browser.close();
    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  }
}

runWorker();
