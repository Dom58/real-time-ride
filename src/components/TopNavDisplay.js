import Loading from "./loading/Loading"

const TopNav = ({
    stops,
    nextStop,
    distanceToNextStop,
    timeToNextStop
}) => {
    return (
        <div style={{ textAlign: 'left', padding: "10px" }}>
            <h1>Real-time Ride-Share Tracking</h1>
            {nextStop ? (
                <>
                    <h3>{stops[0].name} - {stops[stops.length - 1].name}</h3>

                    <p>Next Stop: {nextStop}</p>
                    <div style={{ display: 'flex', marginTop: '-25px' }}>
                        <p style={{ paddingRight: '20px' }}>Distance: {distanceToNextStop} km</p>
                        <p>Time: {timeToNextStop} minutes</p>
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </div>
    )
}


export default TopNav;
