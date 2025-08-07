export const register = async () => {
    if (process.env.NEXT_RUNTIME === "node.js") {
        const { Worker } = await import("bullmq");
        // Import the connection from its correct location
        const { connection } = await import("@/lib/redis.server"); 

        new Worker("importQueue", async (job) => {console.log({ job })}, {
            connection,
            concurrency: 10,
            removeOnComplete: { count: 1000},
            removeOnFail: { count: 5000},

        });
    };
    
};