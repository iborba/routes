import { IPosition } from "../interfaces/tourStops.interface";
import { 
  Client as GoogleMapsClient,
  LatLng,
  DistanceMatrixRequest 
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

  async fetchDistance(start: IPosition, end: IPosition, mode: EMode = EMode.driving) {
    const maps = new GoogleMapsClient({})
    const req: DistanceMatrixRequest = {
      params: {
        origins: [{ lat: start.lat, lng: start.lng }],
        key: 'ANYKEY',
        destinations: [{ lat: end.lat, lng: end.lng }],
        // mode: mode
      }
    }
    const result = await maps.distancematrix(req)
    console.log(result.data.rows)
    return result
  }
}