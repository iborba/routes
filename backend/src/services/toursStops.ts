import 'dotenv/config';
import { IOpenHours, IPosition } from "../interfaces/tourStops.interface";
import { 
  Client as GoogleMapsClient,
  DistanceMatrixRequest ,
  DirectionsRequest,
  PlaceDetailsRequest
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
  private apiKey = process.env.API_KEY ?? '';
  
  fetchLinearDistance(start: IPosition, end: IPosition, unit: EUnit = EUnit.KM) {
    const radLat1 = Math.PI * start.lat / 180;
    const radLat2 = Math.PI * end.lat / 180;

    const theta = start.lng - end.lng;
    const radTheta = Math.PI * theta / 180;

    let dist = (Math.sin(radLat1) * Math.sin(radLat2)) 
      + (Math.cos(radLat1)*Math.cos(radLat2)*Math.cos(radTheta));

    dist = dist > 1 ? 1 : dist;
    dist = Math.acos(dist)
    dist *= 180 / Math.PI
    dist *= 60 * 1.1515

    if (unit === EUnit.KM) { 
      dist *= 1.609344
    } else if (unit === EUnit.N) {
      dist *= 0.8684
    }

    return dist;
  }

  async fetchDistance(start: IPosition[], end: IPosition[], mode: EMode = EMode.driving) {
    const maps = new GoogleMapsClient({})
    const req: DistanceMatrixRequest = {
      params: {
        key: this.apiKey,
        origins: start,
        destinations: end,
        // mode: mode
      }
    }
    const result = await maps.distancematrix(req)
    // elements contains the distance from origin to distance singularly
    return result?.data
  }

  async fetchDirections(start: IPosition, end: IPosition, stopOver: IPosition[]) {
    const maps = new GoogleMapsClient({})
    const req: DirectionsRequest = {
      params: {
        key: this.apiKey,
        origin: start,
        destination: end,
        alternatives: true,
        waypoints: stopOver,
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
    const timeWait = placeInfo.time_wait?.find((x: any) => x.name.toLowerCase() === day)?.data;
    const response = { id: placeInfo.id, day, popularTimes, timeWait }
    
    return response
  }

  async fetchItineraryOnRange(start: IPosition, end: IPosition, stopOver: IPosition[], weekDay: number, availableUserRangeTime: IOpenHours[]) {
    const directions = await this.fetchDirections(start, end, stopOver);
    const response: any[] = [];
    const checktime = (timeFrom: number, timeTo: number, userAvailableTimeRange: IOpenHours[]) => {
      return userAvailableTimeRange.some(({to}) => timeFrom <= to && to <= timeTo)
    };
    let openOnRangeTime

    directions?.map(direction => {
      const periods  = direction.opening_hours?.periods;

      if (periods?.length === 1 && periods[0].open.day === 0 && periods[0].open.time === '0000') {
        openOnRangeTime = true
      } else {
        openOnRangeTime = periods?.some(period => 
          (period.open?.day === weekDay && period.close?.day === weekDay) && 
          checktime(parseFloat(period.open?.time ?? ''), parseFloat(period.close?.time ?? ''), availableUserRangeTime)
        )
      }
      
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
        
        const {popularTimes, timeWait} = this.getPopularTimesAndTimeWait(direction.place_id ?? '', weekDay)
        response.push({
          name, 
          international_phone_number,
          formatted_address,
          types,
          business_status,
          place_id,
          rating,
          openOnRangeTime,
          openNow,
          popularTimes,
          timeWait
        });
      }
    });

    console.log(response)
    return response
  }
}