import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    // ✅ Get basic counts
    const [users, hotels, trips, flights, bookings] = await Promise.all([
      prisma.user.count(),
      prisma.hotels.count(),
      prisma.trips.count(),
      prisma.flights.count(),
      prisma.bookings.count(),
    ]);

    // ✅ Calculate total revenue from bookings
    const revenueResult = await prisma.bookings.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        isCompleted: true, // Only count completed bookings
      },
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    return NextResponse.json(
      {
        users,
        hotels,
        trips,
        flights,
        bookings,
        totalRevenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Dashboard metrics error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}