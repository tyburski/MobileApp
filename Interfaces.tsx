export interface registerModel {
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
}

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
  routeEvents: routeEvent[];
  finished: boolean;
  currentCountry: string;
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

export interface startModel {
  vehicleId: number | undefined;
  companyId: number | undefined;
  latitude: number;
  longitude: number;
  country: string;
}
export interface finishModel {
  routeId: number | undefined;
  latitude: number;
  longitude: number;
  country: string;
}
export interface pickupModel {
  latitude: number;
  longitude: number;
  routeId: number;
  pickupCount: number;
  pickupWeight: number;
  pickupComment: string;
}

export interface refuelModel {
  latitude: number;
  longitude: number;
  routeId: number;
  refuelCount: number;
  refuelTotal: number;
  refuelCurrency: string;
  refuelType: string;
}

export interface borderModel {
  latitude: number;
  longitude: number;
  routeId: number;
  borderFrom: string;
  borderTo: string;
}

export interface dropModel {
  eventId: number;
  dropLatitude: number;
  dropLongitude: number;
}
