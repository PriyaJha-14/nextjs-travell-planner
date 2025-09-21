"use client";
import React, { useEffect, useState } from "react";
import { Metrics } from "./components/metrics";
import { ScrapingChart } from "./components/scraping-chart";
import ScrapingQueue from "@/components/admin/scraping-queue/scraping-queue";
import { apiClient } from "@/lib";
import { ADMIN_API_ROUTES } from "@/utils/api-routes";
import { Architects_Daughter } from "next/font/google";
import { Button } from "@heroui/react";
import { FaSync } from "react-icons/fa";
import axios from "axios";

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

interface DashboardData {
  users: number;
  trips: number;
  flights: number;
  hotels: number;
  bookings: number;
  chartData?: any[];
  activeJobs?: number;
  totalRevenue?: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    users: 0,
    trips: 0,
    flights: 0,
    hotels: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const getData = async () => {
    try {
      setLoading(true);
      
      // ✅ Fetch main metrics
      const metricsResponse = await axios.get(ADMIN_API_ROUTES.DASHBOARD_METRICS);
      console.log("📊 Dashboard metrics:", metricsResponse.data);
      
      setData({
        users: metricsResponse.data.users || 0,
        trips: metricsResponse.data.trips || 0,
        flights: metricsResponse.data.flights || 0,
        hotels: metricsResponse.data.hotels || 0,
        bookings: metricsResponse.data.bookings || 0,
        totalRevenue: metricsResponse.data.totalRevenue || 0,
        activeJobs: 23, // You can fetch this from a separate API or include in metrics
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    
    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(getData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="m-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="m-10 flex flex-col gap-10">
      
      {/* ✅ Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold text-white ${ArchitectsDaughter.className} mb-2`}>
              SMARTSCRAPE DASHBOARD
            </h1>
            <p className="text-gray-400">The scraping engine is powered by Bright Data</p>
            <p className="text-gray-500 text-sm mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            startContent={<FaSync className="text-sm" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={getData}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ✅ Enhanced Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <Metrics 
          title="Users" 
          value={data.users} 
          icon="👥"
          color="blue"
          growth="+12%"
        />
        <Metrics 
          title="Trips" 
          value={data.trips} 
          icon="🎯"
          color="purple"
          growth="+8%"
        />
        <Metrics 
          title="Flights" 
          value={data.flights} 
          icon="✈️"
          color="red"
          growth="+15%"
        />
        <Metrics 
          title="Hotels" 
          value={data.hotels} 
          icon="🏨"
          color="green"
          growth="+5%"
        />
        <Metrics 
          title="Bookings" 
          value={data.bookings} 
          icon="📋"
          color="orange"
          growth="+23%"
        />
      </section>

      {/* ✅ Charts and Queue Section */}
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-4">
          <ScrapingChart />
        </div>
        <div className="lg:col-span-2">
          <ScrapingQueue activeJobs={data.activeJobs} />
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
