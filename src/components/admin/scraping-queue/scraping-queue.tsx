import { apiClient } from "@/lib";
import { ADMIN_APT_ROUTES } from "@/utils";
import { useEffect } from "react";
import { useState } from "react";
import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";

const ScrapingQueue = () => {
    const [onGoingJobs, setOnGoingJobs] = useState(0);

    useEffect(() => {
        const getData = async () => {
            const data = await apiClient.get(ADMIN_APT_ROUTES.JOB_DETAILS);
            setOnGoingJobs(data.data.onGoingJobs);
        };

        const interval = setInterval(() => getData(), 3000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const OnGoingJobColor = () =>{
        if (onGoingJobs <= 5) return "bg-green-500";
        else if (onGoingJobs <= 10) return "bg-orange-500";
        else return "bg-red-500";

    };

    const OnGoingJobTextColor = () => {
        if (onGoingJobs <= 5) return "text-green-500";
        else if (onGoingJobs <= 10) return "text-orange-500";
        else return "text-red-500;"

    };



    return (
    <Card className="h-full">
      <CardHeader>Current Queue</CardHeader>
      <CardBody className="flex items-center justify-center">
        <div
          className={`h-52 w-52 ${OnGoingJobColor()} rounded-full  flex items-center justify-center`}
        >
          <div className="h-44 w-44 bg-white rounded-full flex items-center justify-center">
            <h4 className={`text-6xl font-bold ${OnGoingJobTextColor()}`}>
              {onGoingJobs}
            </h4>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ScrapingQueue;

