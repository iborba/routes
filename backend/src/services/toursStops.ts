import 'dotenv/config';
import { IOpenHours, IPosition } from "../interfaces/tourStops.interface";
import { 
  Client as GoogleMapsClient,
  DistanceMatrixRequest ,
  DirectionsRequest,
  PlaceDetailsRequest,
  OpeningPeriod
} from '@googlemaps/google-maps-services-js'
import { readFileSync } from 'fs';

export enum EUnit {
  KM = 'quilometer',
  M = 'miles',
  N = 'nautic miles'
}

export enum EMode {
  driving = "driving",
  walking = "walking",
  bicycling = "bicycling",
  transit = "transit"
}

export const weekDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

export class TourStops {
  start: IPosition;
  end: IPosition;
  stopOver: IPosition[];
  weekDay: number;
  availableUserRangeTime: IOpenHours[];

  constructor(start: IPosition, end: IPosition, stopOver: IPosition[], weekDay: number, availableUserRangeTime: IOpenHours[]) {
    this.start = start;
    this.end = end;
    this.stopOver = stopOver;
    this.weekDay = weekDay;
    this.availableUserRangeTime = availableUserRangeTime;
  }
  private apiKey = process.env.API_KEY ?? '';
  
  async fetchDistance(mode: EMode = EMode.driving) {
    const maps = new GoogleMapsClient({})
    const req: DistanceMatrixRequest = {
      params: {
        key: this.apiKey,
        origins: [this.start],
        destinations: [this.end],
        // mode: mode
      }
    }
    const result = await maps.distancematrix(req)
    // elements contains the distance from origin to distance singularly
    return result?.data
  }

  async fetchDirections() {
    const maps = new GoogleMapsClient({})
    const req: DirectionsRequest = {
      params: {
        key: this.apiKey,
        origin: this.start,
        destination: this.end,
        alternatives: true,
        waypoints: this.stopOver,
      }
    }
    const result = await maps.directions(req)
    const { geocoded_waypoints } = result?.data;

    const placesPromises = geocoded_waypoints?.map(async waypoint => {
      const place: PlaceDetailsRequest = {
        params: {
          key: this.apiKey,
          place_id: waypoint.place_id
        }
      }
      const response = await maps.placeDetails(place)

      return response?.data?.result
    })

    return await Promise.all(placesPromises)
  }

  getPopularTimesAndTimeWait(placeId: string, weekDay: number) {
    const file = readFileSync('./test/mock/popularTime.json').toString();
    const apiResponse = JSON.parse(file)
    const placeInfo = apiResponse.find((x: any) => x.id === placeId);
    const day = weekDays[weekDay];
    const popularTimes = placeInfo.populartimes?.find((x: any) => x.name.toLowerCase() === day)?.data;
    //const timeWait = placeInfo.time_wait?.find((x: any) => x.name.toLowerCase() === day)?.data;
    const response = { id: placeInfo.id, day, popularTimes }
    
    return response
  }

  getPopularTimesInsideUserTimeRange(popularTimes: [], availableUserRangeTime: IOpenHours[]) {
    return availableUserRangeTime.map(x => {
      const startTime = Math.floor(x.from / 100);
      const endTime = Math.floor(x.to / 100);

      return popularTimes.slice(startTime, endTime)
    })
  }

  async getSuggestedTimeOnEachPlace(placeId: string) {
    const file = readFileSync('./test/mock/suggestedTime.json').toString();
    const apiResponse = JSON.parse(file);
    const response = apiResponse.find((x: any) => x.id === placeId);

    return response;
  }

  placeIsOpen(periods: OpeningPeriod[]) {
    if (!periods) {
      return false;
    }

    return periods.some(period => {
      const { day: openDay, time: openTime } = period.open;
      const is24HoursOpened = openDay === 0 && openTime === '0000';

      if (!period.close || is24HoursOpened) {
        return true;
      }

      const { day: closeDay, time: closeTime } = period.close;
      
      return ((openDay === this.weekDay && closeDay === this.weekDay) && 
        (this.availableUserRangeTime.some(({to}) => parseFloat(openTime ?? '') <= to && to <= parseFloat(closeTime ?? ''))));
    })
  }

  async fetchItineraryOnRange() {
    const directions = await this.fetchDirections();
    const response: any[] = [];
    
    directions?.map(async direction => {
      const periods  = direction.opening_hours?.periods;
      if (!periods) {
        return []
      }

      const openOnRangeTime = this.placeIsOpen(periods)
      
      if (openOnRangeTime) {
        const openNow = direction.opening_hours?.open_now
        const { 
          business_status, 
          international_phone_number, 
          formatted_address,
          place_id, 
          rating, 
          types,
          name,
        } = direction
        
        const { popularTimes } = this.getPopularTimesAndTimeWait(place_id ?? '', this.weekDay)
        const onRangePopularTimes = this.getPopularTimesInsideUserTimeRange(popularTimes, this.availableUserRangeTime)[0]
        const { minimum, recommended } = await this.getSuggestedTimeOnEachPlace(place_id ?? '');

        // const distanceFromYouToPoint = TO DO
        // if (this.start.isHotel || this.end.isHotel) = DO NOT COUNT ON METRICS

        response.push({
          place_id,
          name, 
          international_phone_number,
          formatted_address,
          types,
          business_status,
          rating,
          openOnRangeTime,
          openNow,
          onRangePopularTimes,
          timePerPlace: { minimum, recommended }
        });
      }
    });

    return response
  }
}
