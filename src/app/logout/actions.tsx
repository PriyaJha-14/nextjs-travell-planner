"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAppStore } from "@/store";

const Actions = ({ deleteCookie }: { deleteCookie: () => Promise<void> }) => {
  const router = useRouter();
  const { logout } = useAppStore(); // Get logout function from store

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // First clear server-side cookie
        await deleteCookie();
        
        // Then clear client-side state and storage
        logout();
        
        // Force complete page reload to clear all cached data
        window.location.href = "/";
      } catch (error) {
        console.error('Logout error:', error);
        // Even if server action fails, still clear client state
        logout();
        window.location.href = "/";
      }
    };

    handleLogout();
  }, [deleteCookie, logout]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Logging out...</p>
      </div>
    </div>
  );
};

export default Actions;
