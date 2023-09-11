import { describe, expect, test } from '@jest/globals'
import {
  TourStops
} from '../src/services/toursStops'
import { IOpenHours, IPosition } from '../src/interfaces/tourStops.interface'

describe('routes file', () => {
  let start: [number, number] 
  let end: [number, number] 
  let stopOver1: [number, number] 
  let stopOver2: [number, number] 

  beforeAll(() => {
    start = [41.90091724453351, 12.483328727167306] // Trevi
    stopOver1 = [41.891187160778465, 12.492155403494806] // Coloseo
    stopOver2 = [41.90289326191632, 12.453325781806354] // Vatican
    end = [41.88253979255042, 12.432179657081749] // hotel
  })

  test('gets the distance and complementary info from A to B points', async () => {
    const start: IPosition = { lat: -29.914371295744683, lng: -51.16139731730591 };
    const end: IPosition = { lat: -29.93014717581828, lng: -51.15973775437772 };
    const toursStops = new TourStops(start, end, [], -1, [])
    const result = await toursStops.fetchDistance()

    const { destination_addresses, origin_addresses, rows } = result

    expect(origin_addresses).toHaveLength(1)
    expect(destination_addresses).toHaveLength(1)
    expect(rows[0].elements).toHaveLength(1)
    expect(rows[0].elements[0].distance.value).toBeGreaterThan(2500)
  })

  test('fetch all directions to all points mentioned', async () => {
    const posStart: IPosition = { lat: start[0], lng: start[1] };
    const posEnd: IPosition = { lat: end[0], lng: end[1] };
    const stopOvers: IPosition[] = [
      { lat: stopOver1[0], lng: stopOver1[1] }, 
      { lat: stopOver2[0], lng: stopOver2[1] }]
    const toursStops = new TourStops(posStart, posEnd, stopOvers, -1, []) // :O

    const result = await toursStops.fetchDirections()

    expect(result).toHaveLength(4)
  })

  test.only('must ensure opening hours is between a provided time range', async () => {
    const posStart: IPosition = { lat: start[0], lng: start[1] };
    const posEnd: IPosition = { lat: end[0], lng: end[1] };
    const stopOvers: IPosition[] = [
      { lat: stopOver1[0], lng: stopOver1[1] }, 
      { lat: stopOver2[0], lng: stopOver2[1] }]
    const availableUserRangeTime: IOpenHours[] = [{from: 900, to: 1700}]
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const desiredWeekDay = weekdays.indexOf('Sun');
    const toursStops = new TourStops(posStart, posEnd, stopOvers, desiredWeekDay, availableUserRangeTime)

    const response = await toursStops.fetchItineraryOnRange()

    console.log(response)

    expect(response).toHaveLength(4)
  })
})