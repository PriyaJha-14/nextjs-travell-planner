import { Page } from "puppeteer";

interface PackageInfo {
    id: string | null;
    name: string;
}

export const startLocationScraping = async (
    page: Page
): Promise<PackageInfo[]> => {
    return await page.evaluate(()=> {
        const packageElement = document.querySelectorAll(".packages-container");
        const packages: PackageInfo[] = [];
        packageElement.forEach((packageElement) => {
            const PackageInfo: PackageInfo = {
                id: null,
                name:"",
            };
            PackageInfo.name = 
            (packageElement.querySelector(".package-name a") as HTMLElement)
             .textContent || "";
        });
        return packages;
    });
};