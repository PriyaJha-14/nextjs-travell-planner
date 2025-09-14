// @ts-nocheck
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    if (city) {
      const allTrips = await prisma.trips.findMany();
      // FIX: Filter by checking each object in the destinationItinerary array
      const filteredTrips = allTrips.filter((trip) => {
        const destinationDetails = trip.destinationDetails as { name: string }[];
        return destinationDetails.some(
          (destination) =>
            destination.name.toLowerCase() === city.toLowerCase()
        );
      });
      if (filteredTrips) {
        return NextResponse.json({ trips: filteredTrips }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Trips not found." },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "City is required." },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
  return NextResponse.json(
    { message: "An unexpected error occurred." },
    { status: 500 }
  );
};