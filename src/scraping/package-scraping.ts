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

    const packageElement = document.querySelector("#main-container");
    const descriptionSelector = packageElement?.querySelector("#pkgOverView");
    const regex = new RegExp("Yatra", "gi");
    descriptionSelector?.querySelector(".readMore")?.click();
    packageDetails.description = packageElement
      ?.querySelector("#pkgOverView p")
      ?.innerHTML.replace(regex, "SmartScrape") as string;

    packageDetails.images = Array.from(
      packageElement?.querySelectorAll(".galleryThumbImg")
    ).map((imageElement) =>
      imageElement
        .getAttribute("src")
        ?.replace("/t_holidays_responsivedetailsthumbimg", "")
    ) as string[];


    const themesSelector = packageElement?.querySelector("#packageThemes");
    packageDetails.themes = Array.from(
      themesSelector?.querySelectorAll("li")
    ).map((li) => li.innerText.trim());


    const dayElements = packageElement?.querySelectorAll(
      ".itineraryOverlay .subtitle"
    );

    dayElements?.forEach((dayElement) => {
      const title = dayElement.textContent!.trim();
      const value = [];

      // Get the next sibling elements until the next day element
      let nextElement = dayElement.nextElementSibling;
      while (nextElement && !nextElement.classList.contains("subtitle")) {
        const textContent = nextElement.textContent!.trim();
        if (textContent) {
          value.push(textContent);
        }
        nextElement = nextElement.nextElementSibling;
      }

      // Push the title and value into the result array
      descriptions.push({ title, value });
    });
    console.log({ packageDetails });
    packageDetails.detailedIntineary = descriptions;


    return packageDetails;
  });

  const details = { ...pkg, ...packageDetails };
  return details;
};