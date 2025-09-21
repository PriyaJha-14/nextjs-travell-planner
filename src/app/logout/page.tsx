// src/app/logout/page.tsx
import { cookies } from "next/headers";
import React from "react";
import Actions from "./actions";

const Page = () => {
  async function deleteCookie() {
    "use server";
    (await cookies()).delete("access_token");
    // const cookieStore = await cookies();
    
    // // Delete the actual cookie name you're using
    // cookieStore.delete("access_token");
    
    // // Also delete any other auth cookies you might have
    // cookieStore.delete("token");
    // cookieStore.delete("refreshToken");
  }

  return <Actions deleteCookie={deleteCookie} />;
};

export default Page;
