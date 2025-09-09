// Corrected code for src/utils/api-routes.ts
const baseRoute = `${process.env.NEXT_PUBLIC_DOMAIN}/api`;

export const ADMIN_API_ROUTES = {
    LOGIN: `${baseRoute}/api/admin/login`,
    CREATE_JOB: `${baseRoute}/admin/create-job`,
    JOB_DETAILS: `${baseRoute}/admin/jobs`, // Assuming this is the correct URL
};


export const USER_API_ROUTES = {
    GET_ALL_TRIPS: `${baseRoute}/all-trips`,
    GET_CITY_TRIPS: `${baseRoute}/city-trips`,
    GET_TRIP_DATA: `${baseRoute}/trips`,
    LOGIN: `${baseRoute}/auth/login`,
    SIGNUP: `${baseRoute}/auth/signup`,
    ME: `${baseRoute}/auth/me`,
    CREATE_BOOKING: `${baseRoute}/booking`,
    GET_USER_BOOKINGS: `${baseRoute}/booking/get-bookings`,
};

