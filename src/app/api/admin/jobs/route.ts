// src/app/api/admin/jobs/route.ts
import { NextResponse } from "next/server";
import { Queue } from "bullmq";
import { connection } from "@/lib/redis";

// This queue will only be created on the server
const importQueue = new Queue("jobsQueue", {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
});

export async function GET(request: Request) {
    try {
        const activeJobs = await importQueue.getActiveCount();
        return NextResponse.json({ onGoingJobs: activeJobs }, { status: 200 });
    } catch (error) {
        console.error("Failed to retrieve job details:", error);
        return NextResponse.json(
            { message: "Failed to retrieve job details." },
            { status: 500 }
        );
    }
}