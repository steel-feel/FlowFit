import BrokenHealthKit, { HealthValue } from 'react-native-health';
import { StepSample } from '../types/Step';

const NativeModules = require('react-native').NativeModules;
const AppleHealthKit = NativeModules.AppleHealthKit as typeof BrokenHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;

const healthKitOptions: any = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount, AppleHealthKit.Constants.Permissions.Steps],
    write: [],
  },
};

/**
 * Initializes Apple HealthKit with the required permissions.
 */
export const initHealthKit = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(healthKitOptions, (error: string) => {
      if (error) {
        reject(
          new Error('HealthKit permissions were not granted. Please enable them in Settings.'),
        );
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Fetches steps data from Apple HealthKit from the given start date.
 * @param date - The start date for the steps data query
 * @returns A promise that resolves to an array of StepSample
 */
export const getStepsData = (startDate: Date): Promise<any[]> => {
  const options: any = {
    startDate: startDate.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(options, (err: string, results: any[]) => {
      if (err) {
        reject(new Error(`Error fetching steps data: ${err}`));
      } else {
        resolve(aggregateStepsPerDay(results));
      }
    });
  });
};


function aggregateStepsPerDay(stepsDataArray: any[]): StepSample[]  {
  // Use a Map to store daily step totals.
  // The key will be the date string (YYYY-MM-DD) for internal grouping,
  // and the value will be an object containing total steps and the UTC milliseconds timestamp.
  const dailyStepsMap = new Map<string, { totalSteps: number; timestamp: number }>();

  for (const entry of stepsDataArray) {
    // Parse the startDate string to get a Date object.
    // The Date constructor correctly interprets ISO 8601 strings with timezone offsets.
    const date = new Date(entry.startDate);

    // Get the date part in YYYY-MM-DD format using UTC methods for the map key.
    // This is crucial to ensure that aggregation is consistent regardless of
    // the user's local timezone or the timezone offset in the 'startDate' string.
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed (0-11)
    const day = date.getUTCDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    // Create a new Date object representing the very beginning of the UTC day
    // for the timestamp. This ensures consistency for the 'date' value.
    const utcStartOfDay = new Date(Date.UTC(year, date.getUTCMonth(), +day, 0, 0, 0, 0));
    const timestamp = utcStartOfDay.getTime(); // Get milliseconds since epoch

    const stepsValue = entry.value;
    
    // Retrieve existing data or initialize for the current date key
    const existingData = dailyStepsMap.get(dateKey);

    if (existingData) {
      // If the date key exists, update the total steps
      existingData.totalSteps += stepsValue;
    } else {
      // If the date key doesn't exist, initialize it with current steps and timestamp
      dailyStepsMap.set(dateKey, { totalSteps: stepsValue, timestamp: timestamp });
    }
  }

  // Convert the Map into an array of DailySteps objects.
  const result: StepSample[] = [];
  for (const data of dailyStepsMap.values()) {
    result.push({ date: data.timestamp, steps: data.totalSteps });
  }
 
  // Sort the results by date (milliseconds timestamp) to ensure chronological order.
  result.sort((a, b) => a.date - b.date);
  
  return result;
}
