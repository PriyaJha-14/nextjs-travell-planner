/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { Page } from "puppeteer-core";

interface PackageInfo {
  id: string | null;
  name: string;
  city: string;
  nights: number;
  days: number;
  destinationItinerary: any[];
  images: string[];
  inclusions: string[];
  themes: string[];
  price: number;
  destinationDetails: any[];
  detailedItinerary: any[];
  description: string;
  packageItinerary: any[];
}

export const startLocationScraping = async (
  page: Page
): Promise<PackageInfo[]> => {
  return await page.evaluate(() => {
    // ✅ Move city extraction function INSIDE the evaluate block
    // This is crucial because page.evaluate runs in browser context
    function extractCityFromPackage(packageElement: Element, packageName: string): string {
      // Method 1: Try to extract from package name
      const cityPatterns = [
        /(?:Beautiful|Scenic|Experience|Explore|Great|Stunning|Simply|Wickets.*?)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With|\s+Journey|\s+Special|\s+Tour)/i,
        /(?:in|to|from)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+With)/i,
        /([A-Z][a-zA-Z\s&]+?)(?:\s+\(|$|\s+-|\s+Tour|\s+Special)/i
      ];

      for (const pattern of cityPatterns) {
        const match = packageName.match(pattern);
        if (match && match[1]) {
          const city = match[1].trim();
          // Filter out common non-city words
          if (!['Land Only', 'Self Drive', 'Deluxe', 'Premium', 'Cricket', 'Holidays'].includes(city)) {
            return city;
          }
        }
      }

      // Method 2: Try to extract from destination elements (if available)
      const destinationElement = packageElement.querySelector('.destination, .location, .city-name');
      if (destinationElement) {
        return destinationElement.textContent?.trim() || "";
      }

      // Method 3: Extract from URL or other attributes
      const linkElement = packageElement.querySelector('a[href*="destination"], a[href*="city"]');
      if (linkElement) {
        const href = linkElement.getAttribute('href') || "";
        const urlCityMatch = href.match(/destination[=/]([^&/?]+)/i);
        if (urlCityMatch) {
          return decodeURIComponent(urlCityMatch[1]).replace(/[-_+]/g, ' ');
        }
      }

      return ""; // Return empty string if no city found
    }

    const packageElements = document.querySelectorAll(".packages-container");
    const packages: PackageInfo[] = [];

    packageElements.forEach((packageElement) => {
      const packageName = (packageElement.querySelector(".package-name a") as HTMLElement)
        ?.textContent?.trim() || "";

      // ✅ Extract city information using the function defined above
      const extractedCity = extractCityFromPackage(packageElement, packageName);

      const packageInfo: PackageInfo = {
        id: null,
        name: packageName,
        city: extractedCity, // ✅ Add extracted city
        nights: 0,
        days: 0,
        destinationItinerary: [],
        images: [],
        inclusions: [],
        themes: [],
        price: 0,
        destinationDetails: [],
        detailedItinerary: [],
        description: "",
        packageItinerary: [],
      };

      // Extract package ID
      const nameElement = packageElement.querySelector(".package-name a") as HTMLAnchorElement;
      const href = nameElement?.getAttribute("href");
      const packageIdMatch = href?.match(/packageId=([^&]+)/);
      packageInfo.id = packageIdMatch ? packageIdMatch[1] : null;

      // Extract duration
      const durationElement = packageElement.querySelector(".package-duration");
      packageInfo.nights = parseInt(
        (durationElement?.querySelector(".nights span") as HTMLElement)
          ?.textContent?.replace(/\D/g, '') || "0", 10
      );
      packageInfo.days = parseInt(
        (durationElement?.querySelector(".days span") as HTMLElement)
          ?.textContent?.replace(/\D/g, '') || "0", 10
      );

      // Extract inclusions
      const inclusionsElement = packageElement.querySelector(".package-inclusions");
      const inclusionItems = Array.from(
        inclusionsElement?.querySelectorAll("li") || []
      ).map(
        (item) =>
          (item.querySelector(".icon-name") as HTMLElement)?.textContent?.trim() || ""
      ).filter(item => item.length > 0);
      packageInfo.inclusions = inclusionItems;

      // Extract price
      const priceElement = packageElement.querySelector(".final-price .amount");
      packageInfo.price = parseInt(priceElement?.textContent?.replace(/[^\d]/g, "") || "0", 10);

      // Extract thumbnail image
      const imageElement = packageElement.querySelector("img.package-image") as HTMLImageElement;
      if (imageElement?.src) {
        packageInfo.images = [imageElement.src];
      }

      // Extract basic description (if available)
      const summaryElement = packageElement.querySelector(".package-summary");
      packageInfo.description = summaryElement?.textContent?.trim() || "";

      packages.push(packageInfo);
    });

    return packages;
  });
};