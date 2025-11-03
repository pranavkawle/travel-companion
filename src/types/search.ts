import { User } from './user';
import { Flight } from './flight';

export interface SearchParams {
  sourceAirport: string;
  destinationAirport: string;
  travelDate?: Date | string;
  languages?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  user: Pick<User, 'id' | 'firstName' | 'languages' | 'mobileVerified'>;
  flight: Pick<Flight, 'id' | 'sourceAirport' | 'destinationAirport' | 'travelDate'>;
  distance: number; // Days difference from search date
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
}
