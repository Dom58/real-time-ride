import React, { useEffect, useState } from 'react';
import {
  GoogleApiWrapper,
  Marker
} from 'google-maps-react';
import {
  apiKey,
  averageSpeed,
  stops
} from './contants';
import { getEstimatedTime } from './helpers';
import TopNav from './components/TopNavDisplay';
import TrackingMap from './components/Map';

const App = ({ google }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);

  const [nextStop, setNextStop] = useState('');
  const [nextStopIndex, setNextStopIndex] = useState(0);
  const [distanceToNextStop, setDistanceToNextStop] = useState('');
  const [timeToNextStop, setTimeToNextStop] = useState('');

  const trackingMapFunctionalities = () => {
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
        const estimatedTime = getEstimatedTime(google, results, averageSpeed);
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
  }

  useEffect(() => {
    trackingMapFunctionalities();
  }, [google, nextStopIndex]);


  return (
    <div style={{ width: "100%", backgroundColor: "#fff" }}>
      <TopNav
        stops={stops}
        nextStop={nextStop}
        distanceToNextStop={distanceToNextStop}
        timeToNextStop={timeToNextStop}
      />
      <div style={{}}>
        <TrackingMap
          google={google}
          stops={stops}
          directions={directions}
          driverPosition={driverPosition}
          eta={eta}
          Marker={Marker}
        />
      </div>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: apiKey,
  libraries: ['places']
})(App);
