// export const register = async () => {
//     if (process.env.NEXT_RUNTIME === "node.js") {
//         const { Worker } = await import("bullmq");
//         // Import the connection from its correct location
//         const { connection, jobsQueue } = await import("@/lib"); 

//         new Worker("jobsQueue", async (job) => {console.log({ job })}, {
//             connection,
//             concurrency: 10,
//             removeOnComplete: { count: 1000},
//             removeOnFail: { count: 5000},

//         });
//     };
    
// };

// gcode 



export const register = async () => {
    if (process.env.NEXT_RUNTIME === "node.js") {
        const { Worker } = await import("bullmq");
        const { connection } = await import("@/lib/redis.server"); 
        // Correctly import jobsQueue from the queue file
        const { jobsQueue } = await import("@/lib/queue"); 

        new Worker("jobsQueue", async (job) => { console.log({ job }) }, {
            connection: connection,
            concurrency: 10,
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        });
    }
};