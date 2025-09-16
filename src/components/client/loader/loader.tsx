// import Loader from "./loader";
import { useAppStore } from "@/store";

import React from "react";


const Loader = () => {
    const { scrapingType } = useAppStore();
    return (
        <div 
          className="h-[100vh] w-[100vw] flex items-center justify-center flec-col gap-20 text-blue-text-title fixed top-0 right-0 bg-white z-50"
        >
          <div className="w-full flex items-center justify-center">
            <video
               src={`/loaders/${scrapingType}-loader.mp4`}
               autoPlay
               loop
               muted
               height={500}
               width={500}
            />
          </div>
          <h2 className="text-4xl uppercase animate-ping">Scraping Data</h2>

        </div>
        
        


    );
};


export default Loader;





