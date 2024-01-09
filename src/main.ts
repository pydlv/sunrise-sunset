import axios from 'axios';
import moment, {Moment} from 'moment';
import * as readline from 'readline';
import {askLocation, getLocationInfo} from "./location";
import * as console from "console";

async function getSunriseSunsetTimes(coordinates: {lat: string, lng: string, tzId: string}): Promise<[Moment, Moment]> {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${coordinates.lat}&lng=${coordinates.lng}&date=today&formatted=0&tzId=${coordinates.tzId}`);
    let sunrise = moment(response.data.results.sunrise);
    let sunset = moment(response.data.results.sunset);

    if(sunset.isAfter(sunrise)) {
        sunrise.add(1, 'days');
    }

    return [sunrise, sunset];
}

async function askSleepHours(): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve =>
        rl.question('How many hours of sleep would you like (as a decimal number)? ', answer => {
            rl.close();
            resolve(parseFloat(answer));
        })
    );
}

async function main() {
    const location = await askLocation();
    const locationInfo = await getLocationInfo(location);
    const [sunrise, sunset] = await getSunriseSunsetTimes({lat: locationInfo.latitude, lng: locationInfo.longitude, tzId: locationInfo.timezone});

    const midpoint = sunset.clone().add(sunrise.diff(sunset) / 2);

    console.log(`Sunrise time: ${sunrise.format("HH:mm:ss")}`);
    console.log(`Sunset time: ${sunset.format("HH:mm:ss")}`);
    console.log(`Midpoint time: ${midpoint.format("HH:mm:ss")}`);

    const sleepHours = await askSleepHours();

    const half = sleepHours / 2;

    const bedtime = midpoint.clone().subtract(half, 'hours');
    const wakeupTime = midpoint.clone().add(half, 'hours');

    console.log(`Bedtime: ${bedtime.format("HH:mm:ss")}`);
    console.log(`Wakeup time: ${wakeupTime.format("HH:mm:ss")}`);
}

main();