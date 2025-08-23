// // src/app/api/admin/jobs/route.ts
// import { NextResponse } from "next/server";
// import { Queue } from "bullmq";
// import { connection } from "@/lib/redis.server";

// const importQueue = new Queue("jobsQueue", {
//   connection,
//   defaultJobOptions: {
//     attempts: 2,
//     backoff: {
//       type: "exponential",
//       delay: 5000,
//     },
//   },
// });

// // This is the added GET function
// export async function GET(request: Request) {
//   try {
//     const activeJobs = await importQueue.getActiveCount();
//     return NextResponse.json({ onGoingJobs: activeJobs }, { status: 200 });
//   } catch (error) {
//     console.error("Failed to retrieve job details:", error);
//     return NextResponse.json(
//       { message: "Failed to retrieve job details." },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { url, jobType } = await request.json();

//     await importQueue.add("scrape-job", { url, jobType });

//     return NextResponse.json({ jobAdded: true }, { status: 201 });
//   } catch (error) {
//     console.error("Failed to add job to queue:", error);
//     return NextResponse.json(
//       { message: "Failed to add job to queue." },
//       { status: 500 }
//     );
//   }
// }











import { Queue } from "bullmq";
import { connection } from "./redis";
export const JOBS_QUEUE_NAME = "jobsQueue";

export const jobsQueue = new Queue(JOBS_QUEUE_NAME, {
  connection,
  defaultJobOptions: { removeOnComplete: 1000, removeOnFail: 5000 },
});
// export const jobsQueue = new Queue("jobsQueue", {
//   connection,
//   defaultJobOptions: {
//     attempts: 2,
//     backoff: {
//       type: "exponential",
//       delay: 5000,
//     },
//   },
// });