import React, { useEffect, useState } from 'react';
import { Map, GoogleApiWrapper, Marker, Polyline } from 'google-maps-react';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const stops = [
  { lat: -1.939826787816454, lng: 30.0445426438232, name: "Nyabugogo" }, // Starting Point: Nyabugogo
  { lat: -1.9355377074007851, lng: 30.060163829002217, name: "Stop A" }, // Stop A
  { lat: -1.9358808342336546, lng: 30.08024820994666, name: "Stop B" }, // Stop B
  { lat: -1.9489196023037583, lng: 30.092607828989397, name: "Stop C" }, // Stop C
  { lat: -1.9592132952818164, lng: 30.106684061788073, name: "Stop D" }, // Stop D
  { lat: -1.9487480402200394, lng: 30.126596781356923, name: "Stop E" }, // Stop E
  { lat: -1.9365670876910166, lng: 30.13020167024439, name: "Kimironko" } // Ending Point: Kimironko
];

const averageSpeed = 20; // Average speed in km/h

const App = ({ google }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);

  const [nextStop, setNextStop] = useState('');
  const [nextStopIndex, setNextStopIndex] = useState(0);
  const [distanceToNextStop, setDistanceToNextStop] = useState('');
  const [timeToNextStop, setTimeToNextStop] = useState('');


  function getEstimatedTime(results, averageSpeed) {
    // Calculate estimated time based on results and averageSpeed
    let estimatedTime = 0;

    const distance = calculateTotalDistance(results);
    estimatedTime = distance / averageSpeed;

    return estimatedTime;
  }

  function calculateTotalDistance(results) {
    // Calculate the total distance based on results
    let totalDistance = 0;

    if (results.length <= 1) {
      // If there is only one result or no results, return 0 distance
      return totalDistance;
    }

    for (let i = 0; i < results.length - 1; i++) {
      const currentLocation = results[i].geometry.location;
      const nextLocation = results[i + 1].geometry.location;

      // Calculate the distance between currentLocation and nextLocation
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        currentLocation,
        nextLocation
      );
      totalDistance += distance;
    }

    return totalDistance;
  }

  useEffect(() => {
    const directionsService = new google.maps.DirectionsService();
    const placesService = new google.maps.places.PlacesService(
      document.createElement('div') // Create a temporary element to initialize the Places service
    );

    const origin = stops[0]; // Starting point
    const destination = stops[stops.length - 1]; // Ending point

    const waypoints = stops.slice(1, stops.length - 1);

    const waypointsCoordinates = waypoints.map(waypoint => ({
      location: waypoint,
      stopover: true
    }));

    const request = {
      origin,
      destination,
      waypoints: waypointsCoordinates,
      travelMode: 'DRIVING',
    };

    placesService.textSearch({ query: 'restaurants' }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Process the results from the Places service
        console.log(results);
        // Use the averageSpeed variable
        const estimatedTime = getEstimatedTime(results, averageSpeed);
        console.log("Estimated time to arrive to near place:", estimatedTime);
      }
    });

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
        if (result.routes && result.routes.length > 0) {
          const nextStep = result.routes[0].legs[0]; // Next step/leg of the route
          const distance = nextStep.distance.value; // Distance to next stop in meters
          console.log("Distance to next stop:", distance);
          console.log("Distance in kilometers:", distance / 1000); //Distance in Km
          const duration = nextStep.duration.value; // Duration to next stop in seconds

          const estimatedArrivalTime = new Date().getTime() + duration * 1000; // Estimated arrival time in milliseconds
          setEta(estimatedArrivalTime);


          setNextStop(nextStep.end_address); // Set the next stop address
          //const nextStop = stops[nextStopIndex].name; // Next stop name from the stops array
          //setNextStop(nextStop); // Set the next stop name
          setDistanceToNextStop((distance / 1000).toFixed(1)); // Set the distance to next stop in kilometers

          const estimatedTime = distance / (averageSpeed * 1000 / 60); // Calculate estimated time in minutes
          setTimeToNextStop(Math.ceil(estimatedTime)); // Round up to the nearest minute

          const updateEtaInterval = setInterval(() => {
            const currentTime = new Date().getTime(); // Current time in milliseconds
            if (currentTime >= estimatedArrivalTime) {
              clearInterval(updateEtaInterval);
              setEta(null);
            }
          }, 1000);
        }
      }
    });

    // Start tracking the driver's position
    const watchId = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setDriverPosition({ lat: latitude, lng: longitude });
      },
      error => {
        console.log('Error:', error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      // Clean up the watchPosition and updateEtaInterval when the component is unmounted
      navigator.geolocation.clearWatch(watchId);
    };
  }, [google, nextStopIndex]);


  const formatTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  return (
    <div style={{ width: "100%", backgroundColor: "#fff" }}>
      <div style={{ textAlign: 'left' }}>
        <h1>Real-time Ride-Share Tracking</h1>
        <h1>{stops[0].name} - {stops[stops.length - 1].name}</h1>

        <p>Next Stop: {nextStop}</p>
        <div style={{ display: 'flex', marginTop: '-25px' }}>
          <p style={{ paddingRight: '20px' }}>Distance: {distanceToNextStop} km</p>
          <p>Time: {timeToNextStop} minutes</p></div>
      </div>
      <div style={{}}>
        <Map
          google={google}
          zoom={13}
          style={{ width: '100%', height: '75vh' }}
          initialCenter={stops[0]}
        >
          {stops.map((stop, index) => (
            <Marker
              key={index}
              position={stop}
              label={String.fromCharCode(65 + index)} // Displaymarkers as A, B, C, ...
              title={stop.name}
              icon={{
                path: "M10 0a10 10 0 1 0 0 20a10 10 0 1 0 0-20",
                fillOpacity: 1,
                fillColor: "#fff",
                strokeWeight: 1,
                scale: 0.5,
              }}
            />
          ))}
          {directions && (
            <Polyline
              path={directions.routes[0].overview_path}
              strokeColor="#256dd7"
              strokeOpacity={0.8}
              strokeWeight={6}
            />
          )}
          {driverPosition && (
            <Marker
              position={driverPosition}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                anchor: new google.maps.Point(16, 16),
                scaledSize: new google.maps.Size(32, 32)
              }}
            />
          )}
          {eta && (
            <Marker
              position={stops[1]} // Display ETA marker at the next stop
              label={formatTime(eta)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                anchor: new google.maps.Point(16, 16),
                scaledSize: new google.maps.Size(32, 32)
              }}
            />
          )}
        </Map>
      </div>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: apiKey,
  libraries: ['places'] // Include the 'places' library
})(App);
