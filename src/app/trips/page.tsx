"use client";
import { TripType } from "@/types/trips";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { Button, Chip } from "@heroui/react";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";

const Trips = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchCity = searchParams.get("city");
  const [trips, setTrips] = useState<TripType[]>([]);

  useEffect(() => {
    const getData = async () => {
      const response = await axios.get(
        `${USER_API_ROUTES.GET_CITY_TRIPS}?city=${searchCity}`
      );
      // Only set trips with at least 1 image and name
      setTrips(
        (response.data.trips || []).filter(
          (trip: TripType) =>
            Array.isArray(trip.images) && trip.images.length > 0 && !!trip.name
        )
      );
    };
    if (searchCity) getData();
  }, [searchCity]);

  function removeHtmlTags(description: string): string {
    if (!description) return "";
    return description.replace(/<[^>]*>?/gm, "");
  }

  return (
    <div className="m-10 px-[5vw] min-h-[80vh]">
      <Button
        className="my-5"
        variant="shadow"
        color="primary"
        size="lg"
        onClick={() => router.push("/")}
      >
        <FaChevronLeft />
        Go Back
      </Button>
      {trips.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No trips found for "{searchCity}".
        </p>
      )}
      <div className="grid grid-cols-2 gap-5 text-black">
        {trips.map((trip) => {
          const tripImage =
            Array.isArray(trip.images) && trip.images.length > 0
              ? trip.images[0]
              : "/default-trip.jpg";
          return (
            <div
              key={trip.id}
              className="grid grid-cols-9 gap-5 rounded-2xl border border-neutral-300 cursor-pointer bg-white text-black opacity-100"
              onClick={() => router.push(`/trips/${trip.id}`)}
            >
              <div className="relative w-full h-48 col-span-3">
                <Image
                  src={tripImage}
                  alt={trip.name}
                  fill
                  className="rounded-2xl object-cover"
                />
              </div>
              <div className="col-span-6 pt-5 pr-5 flex flex-col gap-1">
                <h2 className="text-lg font-medium capitalize text-blue-text-title">
                  <span className="line-clamp-1">{trip.name}</span>
                </h2>
                <div>
                  <ul className="flex gap-5 w-full overflow-hidden">
                    {Array.isArray(trip.destinationDetails) &&
                      trip.destinationDetails.map((detail, index) => (
                        <li key={detail.name || index}>
                          <Chip
                            color={index % 2 === 0 ? "secondary" : "danger"}
                            variant="flat"
                          >
                            {detail.name}
                          </Chip>
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <p className="line-clamp-1">{removeHtmlTags(trip.description)}</p>
                </div>
                <div className="flex gap-4">
                  <div>{trip.days} days</div>
                  <div>{trip.nights} nights</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-text-title">{trip.id}</span>
                  <span className="text-black font-bold">
                    ₹{trip.price} / person
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Trips;
