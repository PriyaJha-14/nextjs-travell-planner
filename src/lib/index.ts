// src/lib/index.ts
import prisma from './prisma';
import apiClient from './api-client';

// The Redis connection is no longer exported here
export { prisma, apiClient };