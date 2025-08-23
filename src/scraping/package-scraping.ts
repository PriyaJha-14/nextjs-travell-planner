// @ts-nocheck
import { Page } from "puppeteer-core";
import {
  DestinationDetailsType,
  DestinationItineraryType,
  DetailedIntinearyType,
  PackageIteniaryType,
} from "@/types/trips";
interface PackageInfo {
  id: string | null;
  name: string;
  nights: number;
  days: number;
  inclusions: string[];
  price: number;
}
interface PackageDetailsType {
  description: string;
  images: string[];
  themes: string[];
  detailedIntineary: DetailedIntinearyType[];
  destinationItinerary: DestinationItineraryType[];
  destinationDetails: DestinationDetailsType[];
  packageIteniary: PackageIteniaryType[];
}
export const startPackageScraping = async (page: Page, pkg: PackageInfo) => {
    const packageDetails = await page.evaluate(() => {
        const packageDetails: PackageDetailsType = {
            description: "",
            images: [],
            themes: [],
            detailedIntineary: [],
            destinationItinerary: [],
            destinationDetails: [],
            packageIteniary: [],

        };
    });

    const details = {...pkg, ...packageDetails };
    return details;
};