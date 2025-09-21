"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardBody, CardHeader } from "@heroui/react";
import dynamic from "next/dynamic";
import { ADMIN_API_ROUTES } from "@/utils/api-routes";
import { FaChartBar, FaSync } from "react-icons/fa";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ScrapingData {
  hotels: Array<{ scrappedOn: string; _count: number }>;
  flights: Array<{ scrappedOn: string; _count: number }>;
  trips: Array<{ scrapedOn: string; _count: number }>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }>;
}

const ScrapingChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Hotels 🏨",
        data: [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Flights ✈️",
        data: [],
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Trips 🎯",
        data: [],
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processData = (data: ScrapingData): ChartData => {
    const aggregation: {
      [key: string]: { hotels: number; flights: number; trips: number };
    } = {};

    // Process hotels data
    data.hotels?.forEach((item) => {
      const date = new Date(item.scrappedOn).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!aggregation[date]) {
        aggregation[date] = { hotels: 0, flights: 0, trips: 0 };
      }
      aggregation[date].hotels += item._count;
    });

    // Process flights data
    data.flights?.forEach((item) => {
      const date = new Date(item.scrappedOn).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!aggregation[date]) {
        aggregation[date] = { hotels: 0, flights: 0, trips: 0 };
      }
      aggregation[date].flights += item._count;
    });

    // Process trips data
    data.trips?.forEach((item) => {
      const date = new Date(item.scrapedOn).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!aggregation[date]) {
        aggregation[date] = { hotels: 0, flights: 0, trips: 0 };
      }
      aggregation[date].trips += item._count;
    });

    const dates = Object.keys(aggregation).sort();
    
    // ✅ If no data, create sample data to show chart structure
    if (dates.length === 0) {
      const sampleDates = ['Sep 19', 'Sep 20', 'Sep 21'];
      return {
        labels: sampleDates,
        datasets: [
          { 
            label: "Hotels 🏨", 
            data: [5, 10, 8], 
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          { 
            label: "Flights ✈️", 
            data: [3, 7, 12], 
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          { 
            label: "Trips 🎯", 
            data: [2, 4, 6], 
            backgroundColor: "rgba(139, 92, 246, 0.8)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }

    const hotels = dates.map((date) => aggregation[date].hotels);
    const flights = dates.map((date) => aggregation[date].flights);
    const trips = dates.map((date) => aggregation[date].trips);

    return {
      labels: dates,
      datasets: [
        { 
          label: "Hotels 🏨", 
          data: hotels, 
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
        { 
          label: "Flights ✈️", 
          data: flights, 
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
        { 
          label: "Trips 🎯", 
          data: trips, 
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(ADMIN_API_ROUTES.DASHBOARD_SCRAPING_CHART_DATA);
      console.log("📊 Scraping chart data:", response.data);
      
      const newData = processData(response.data);
      setChartData(newData);
    } catch (error) {
      console.error("❌ Error fetching scraping data:", error);
      setError("Failed to load chart data");
      
      // ✅ Set sample data on error so chart is still visible
      const sampleData = {
        labels: ['Sep 19', 'Sep 20', 'Sep 21'],
        datasets: [
          { 
            label: "Hotels 🏨", 
            data: [5, 10, 8], 
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          { 
            label: "Flights ✈️", 
            data: [3, 7, 12], 
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          { 
            label: "Trips 🎯", 
            data: [2, 4, 6], 
            backgroundColor: "rgba(139, 92, 246, 0.8)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
      setChartData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Enhanced chart options for better visibility
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f9fafb',
          font: {
            size: 14,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: '#6b7280',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Card className="h-[400px] bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FaChartBar className="text-blue-400 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Scraping Logs</h3>
              <p className="text-gray-400 text-sm">Data scraped over the last 30 days</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <FaSync className={`text-gray-400 hover:text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-white">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <Bar data={chartData} options={chartOptions} />
            {error && (
              <div className="mt-2 text-center">
                <p className="text-yellow-400 text-xs">⚠️ Using sample data due to API error</p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default dynamic(() => Promise.resolve(ScrapingChart), {
  ssr: false,
});
