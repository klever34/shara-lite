import RNLocation, {Location} from 'react-native-location';

export interface ILocationService {
  initialize(): Promise<boolean>;
  getLatestLocation(): Promise<Location>;
}

export class LocationService implements ILocationService {
  private initialized: boolean = false;
  private permissionGranted: boolean = false;

  private async requestPermission(): Promise<boolean> {
    if (!this.permissionGranted) {
      this.permissionGranted = await RNLocation.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'fine',
        },
      });
    }
    return this.permissionGranted;
  }

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      await RNLocation.configure({distanceFilter: 5.0});
      await this.requestPermission();
      this.initialized = true;
    }
    return this.initialized;
  }

  async getLatestLocation(): Promise<Location> {
    let location: Location | null = null;
    if ((await this.initialize()) && (await this.requestPermission())) {
      location = await RNLocation.getLatestLocation();
    }
    if (location) {
      return location;
    } else {
      throw new Error('Unable to retrieve location');
    }
  }
}
