const PI2 = 2 * Math.PI;

const nf3 = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const nf4 = Intl.NumberFormat('sk', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nf6 = Intl.NumberFormat('sk', { minimumFractionDigits: 6, maximumFractionDigits: 6 });

export function formatGpsCoord(angle, cardinals, style = 'DMS') {
  let cardinal = '';
  if (cardinals) {
    cardinal = cardinals[angle < 0 ? 0 : 1] + ' ';
    angle = Math.abs(angle);
  }

  switch (style) {
    case 'DMS': {
      const degrees = Math.floor(angle);
      const minutes = Math.floor((angle - degrees) * 60);
      const seconds = nf3.format((angle - degrees - minutes / 60) * 3600);
      return `${cardinal}${degrees}° ${minutes}' ${seconds}"`;
    }
    case 'DM': {
      const degrees = Math.floor(angle);
      const minutes = nf4.format((angle - degrees) * 60);
      return `${cardinal}${degrees}° ${minutes}'`;
    }
    case 'D': {
      return `${cardinal}${nf6.format(angle)}°`;
    }
  }
}

export function distance(lat1, lon1, lat2, lon2) {
  const a = 0.5 - Math.cos(toRad(lat2 - lat1)) / 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * (1 - Math.cos(toRad(lon2 - lon1))) / 2;
  return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return PI2 - ((Math.atan2(y, x) + PI2) % PI2);
}

export function toRad(deg) {
  return deg * Math.PI / 180;
}

export function getCurrentPosition() {
  const options = {
    enableHighAccuracy: true,
    timeout: 2000,
    maximumAge: 0
  };

  return new Promise(function(resolve, reject) {
    //resolve({ lat: 48.786170, lon: 19.496098 });
    const onSuccess = (pos) => {
      resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };

    const onError = (error) => {
      reject(error);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  });
}

export function isInside(mapBoundsFromState, point) {
  const { south, west, north, east } = mapBoundsFromState;
  const bounds = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));
  const pos = L.latLng(point.lat, point.lon);
  return (bounds.contains(pos));
}

export function area(points) {
  const geojsonArea = require('@mapbox/geojson-area');
  const geometry = {
    "type": "Polygon",
    "coordinates": [ [ ...points, points[0] ].map(({ lat, lon }) => [ lon, lat ]) ]
  };
  return geojsonArea.geometry(geometry);
}
