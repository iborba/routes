import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const apiKey = 'ANYKEY'
const containerStyle = {
  width: '100%',
  height: '400px'
};
interface Location {
  lat: number;
  lng: number;
}

interface OpenHours {
  from: number;
  to: number;
}

interface Stop {
  position: Location;
  label: string;
  openHours: OpenHours;
}

interface Title {
  stop: Stop;
  index: number;
  link: string;
}

interface MapData {
  userPosition: Location;
  stops: Stop[];
}

const Map = () => {
  const markers: MapData = {
    userPosition: { lat: -23.84555, lng: -51.8035 },
    stops: [
      {
        position: { lat: -23.8791806, lng: -51.8265049 },
        label: "Boynton Pass",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: -23.8559195, lng: -51.7988186 },
        label: "Airport Mesa",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: -23.832149, lng: -51.7695277 },
        label: "Chapel of the Holy Cross",
        openHours: { from: 8, to: 18 },
      },
      {
        position: { lat: -23.823736, lng: -51.8001857 },
        label: "Red Rock Crossing",
        openHours: { from: 10, to: 18 },
      },
      {
        position: { lat: -23.800326, lng: -51.7665047 },
        label: "Bell Rock",
        openHours: { from: 8, to: 17 },
      },
    ]
  }
  markers.stops.map((stop, index) => {
    console.log('kkk',stop, index)
  })
  const [selectedMarker, setSelectedMarker] = useState<Title | null>(null);

  const handleMarkerClick = (marker: Title) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };
  
  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markers.userPosition}
        zoom={10}
        >
        {
          markers.stops.map((stop, index) => (
            <Marker 
              key={stop.label}
              position={stop.position}
              label={stop.label}
              onClick={() => handleMarkerClick({ stop, index, link: '#' })}
            />
          ))
        }

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.stop.position}
            onCloseClick={handleInfoWindowClose}
          >
            <div>
              <b>${selectedMarker.index}. ${selectedMarker.stop.label}</b>
              <br />Business hours: ${selectedMarker.stop.openHours.from} - ${selectedMarker.stop.openHours.to}
              <br /><a href={selectedMarker.link} target="_blank" rel="noreferrer">View site page</a>
              <br /><br />
              <br /><a href='#' target="_blank">See routes on Google Maps</a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
