import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

// import { NextResponse } from "next/server";
// import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  let trips = [];
  if (city) {
    // If city is part of details array, adjust as needed for your scraped structure
    trips = await prisma.trips.findMany();
    trips = trips.filter(trip =>
      JSON.stringify(trip.destinationDetails).toLowerCase().includes(city.toLowerCase())
    );
  } else {
    trips = await prisma.trips.findMany();
  }
  return NextResponse.json({ trips }, { status: 200 });
}

