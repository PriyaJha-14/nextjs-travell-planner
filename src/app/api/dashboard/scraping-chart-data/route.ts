import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    // ✅ Calculate job data from your existing scraping data
    // This uses your actual scraping activities as "jobs"
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Count today's scraping activities as "active jobs"
    const [todayHotels, todayFlights, todayTrips] = await Promise.allSettled([
      prisma.hotels.count({
        where: {
          scrappedOn: {
            gte: today,
          },
        },
      }),
      prisma.flights.count({
        where: {
          scrappedOn: {
            gte: today,
          },
        },
      }),
      prisma.trips.count({
        where: {
          scrapedOn: {
            gte: today,
          },
        },
      }),
    ]);

    // Count yesterday's scraping activities as "completed jobs"
    const [yesterdayHotels, yesterdayFlights, yesterdayTrips] = await Promise.allSettled([
      prisma.hotels.count({
        where: {
          scrappedOn: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      prisma.flights.count({
        where: {
          scrappedOn: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      prisma.trips.count({
        where: {
          scrapedOn: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
    ]);

    const activeJobs = 
      (todayHotels.status === 'fulfilled' ? todayHotels.value : 0) +
      (todayFlights.status === 'fulfilled' ? todayFlights.value : 0) +
      (todayTrips.status === 'fulfilled' ? todayTrips.value : 0);

    const completedJobs = 
      (yesterdayHotels.status === 'fulfilled' ? yesterdayHotels.value : 0) +
      (yesterdayFlights.status === 'fulfilled' ? yesterdayFlights.value : 0) +
      (yesterdayTrips.status === 'fulfilled' ? yesterdayTrips.value : 0);

    const totalJobs = activeJobs + completedJobs;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return NextResponse.json(
      {
        activeJobs,
        completedJobs,
        failedJobs: 0, // You can implement failed job logic if needed
        totalJobs,
        completionRate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Jobs API error:", error);
    
    // ✅ Return default values if there's an error
    return NextResponse.json(
      {
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        totalJobs: 0,
        completionRate: 0,
      },
      { status: 200 }
    );
  }
}
