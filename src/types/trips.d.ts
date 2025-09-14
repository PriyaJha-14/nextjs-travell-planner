export interface DestinationItineraryType {
  place: string;
  totalNights: number;
}

export interface SightseeingDescription {
  text: string;
  index: number;
}

export interface Activity {
  activityType: string;
  activityDescription: string | SightseeingDescription[] | string[];
}

export interface DayActivity {
  activities: Activity[];
}

export interface packageItineraryType {
  city: string;
  daysActivity: DayActivity[][];
}

export interface DestinationDetailsType {
  name: string;
  image: string;
  description: string;
}

export interface detailedItineraryType {
  title: string;
  value: string[];
}

// ✅ Updated TripType to include city
export interface TripType {
  id: string;
  name: string;
  city: string; // ✅ Add city property
  nights: number;
  days: number;
  destinationItinerary: DestinationItineraryType[];
  images: string[];
  inclusions: string[];
  themes: string[];
  price: number;
  destinationDetails: DestinationDetailsType[];
  detailedItinerary: detailedItineraryType[];
  description: string;
  packageItinerary: packageItineraryType[];
  scrapedOn: Date;
  status: string;
}

// ✅ Updated database type to include city
export interface TripFromDB {
  id: string;
  name: string;
  city: string; // ✅ Add city property
  nights: number;
  days: number;
  destinationItinerary: string; // JSON string
  images: string; // JSON string
  inclusions: string; // JSON string
  themes: string; // JSON string
  price: number;
  destinationDetails: string; // JSON string
  detailedItinerary: string; // JSON string
  description: string;
  packageItinerary: string; // JSON string
  scrapedOn: Date;
  status: string;
}

// Helper function to transform DB trip to usable trip
export const transformTripFromDB = (dbTrip: TripFromDB): TripType => {
  const safeParse = (jsonString: string, fallback: any = []) => {
    try {
      return JSON.parse(jsonString || '[]');
    } catch {
      return fallback;
    }
  };

  return {
    ...dbTrip,
    destinationItinerary: safeParse(dbTrip.destinationItinerary, []),
    images: safeParse(dbTrip.images, []),
    inclusions: safeParse(dbTrip.inclusions, []),
    themes: safeParse(dbTrip.themes, []),
    destinationDetails: safeParse(dbTrip.destinationDetails, []),
    detailedItinerary: safeParse(dbTrip.detailedItinerary, []),
    packageItinerary: safeParse(dbTrip.packageItinerary, []),
  };
};
