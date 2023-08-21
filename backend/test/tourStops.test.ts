import { describe, expect, test } from '@jest/globals'
import {
  TourStops
} from '../src/services/toursStops'
import { IPosition } from '../src/interfaces/tourStops.interface'

describe('routes file', () => {
  let start: [number, number] 
  let end: [number, number] 
  let stopOver1: [number, number] 
  let stopOver2: [number, number] 
  beforeAll(() => {
    start = [-29.926422591896756, -51.18272191718709]
    stopOver1 = [-29.919997241552743, -51.177464787626995]
    stopOver2 = [-29.914678113869336, -51.17686397283068]
    end = [-29.918872065155803, -51.1554063005354]
  })
  test('gets the linear distance from A to B', () => {
    const start: IPosition = { lat: -29.000, lng: 29.000 }
    const end: IPosition = { lat: -29.999, lng: 29.000 }
    const toursStops = new TourStops()
    const result = Math.floor(toursStops.fetchLinearDistance(start, end))
    
    expect(result).toEqual(111)
  })

  test('gets the distance and complementary info from A to B points', async () => {
    const start: IPosition[] = [{ lat: -29.914371295744683, lng: -51.16139731730591 }]
    const end: IPosition[] = [{ lat: -29.93014717581828, lng: -51.15973775437772 }];
    const toursStops = new TourStops()
    const result = await toursStops.fetchDistance(start, end)

    const { destination_addresses, origin_addresses, rows } = result

    expect(origin_addresses).toHaveLength(1)
    expect(destination_addresses).toHaveLength(1)
    expect(rows[0].elements).toHaveLength(1)
    expect(rows[0].elements[0].distance.value).toBeGreaterThan(2500)
  })

  test('gets directions', async () => {
    const posStart: IPosition = { lat: start[0], lng: start[1] };
    const posEnd: IPosition = { lat: end[0], lng: end[1] };
    const stopOvers: IPosition[] = [
      { lat: stopOver1[0], lng: stopOver1[1] }, 
      { lat: stopOver2[0], lng: stopOver2[1] }]
    const toursStops = new TourStops()

    const result = await toursStops.fetchDirections(posStart, posEnd, stopOvers)

    // console.log(result.routes[0].legs[0].steps)
    // expect(result.geocoded_waypoints[0].types)
  })
})