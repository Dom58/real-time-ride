import { Map, Polyline } from "google-maps-react";
import { formatTime } from "../helpers";

const TrackingMap = ({
    google,
    stops,
    directions,
    driverPosition,
    eta,
    Marker
}) => {

    return (
        <Map
            google={google}
            zoom={13}
            style={{ width: '100%', height: '80vh' }}
            initialCenter={stops[0]}
        >
            {stops.map((stop, index) => (
                <Marker
                    key={index}
                    position={stop}
                    label={String.fromCharCode(65 + index)}
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
                    position={stops[1]}
                    label={formatTime(eta)}
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        anchor: new google.maps.Point(16, 16),
                        scaledSize: new google.maps.Size(32, 32)
                    }}
                />
            )}
        </Map>
    );
}
export default TrackingMap;
