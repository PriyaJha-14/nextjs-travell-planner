import { Queue } from "bullmq";
import { connection } from "./redis";
export const JOBS_QUEUE_NAME = "jobsQueue";

export const jobsQueue = new Queue(JOBS_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
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