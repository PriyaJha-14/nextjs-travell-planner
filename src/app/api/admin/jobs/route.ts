// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { Queue } from "bullmq";
import { connection } from "@/lib/redis.server"; // Correct path with alias

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

export async function POST(request: Request) {
    try {
        const { url, jobType } = await request.json();

        await importQueue.add("scrape-job", { url, jobType });

        return NextResponse.json({ jobAdded: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to add job to queue:", error);
        return NextResponse.json(
            { message: "Failed to add job to queue." },
            { status: 500 }
        );
    }
}