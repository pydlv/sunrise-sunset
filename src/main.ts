import axios from 'axios';
import moment, {Moment} from 'moment';
import * as readline from 'readline';

async function getLocationAutomaticallyFromIpAddress() {
    const ipAddressResponse = await axios.get('https://api.ipify.org?format=json');
    const ipAddress = ipAddressResponse.data.ip;
    const locationResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    return `${locationResponse.data.city}, ${locationResponse.data.country_name}`;
}

async function getSunriseSunsetTimes(location: string): Promise<[Moment, Moment]> {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?location=${location}`);
    const sunrise = response.data.results.sunrise;
    const sunset = response.data.results.sunset;

    return [moment(sunrise, "h:mm:ss A"), moment(sunset, "h:mm:ss A")];
}

function askLocation() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise<string | undefined>((resolve) => {
        rl.question('Please enter your location (or leave blank for automatic detection): ', (answer) => {
            rl.close();
            resolve(answer || undefined);
        });
    });
}

async function main() {
    let location = await askLocation();
    if(!location) {
        location = await getLocationAutomaticallyFromIpAddress();
    }

    const [sunrise, sunset] = await getSunriseSunsetTimes(location);
    console.log(`Sunrise time: ${sunrise.format("HH:mm:ss")}`);
    console.log(`Sunset time: ${sunset.format("HH:mm:ss")}`);
}

main();