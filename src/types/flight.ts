export type DataSource = 'MANUAL' | 'IMPORTED';

export interface Flight {
  id: string;
  userId: string;
  sourceAirport: string; // IATA code (3 letters)
  destinationAirport: string; // IATA code (3 letters)
  travelDate: Date;
  flightNumber?: string;
  dataSource: DataSource;
  createdAt: Date;
}

export interface CreateFlightInput {
  sourceAirport: string;
  destinationAirport: string;
  travelDate: Date | string;
  flightNumber?: string;
  dataSource?: DataSource;
}

export interface UpdateFlightInput {
  sourceAirport?: string;
  destinationAirport?: string;
  travelDate?: Date | string;
  flightNumber?: string;
}
