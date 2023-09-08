import 'dotenv/config';
import { IOpenHours, IPosition } from "../interfaces/tourStops.interface";
import { 
  Client as GoogleMapsClient,
  DistanceMatrixRequest ,
  DirectionsRequest,
  PlaceDetailsRequest
} from '@googlemaps/google-maps-services-js'

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

  async fetchItineraryOnRange(start: IPosition, end: IPosition, stopOver: IPosition[], weekDay: number, availableUserRangeTime: IOpenHours[]) {
    const directions = await this.fetchDirections(start, end, stopOver)
    const response = {}

    directions?.map(direction => {
      Object.assign(response, {
        business_status: direction.business_status,
        place_id: direction.place_id,
        rating: direction.rating,
        permanently_closed: direction.permanently_closed
      })

      const checktime = (timeFrom: number, timeTo: number, availableRange: IOpenHours[]) => {
        return availableRange.find(a => a.from >= timeFrom && a.to <= timeTo)
      }

      const isOpen = direction.opening_hours?.periods.find(x => {
      //   const placeOpenTime = parseFloat(x.open?.time ?? '');
      //   const placeCloseTime = parseFloat(x.close?.time ?? '');

      //   return (x.open?.day === weekDay && x.close?.day === weekDay) && 
      //   checktime(placeOpenTime, placeCloseTime, availableUserRangeTime)
      })
      console.log(response, direction.opening_hours?.periods)
    })
  }
}