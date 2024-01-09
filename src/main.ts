import axios from 'axios';
import moment, {Moment} from 'moment';
import * as readline from 'readline';

interface LocationInfo {
    city: string,
    country_name: string,
    latitude: string,
    longitude: string,
    timezone: string,
}

async function getLocationAutomaticallyFromIpAddress(): Promise<LocationInfo> {
    const ipAddressResponse = await axios.get('https://api.ipify.org?format=json');
    const ipAddress = ipAddressResponse.data.ip;
    const locationResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    return {
        city: locationResponse.data.city,
        country_name: locationResponse.data.country_name,
        latitude: locationResponse.data.latitude,
        longitude: locationResponse.data.longitude,
        timezone: locationResponse.data.timezone,
    };
}

async function getSunriseSunsetTimes(coordinates: {lat: string, lng: string, tzId: string}): Promise<[Moment, Moment]> {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${coordinates.lat}&lng=${coordinates.lng}&date=today&formatted=0&tzId=${coordinates.tzId}`);
    const sunrise = response.data.results.sunrise;
    const sunset = response.data.results.sunset;

    return [moment(sunrise), moment(sunset)];
}

function askLocation(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise<string>((resolve) => {
        rl.question('Please enter your location (or leave blank for automatic detection): ', (answer) => {
            rl.close();
            resolve(answer || "");
        });
    });
}

async function main() {
    const location = await askLocation();
    let locationInfo: LocationInfo;

    if(location === "") {
        locationInfo = await getLocationAutomaticallyFromIpAddress();
        console.log("Location was automatically determined to be: " + locationInfo.city + ", " + locationInfo.country_name);
    } else {
        // use the entered location
        const locationResponse = await axios.get(`https://api.openai.com/v4/places/search?query=${location}`);
        locationInfo = {
            city: locationResponse.data[0].place_name,
            country_name: locationResponse.data[0].country,
            latitude: locationResponse.data[0].latitude,
            longitude: locationResponse.data[0].longitude,
            timezone: locationResponse.data[0].timezone,
        };
        console.log("Location based on your input: " + locationInfo.city + ", " + locationInfo.country_name);
    }

    const [sunrise, sunset] = await getSunriseSunsetTimes({lat: locationInfo.latitude, lng: locationInfo.longitude, tzId: locationInfo.timezone});
    console.log(`Sunrise time: ${sunrise.format("HH:mm:ss")}`);
    console.log(`Sunset time: ${sunset.format("HH:mm:ss")}`);
}

main();