export interface vehicle {
  id: number;
  licensePlate: string;
  type: string;
}

export interface company {
  id: number;
  name: string;
  email: string;
}

export interface route {
  id: number;
  userId: number;
  companyId: number;
  vehicleId: number;
  finished: boolean;
}

export interface routeEvent {
  id: number;
  routeId: number;
  eventName: string;
  date: Date;
  latitude: number;
  longitude: number;
  country: string;
  pickupCount: number | null;
  pickupWeight: number | null;
  pickupComment: string | null;
  dropDate: Date | null;
  dropLatitude: number | null;
  dropLongitude: number | null;
  refuelCount: number | null;
  refuelTotal: number | null;
  refuelCurrency: string | null;
  refuelType: string | null;
  borderFrom: string | null;
  borderTo: string | null;
}
