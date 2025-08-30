import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { jobsQueue } from "@/lib/queue";

export async function POST(request: Request) {
  console.log("📩 Received POST /api/admin/create-job");

  try {
    const { url, jobType } = await request.json();
    console.log("Payload received:", { url, jobType });

    // Save to DB
    const response = await prisma.jobs.create({ data: { url, jobType } });
    console.log("✅ Job saved in DB with id:", response.id);

    // Add job to BullMQ queue
    await jobsQueue.add("new-location", { url, jobType, id: response.id });
    console.log("📌 Job pushed into BullMQ queue");

    return NextResponse.json({ jobCreated: true }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error in create-job API:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred.", error: error.message },
      { status: 500 }
    );
  }
}


