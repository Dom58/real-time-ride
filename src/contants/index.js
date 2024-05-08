const stops = [
    { lat: -1.939826787816454, lng: 30.0445426438232, name: "Nyabugogo" }, // Starting Point: Nyabugogo
    { lat: -1.9355377074007851, lng: 30.060163829002217, name: "Stop A" }, // Stop A
    { lat: -1.9358808342336546, lng: 30.08024820994666, name: "Stop B" }, // Stop B
    { lat: -1.9489196023037583, lng: 30.092607828989397, name: "Stop C" }, // Stop C
    { lat: -1.9592132952818164, lng: 30.106684061788073, name: "Stop D" }, // Stop D
    { lat: -1.9487480402200394, lng: 30.126596781356923, name: "Stop E" }, // Stop E
    { lat: -1.9365670876910166, lng: 30.13020167024439, name: "Kimironko" } // Ending Point: Kimironko
];

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const averageSpeed = 20; // Average speed in km/h

export {
    stops,
    apiKey,
    averageSpeed
}
