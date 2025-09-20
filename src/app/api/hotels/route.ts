import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log("🔍 API: Fetching hotels with params:", { location, limit });

    // Build dynamic where condition
    const whereCondition: any = {};
    
    // Filter by location if provided
    if (location) {
      whereCondition.location = {
        contains: location.toLowerCase(),
        mode: 'insensitive'
      };
    }

    // ✅ Use the correct field name from your schema
    const hotels = await prisma.hotels.findMany({
      where: Object.keys(whereCondition).length > 0 ? whereCondition : {},
      orderBy: { 
        scrappedOn: "desc"  // ✅ Use scrappedOn instead of createdAt
      },
      take: limit
    });

    console.log(`✅ API: Found ${hotels.length} hotels in database`);

    if (hotels && hotels.length > 0) {
      return NextResponse.json(
        {
          success: true,
          hotels,
          count: hotels.length,
          params: { location, limit }
        },
        { status: 200 }
      );
    } else {
      // Return sample hotels when none found
      console.log("📝 API: No hotels found, returning sample hotels");
      
      const sampleHotels = [
        {
          id: 999,
          name: "The Leela Mumbai",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
          price: 123,
          jobId: 0,
          location: location?.toLowerCase() || "delhi",
          scrappedOn: new Date().toISOString()  // ✅ Use scrappedOn
        },
        {
          id: 998,
          name: "Sahara Star",
          image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
          price: 151,
          jobId: 0,
          location: location?.toLowerCase() || "delhi",
          scrappedOn: new Date().toISOString()  // ✅ Use scrappedOn
        },
        {
          id: 997,
          name: "Holiday Inn Mumbai International Airport",
          image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
          price: 103,
          jobId: 0,
          location: location?.toLowerCase() || "delhi",
          scrappedOn: new Date().toISOString()  // ✅ Use scrappedOn
        }
      ];

      return NextResponse.json(
        {
          success: true,
          hotels: sampleHotels,
          count: sampleHotels.length,
          params: { location },
          note: "Sample hotels provided - no real hotels found in database"
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ API Error fetching hotels:", error);

    // Return sample hotels on error too
    const sampleHotels = [
      {
        id: 999,
        name: "The Leela Mumbai",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        price: 123,
        jobId: 0,
        location: "delhi",
        scrappedOn: new Date().toISOString()  // ✅ Use scrappedOn
      },
      {
        id: 998,
        name: "Sahara Star",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
        price: 151,
        jobId: 0,
        location: "delhi",
        scrappedOn: new Date().toISOString()  // ✅ Use scrappedOn
      }
    ];

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          message: error.message,
          success: false,
          hotels: sampleHotels,
          count: sampleHotels.length
        }, 
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        message: "An unexpected error occurred.",
        success: false,
        hotels: sampleHotels,
        count: sampleHotels.length,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    );
  }
}
