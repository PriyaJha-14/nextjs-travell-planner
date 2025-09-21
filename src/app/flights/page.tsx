"use client";
import { apiClient } from "@/lib";
import { useAppStore } from "@/store";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { Button } from "@heroui/react";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { MdOutlineFlight } from "react-icons/md";

const Flights = () => {
  const router = useRouter();
  const getRandomNumber = () => Math.floor(Math.random() * 41);
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const { scrapedFlights, userInfo } = useAppStore();

  // ✅ Your existing booking logic - UNCHANGED
  const bookFlight = async (flightId: number) => {
    const isoDate = date
      ? new Date(date).toISOString()
      : new Date().toISOString();

    const response = await axios.post(USER_API_ROUTES.CREATE_BOOKING, {
      bookingId: flightId,
      bookingType: "flights",
      userId: userInfo?.id,
      taxes: 30,
      date: isoDate,
    });

    if (response.data.client_secret) {
      router.push(`/checkout?client_secret=${response.data.client_secret}`);
    }
  };

  // ✅ Price formatting function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* ✅ Header with beautiful styling */}
        <div className="mb-8">
          <button 
            onClick={() => router.push("/search-flights")}
            className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors mb-6"
          >
            <FaChevronLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Available Flights
          </h1>
          <p className="text-purple-200">
            {from && to ? `${from} → ${to} • ` : ''}{date ? new Date(date).toLocaleDateString() : 'Today'} • {scrapedFlights.length} flight{scrapedFlights.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* ✅ Your existing logic for empty flights - UNCHANGED */}
        {scrapedFlights.length === 0 && (
          <div className="flex items-center justify-center mt-10 min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-white mb-2">No Flights Found</h3>
              <p className="text-purple-200">Try searching for different dates or destinations.</p>
            </div>
          </div>
        )}

        {/* ✅ Beautiful flight cards with your existing logic */}
        <div className="space-y-4">
          {scrapedFlights.map((flight) => {
            const seatsLeft = getRandomNumber(); // ✅ Your existing logic - UNCHANGED
            
            return (
              <div 
                key={flight.id} 
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  
                  {/* ✅ Airline Info with your existing data */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                      {flight.logo ? (
                        <Image 
                          src={flight.logo} 
                          alt={flight.name} 
                          width={48}
                          height={48}
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`${flight.logo ? 'hidden' : ''} text-purple-600 font-bold text-xs text-center`}>
                        {flight.name.substring(0, 3).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{flight.name}</h3>
                      <p className="text-purple-200 text-sm">{flight.from} → {flight.to}</p>
                    </div>
                  </div>

                  {/* ✅ Flight Details with beautiful design */}
                  <div className="flex items-center space-x-8">
                    
                    {/* Departure */}
                    <div className="text-center">
                      <p className="text-sm text-purple-200 uppercase tracking-wide">From</p>
                      <p className="text-2xl font-bold text-white">{flight.departureTime}</p>
                      <p className="text-sm text-purple-300">{flight.from}</p>
                    </div>

                    {/* ✅ Beautiful Flight Path */}
                    <div className="flex items-center space-x-3 min-w-[120px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-400 to-blue-400"></div>
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full">
                        <MdOutlineFlight className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <p className="text-sm text-purple-200 uppercase tracking-wide">To</p>
                      <p className="text-2xl font-bold text-white">{flight.arrivalTime}</p>
                      <p className="text-sm text-purple-300">{flight.to}</p>
                    </div>
                  </div>

                  {/* ✅ Price & Book Section with your existing logic */}
                  <div className="text-center md:text-right space-y-3">
                    <div>
                      <p className="text-sm text-purple-200">Duration</p>
                      <p className="text-white font-semibold">{flight.duration}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {/* ✅ Your existing price logic with discount - UNCHANGED */}
                      <div className="text-right">
                        <div className="text-sm text-purple-300 line-through">
                          {formatPrice(flight.price + 140)}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            {formatPrice(flight.price)}
                          </div>
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-semibold">
                            20% OFF
                          </span>
                        </div>
                      </div>
                      
                      {/* ✅ Your existing booking logic - UNCHANGED */}
                      <button 
                        onClick={() => {
                          if (userInfo) bookFlight(flight.id);
                        }}
                        className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {userInfo ? "Book Now" : "Login to Book"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ✅ Additional Info Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center justify-between text-sm text-purple-200">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>Refundable $5 ecash</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Economy • Boeing 787</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Non-stop</span>
                      </span>
                    </div>
                    
                    {/* ✅ Your existing seats logic - UNCHANGED */}
                    <div className={`text-xs font-medium ${seatsLeft > 20 ? "text-green-400" : "text-red-400"}`}>
                      Only {seatsLeft} Seats Left
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-purple-300 text-sm">
            All prices shown include taxes and fees. Prices subject to availability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Flights;
