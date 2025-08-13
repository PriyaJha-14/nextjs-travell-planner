import { Page } from "puppeteer";

interface PackageInfo {
    id: string | null;
    name: string;
}

export const startLocationScarping = async (
    page: Page
): Promise<PackageInfo[]> => {
    return await page.evaluate(()=> {
        const packageElements = document.querySelectorAll(".packages-container");
        const packages: PackageInfo[] = [];
        packageElements.forEach((packageElements) => {
            const PackageInfo: PackageInfo = {
                id: null,
                name:"",
            };
            PackageInfo.name = 
            (packageElements.querySelector(".package-name a") as HTMLElement)
             .textContent || "";
        });
        return packages;
    });
};