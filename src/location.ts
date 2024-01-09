import axios from "axios";
import readline from "readline";

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

export function askLocation(): Promise<string> {
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

export async function getLocationInfo(location: string): Promise<LocationInfo> {
    let locationInfo: LocationInfo;

    if (location === "") {
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

    return locationInfo;
}