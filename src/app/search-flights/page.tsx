"use client";
import { apiClient } from "@/lib";
import { useAppStore } from "@/store";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { cityAirportCode } from "@/utils/city-airport-codes";
import { Button, Input, Listbox, ListboxItem, Card, CardBody } from "@heroui/react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { 
  FaSearch, 
  FaPlane, 
  FaCalendarAlt, 
  FaExchangeAlt, 
  FaMapMarkerAlt,
  FaGlobe,
  FaStar,
  FaClock,
  FaUsers
} from "react-icons/fa";

const SearchFlights = () => {
  const router = useRouter();
  const { setScrapingType, setScraping, setScrappedFlights } = useAppStore();
  const [source, setSource] = useState("");
  const [sourceOptions, setSourceOptions] = useState<
    { city: string; code: string }[]
  >([]);
  const [destination, setDestination] = useState("");
  const [destinationOptions, setDestinationOptions] = useState<
    { city: string; code: string }[]
  >([]);
  const [flightDate, setFlightDate] = useState("");
  const [loadingJobId, setLoadingJobId] = useState<number | undefined>(undefined);

  const startScraping = async () => {
    if (source && destination && flightDate) {
      const data = await axios.get(
        `${USER_API_ROUTES.FLIGHT_SCRAPE}?source=${source}&destination=${destination}&date=${flightDate}`
      );
      if (data.data.id) {
        setLoadingJobId(data.data.id);
        setScraping(true);
        setScrapingType("flight");
      }
    }
  };

  const jobIntervalRef = useRef<any>(undefined);

  useEffect(() => {
    if (loadingJobId) {
      const checkIfJobCompleted = async () => {
        try {
          const response = await axios.get(
            `${USER_API_ROUTES.FLIGHT_SCRAPE_STATUS}?jobId=${loadingJobId}`
          );

          if (response.data.status) {
            setScrappedFlights(response.data.flights);
            clearInterval(jobIntervalRef.current);
            setScraping(false);
            setScrapingType(undefined);
            router.push(`/flights?date=${flightDate}`);
          }
        } catch (err) {
          console.log({ err });
        }
      };

      const interval = setInterval(() => checkIfJobCompleted(), 3000);
      jobIntervalRef.current = interval;
    }

    return () => {
      if (jobIntervalRef.current) clearInterval(jobIntervalRef.current);
    };
  }, [
    flightDate,
    loadingJobId,
    router,
    setScraping,
    setScrapingType,
    setScrappedFlights,
  ]);

  const handleSourceChange = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    const matchingCities = Object.entries(cityAirportCode)
      .filter(([, city]) => city.toLowerCase().includes(lowercaseQuery))
      .map(([code, city]) => ({ code, city }))
      .slice(0, 5);
    setSourceOptions(matchingCities);
  };

  const handleDestinationChange = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    const matchingCities = Object.entries(cityAirportCode)
      .filter(([, city]) => city.toLowerCase().includes(lowercaseQuery))
      .map(([code, city]) => ({ code, city }))
      .slice(0, 5);
    setDestinationOptions(matchingCities);
  };

  const popularDestinations = [
    { city: "New York", code: "NYC", price: "$299" },
    { city: "London", code: "LHR", price: "$459" },
    { city: "Tokyo", code: "NRT", price: "$689" },
    { city: "Paris", code: "CDG", price: "$399" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/flight-search.png')] bg-cover bg-center bg-no-repeat opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-blue-300/30 animate-bounce">
        <FaPlane size={24} className="rotate-45" />
      </div>
      <div className="absolute top-32 right-20 text-purple-300/30 animate-pulse">
        <FaGlobe size={32} />
      </div>
      <div className="absolute bottom-40 left-20 text-indigo-300/30 animate-bounce delay-300">
        <FaPlane size={20} className="-rotate-12" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <FaPlane className="text-white text-2xl" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
              BOOK<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">FLIGHTS</span>
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-2">
            Discover Your Next Adventure
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find the best flight deals with Smartscrape. Get real-time data on prices, seat availability, and discounts all in one place.
          </p>
        </div>

        {/* Search Card */}
        <Card className="w-full max-w-5xl mx-auto shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardBody className="p-8">
            
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              
              {/* Source Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  From
                </label>
                <Input
                  placeholder="Departure city"
                  startContent={<FaSearch className="text-gray-400" />}
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value);
                    handleSourceChange(e.target.value);
                  }}
                  variant="bordered"
                  classNames={{
                    input: "text-white placeholder:text-gray-400",
                    inputWrapper: "bg-white/10 border-white/30 hover:border-white/50 backdrop-blur-md",
                  }}
                />
                
                {sourceOptions.length > 0 && (
                  <Card className="absolute top-full mt-2 w-full z-50 bg-white/95 backdrop-blur-md">
                    <CardBody className="p-2">
                      <Listbox
                        aria-label="Source options"
                        onAction={(key) => {
                          setSource(key as string);
                          setSourceOptions([]);
                        }}
                      >
                        {sourceOptions.map(({ city, code }) => (
                          <ListboxItem
                            key={code}
                            className="text-gray-700 hover:bg-blue-50"
                          >
                            <div className="flex justify-between">
                              <span>{city}</span>
                              <span className="text-gray-500 font-mono text-sm">{code}</span>
                            </div>
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  To
                </label>
                <Input
                  placeholder="Destination city"
                  startContent={<FaSearch className="text-gray-400" />}
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    handleDestinationChange(e.target.value);
                  }}
                  variant="bordered"
                  classNames={{
                    input: "text-white placeholder:text-gray-400",
                    inputWrapper: "bg-white/10 border-white/30 hover:border-white/50 backdrop-blur-md",
                  }}
                />
                
                {destinationOptions.length > 0 && (
                  <Card className="absolute top-full mt-2 w-full z-50 bg-white/95 backdrop-blur-md">
                    <CardBody className="p-2">
                      <Listbox
                        aria-label="Destination options"
                        onAction={(key) => {
                          setDestination(key as string);
                          setDestinationOptions([]);
                        }}
                      >
                        {destinationOptions.map(({ city, code }) => (
                          <ListboxItem
                            key={code}
                            className="text-gray-700 hover:bg-blue-50"
                          >
                            <div className="flex justify-between">
                              <span>{city}</span>
                              <span className="text-gray-500 font-mono text-sm">{code}</span>
                            </div>
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Departure Date
                </label>
                <Input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  variant="bordered"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/10 border-white/30 hover:border-white/50 backdrop-blur-md",
                  }}
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  size="lg"
                  onClick={startScraping}
                  isDisabled={!source || !destination || !flightDate}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  startContent={<FaSearch />}
                >
                  Search Flights
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-blue-300 mb-1">
                  <FaPlane size={16} />
                  <span className="text-2xl font-bold text-white">500+</span>
                </div>
                <p className="text-gray-300 text-sm">Airlines</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-300 mb-1">
                  <FaGlobe size={16} />
                  <span className="text-2xl font-bold text-white">1000+</span>
                </div>
                <p className="text-gray-300 text-sm">Destinations</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-300 mb-1">
                  <FaStar size={16} />
                  <span className="text-2xl font-bold text-white">4.8</span>
                </div>
                <p className="text-gray-300 text-sm">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-300 mb-1">
                  <FaUsers size={16} />
                  <span className="text-2xl font-bold text-white">1M+</span>
                </div>
                <p className="text-gray-300 text-sm">Happy Travelers</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Popular Destinations */}
        <div className="mt-16 max-w-5xl mx-auto w-full">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Popular Destinations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularDestinations.map((dest) => (
              <Card
                key={dest.code}
                isPressable
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setDestination(dest.code);
                  setDestinationOptions([]);
                }}
              >
                <CardBody className="p-4 text-center">
                  <h4 className="text-white font-semibold text-lg mb-1">{dest.city}</h4>
                  <p className="text-gray-300 text-sm mb-2">{dest.code}</p>
                  <p className="text-green-400 font-bold">from {dest.price}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFlights;
