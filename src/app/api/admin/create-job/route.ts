// import { NextResponse } from "next/server";
// import {prisma} from "@/lib";
// import { jobsQueue } from "../../../../lib/queue";
// export async function POST(request: Request) {
//     try{
//         const { url, jobType } = await request.json();
//         const response = await prisma.jobs.create({ data: { url, jobType } });
//         await jobsQueue.add("new location", { url, jobType, id: response.id });
//         return NextResponse.json({ jobCreated: true }, { status: 201 });

//     }catch (error) {
//         return NextResponse.json(
//             { message: "An unexpected error occurred."},
//             { status: 500}
//         );
//     }

// }



// gcode



// src/app/api/admin/create-job/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { jobsQueue } from "@/lib/queue";

// ✅ Handles POST request to create a new scraping job
export async function POST(request: Request) {
  try {
    const { url, jobType } = await request.json();

    console.log("Received request method:", request.method); // Debugging
    console.log("Payload received:", { url, jobType });       // Debugging

    // Create job in DB
    const response = await prisma.jobs.create({ data: { url, jobType: jobType.type } });

    // Add job to queue
    await jobsQueue.add("new location", {
      url,
      jobType: jobType.type,
      id: response.id,
    });

    return NextResponse.json({ jobCreated: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error in create-job API:", error); // Debugging
    return NextResponse.json(
      { message: "An unexpected error occurred.", error: error.message },
      { status: 500 }
    );
  }
}
