"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, CardFooter, Listbox, ListboxItem, CardBody, Tabs, Tab, Input } from "@heroui/react";
import axios from "axios";
import { ADMIN_API_ROUTES } from "@/utils";
import { ScrapingQueue } from "@/components/admin/scraping-queue";
import CurrentlyScrapingTable from "./components/currently-scraping-table/currently-scraping-table";

interface City {
  name: string;
  geonameId: number;
}

const ScrapeData = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<undefined | number>(undefined);
  const [selectedCityName, setSelectedCityName] = useState<undefined | string>(undefined);
  const [jobs, setJobs] = useState<any[]>([]);

  const searchCities = async (searchString: string) => {
    setSearchValue(searchString);
    if (!searchString) {
      setCities([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(searchString)}&maxRows=5&username=priya&style=SHORT`
      );
      setCities(response.data?.geonames || []);
    } catch (e) {
      setCities([]);
    }
  };

  const startScraping = async () => {
    if (!selectedCityName) return;
    await axios.post(ADMIN_API_ROUTES.CREATE_JOB, {
      url: `https://packages.yatra.com/holidays/intl/search.htm?destination=${selectedCityName}`,
      jobType: { type: "location" },
    });
  };

  const handleCitySelection = (key: React.Key) => {
    const cityId = Number(key);
    setSelectedCityId(cityId);
    const city = cities.find((city) => city.geonameId === cityId);
    if (city) setSelectedCityName(city.name);
  };

  useEffect(() => {
    const getData = async () => {
      const data = await axios.get(ADMIN_API_ROUTES.JOB_DETAILS);
      setJobs(data.data.jobs);
    };
    const interval = setInterval(getData, 3000);
    getData(); // initial load
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="m-10 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 grid grid-cols-3 gap-6">
      <Card className="col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl flex flex-col">
        <CardBody>
          <Tabs>
            <Tab key="location" title="Location">
              <div className="mb-6">
                {/* Use placeholder instead of label to avoid overlap */}
                <Input
                  value={searchValue}
                  variant="faded"
                  placeholder="Search for a location"
                  onValueChange={searchCities}
                  className="mb-2 bg-blue-100 text-black placeholder:text-blue-900"
                  isClearable
                  fullWidth
                  aria-label="Search for a location"
                />
                <div className="w-full min-h-[120px] max-w-xs rounded-lg border border-gray-300 dark:border-gray-700 mt-5 p-4 bg-white dark:bg-gray-800 shadow-md overflow-y-auto">
                  <Listbox
                    aria-label="City results"
                    selectedKeys={selectedCityId ? [selectedCityId] : []}
                    onAction={handleCitySelection}
                  >
                    {cities.map((city) => (
                      <ListboxItem
                        key={city.geonameId}
                        color="primary"
                        className="text-primary-600 hover:underline cursor-pointer"
                      >
                        {city.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter className="flex flex-col gap-5">
          {selectedCityName && (
            <h1 className="text-xl text-center">Scrape data for {selectedCityName}</h1>
          )}
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={startScraping}
            isDisabled={!selectedCityName}
          >
            Scrape
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold mb-4">Current Queue</h2>
        <div className="h-32 w-32 rounded-full border-8 border-orange-400 flex items-center justify-center">
          <span className="text-4xl font-bold text-orange-600">{jobs.length}</span>
        </div>
      </Card>

      <div className="col-span-3 mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <CurrentlyScrapingTable jobs={jobs} />
      </div>
    </section>
  );
};

export default ScrapeData;
