// Corrected code for src/utils/api-routes.ts
const baseRoute = `${process.env.NEXT_PUBLIC_DOMAIN}/api`;

export const ADMIN_API_ROUTES = {
    LOGIN: `${baseRoute}/api/admin/login`,
    CREATE_JOB: `${baseRoute}/admin/create-job`,
    JOB_DETAILS: `${baseRoute}/admin/jobs`, // Assuming this is the correct URL
};