export interface routeEvent {
  id: number | null;
  routeId: number;
  place: string;
  eventName: string;
  date: any;
  lat: number;
  lng: number;
}

export interface vehicle {
  id: number;
  registrationNumber: string;
  addedDate: string;
  vehicleType: string;
  selected: boolean;
}
