import axios from 'axios';
import moment, {Moment} from 'moment';

async function getSunriseSunsetTimes(location: string): Promise<[Moment, Moment]> {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?location=${location}`);
    const sunrise = response.data.results.sunrise;
    const sunset = response.data.results.sunset;

    return [moment(sunrise, "h:mm:ss A"), moment(sunset, "h:mm:ss A")];
}

async function main() {
    const [sunrise, sunset] = await getSunriseSunsetTimes("London");

    console.log(`Sunrise time: ${sunrise.format("HH:mm:ss")}`);
    console.log(`Sunset time: ${sunset.format("HH:mm:ss")}`);
}

main();