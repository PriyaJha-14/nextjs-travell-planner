"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, CardFooter, Listbox, ListboxItem } from "@heroui/react";
import { CardBody } from "@heroui/react";
import { Tabs, Tab, Input } from "@heroui/react";
import axios from "axios";
import { ADMIN_APT_ROUTES } from "@/utils";
import { apiClient } from "@/lib";
import { ScrapingQueue } from "@/components/admin/scraping-queue";
import CurrentlyScrapingTable from "./components/currently-scraping-table/currently-scraping-table";


interface City {
  name: string;
  geonameId: number;
}


const ScrapeData = () => {
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCityId, setSelectedCityId] = useState<undefined | number>(
    undefined
  );
  
  const [selectedCityName, setSelectedCityName] = useState<undefined | string>(
    undefined
  );
const [jobs, setJobs] = useState([])
  const searchCities = async (searchString: string) => {
    const response = await axios.get(
      `https://secure.geonames.org/searchJSON?q=${searchString}&maxRows=5&username=priya&style=SHORT`
    );
    const parsed = response.data?.geonames;
    setCities(parsed ?? []);
  };
  const startScraping = async () =>{
    await apiClient.post(ADMIN_APT_ROUTES.CREATE_JOB, {
        // Change the single quotes to backticks here
        url: `https://packages.yatra.com/holidays/intl/search.htm?destination=${selectedCityName}`,
        jobType: { type: "location" },
    });
};
  
  const handleCitySelection = (key: React.Key) => {
    const selectedCityIdNumber = Number(key);
    setSelectedCityId(selectedCityIdNumber);

    
    const selectedCity = cities.find(
      (city) => city.geonameId === selectedCityIdNumber
    );

    
    if (selectedCity) {
      setSelectedCityName(selectedCity.name);
    }
  };
 useEffect(() => {
  const getData = async () => {
    const data = await apiClient.get(ADMIN_APT_ROUTES.JOB_DETAILS);
    setJobs(data.data.jobs);
  };
  const interval = setInterval(() => getData(), 3000);
  return () => {
    clearInterval(interval);
  };
 }, []);
 
  return (
    <section className="m-10 grid grid-cols-3 gap-5">
      <Card className="col-span-2">
        <CardBody>
          <Tabs>
            <Tab key="location" title="Location">
              <Input
                type="text"
                label="Search for a location"
                onChange={(e) => searchCities(e.target.value)}
              />
              <div className="w-full min-h-[200px] max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mt-5">
                {/* Use the new handler for onAction */}
                <Listbox onAction={handleCitySelection}>
                  {cities.map((city) => (
                    <ListboxItem
                      key={city.geonameId}
                      color="primary"
                      className="text-primary-500">
                      {city.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter className="flex flex-col gap-5">
          <div>
            {/* Display the selected city name */}
            {selectedCityName && (
              <h1 className="text-xl">Scrape data for {selectedCityName}</h1>
            )}
          </div>
          <Button size ="lg" className="w-full" color="primary" onClick={startScraping}> Scrape</Button>
        </CardFooter>
      </Card>
      <ScrapingQueue />
      <div className="col-span-3">
        <CurrentlyScrapingTable jobs={jobs} />
      </div>

    </section>
  );
};





export default ScrapeData;


