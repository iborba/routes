const buildTitle = (index, title, from, to, link = '#') => {
  return `
    <b>${index}. ${title}</b>
    <br>Business hours: ${from} - ${to}
    <br><a href='${link}' target="_blank">View site page</a>
    <br><br>
    <br><a href='#' target="_blank">See routes on Google Maps</a>
  `
}

async function initMap() {
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const infoWindow = new InfoWindow();
  const tourStops = await fetchTourStops(); // use axios
  const map = new Map(document.getElementById("map"), {
    center: tourStops.userPosition,
    zoom: 12,
    mapId: 'ANYTHING',
  });

  tourStops.stops.forEach((stop, index) => {
    const pin = new PinElement({ glyph: `${index + 1}` })
    const marker = new AdvancedMarkerElement({
      position: stop.position, 
      map,
      title: buildTitle(index + 1, stop.title, stop.openHours.from, stop.openHours.to),
      content: pin.element
    })

    marker.addListener('click', ({domEvent, latLng}) => {
      const { target } = domEvent

      infoWindow.close();
      infoWindow.setContent(marker.title);
      infoWindow.open(target, marker)
    })
  })
}

initMap();