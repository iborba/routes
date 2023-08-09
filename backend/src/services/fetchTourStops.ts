const currentTime = new Date()
const timeRangeAvailable = { from: new Date('2023-08-08 10:00'), to: new Date('2023-08-08 20:00') }
const travelMode = { name: 'car' }
const isCustomRoute = false

const fetchTourStops = async () => {
  return {
    userPosition: { lat: 34.84555, lng: -111.8035 },
    stops: [
      {
        position: { lat: 34.8791806, lng: -111.8265049 },
        title: "Boynton Pass",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: 34.8559195, lng: -111.7988186 },
        title: "Airport Mesa",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: 34.832149, lng: -111.7695277 },
        title: "Chapel of the Holy Cross",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: 34.823736, lng: -111.8001857 },
        title: "Red Rock Crossing",
        openHours: { from: 10, to: 18 },
      },
      {
        position: { lat: 34.800326, lng: -111.7665047 },
        title: "Bell Rock",
        openHours: { from: 8, to: 17 },
      },
    ]
  }
}

export default fetchTourStops
