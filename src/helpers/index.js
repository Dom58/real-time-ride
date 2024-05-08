const calculateTotalDistance = (google, results) => {
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


function getEstimatedTime(google, results, averageSpeed) {
    // Calculate estimated time based on results and averageSpeed
    let estimatedTime = 0;

    const distance = calculateTotalDistance(google, results);
    estimatedTime = distance / averageSpeed;

    return estimatedTime;
}

const formatTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

export {
    calculateTotalDistance,
    getEstimatedTime,
    formatTime
}
