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
  activityDescription: string | SightseeingDescription[];
}

export interface DayActivity {
  activities: Activity[];
}

export interface PackageItineraryType {    // fixed typo
  city: string;
  daysActivity: DayActivity[];
}

export interface DestinationDetailsType {
  name: string;
  image: string;
  description: string;
}

export interface DetailedItineraryType {     // fixed typo
  title: string;
  value: string[];
}

export interface TripType {
  status: any;
  id: string;
  name: string;
  nights: number;
  days: number;
  // destinationItinerary: DestinationItineraryType[];
  // images: string[];
  inclusions: string[];
  // themes: string[];
  price: number;
  // destinationDetails: DestinationDetailsType[];
  // detailedItinerary: DetailedItineraryType[];   // fixed typo
  // description: string;
  // packageItinerary: PackageItineraryType[];     // fixed typo
  scrapedOn: string;
}