import { describe, expect, test } from '@jest/globals'
import {
  TourStops
} from '../src/services/toursStops'
import { IPosition } from '../src/interfaces/tourStops.interface'

describe('routes file', () => {
  test('gets the linear distance from A to B', () => {
    const start: IPosition = { lat: -29.000, lng: 29.000 }
    const end: IPosition = { lat: -29.999, lng: 29.000 }
    const toursStops = new TourStops()
    const result = Math.floor(toursStops.fetchLinearDistance(start, end))
    
    expect(result).toEqual(111)
  })

  test.only('gets the distance from A to B', async () => {
    const start: IPosition = { lat: -29.000, lng: 29.000 }
    const end: IPosition = { lat: -29.999, lng: 29.000 }
    const toursStops = new TourStops()
    const result = await toursStops.fetchDistance(start, end)
    // console.log(result)
    expect(result).toEqual(111)
  })
})