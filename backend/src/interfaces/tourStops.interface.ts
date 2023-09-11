export interface IPosition {
  lat: number;
  lng: number;
  isHotel: boolean;
}

export interface IOpenHours {
  from: number;
  to: number;
}

export interface IStops {
  position: IPosition;
  label: string;
  openHours: IOpenHours;
}

export interface ITourStops {
  userPosition: IPosition;
  stops: IStops[]
}
