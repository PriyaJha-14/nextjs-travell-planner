import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";
import { jobsQueue } from "../../../../lib/queue";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    // ✅ Use location-specific URL for better results
    const url = location 
      ? `https://www.kayak.co.in/hotels/${encodeURIComponent(location)}`
      : "https://www.kayak.co.in/hotels";
      
    const response = await prisma.jobs.create({
      data: { url, jobType: { type: "hotels", location } },
    });

    await jobsQueue.add("new hotel search", {
      url,
      jobType: { type: "hotels", location }, // ✅ Pass location in jobType too
      id: response.id,
      location,
    });

    return NextResponse.json(
      { msg: "Hotel scraping job started", id: response.id, location },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
