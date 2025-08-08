// src/lib/index.ts
import prisma from './prisma';
import apiClient from './api-client';

// Remove the following lines
// import { connection } from "./redis";
// import { importQueue } from "./queue";

// Export only client-safe modules
export { prisma, apiClient };