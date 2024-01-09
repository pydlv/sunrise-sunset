import axios from 'axios';
import moment, {Moment} from 'moment';
import {askLocation, getLocationInfo} from "./location";

async function getSunriseSunsetTimes(coordinates: {lat: string, lng: string, tzId: string}): Promise<[Moment, Moment]> {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${coordinates.lat}&lng=${coordinates.lng}&date=today&formatted=0&tzId=${coordinates.tzId}`);
    const sunrise = response.data.results.sunrise;
    const sunset = response.data.results.sunset;

    return [moment(sunrise), moment(sunset)];
}

async function main() {
    const location = await askLocation();
    const locationInfo = await getLocationInfo(location);
    const [sunrise, sunset] = await getSunriseSunsetTimes({lat: locationInfo.latitude, lng: locationInfo.longitude, tzId: locationInfo.timezone});
    console.log(`Sunrise time: ${sunrise.format("HH:mm:ss")}`);
    console.log(`Sunset time: ${sunset.format("HH:mm:ss")}`);
}

main();