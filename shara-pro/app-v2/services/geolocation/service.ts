import RNLocation, {Location} from 'react-native-location';

export type {Location};

export interface IGeolocationService {
  initialize(): Promise<boolean>;
  getCurrentPosition(): Promise<Location>;
}

export class GeolocationService implements IGeolocationService {
  private initialized: boolean = false;
  private permissionGranted: boolean = false;

  private async requestPermission(): Promise<boolean> {
    if (!this.permissionGranted) {
      this.permissionGranted = await RNLocation.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'fine',
          rationale: {
            title: 'We need to access your location',
            message:
              'We use your location to help you map your customers and your business operations',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        },
      });
    }
    return this.permissionGranted;
  }

  public async initialize(): Promise<boolean> {
    if (!this.initialized) {
      await RNLocation.configure({
        distanceFilter: 5.0,
        desiredAccuracy: {android: 'highAccuracy', ios: 'best'},
      });
      await this.requestPermission();
      this.initialized = true;
    }
    return this.initialized;
  }

  public async getCurrentPosition(): Promise<Location> {
    let location: Location | null = null;
    try {
      if ((await this.initialize()) && (await this.requestPermission())) {
        location = await RNLocation.getLatestLocation();
      }
    } catch (e) {
      throw e;
    }
    if (location) {
      return location;
    } else {
      throw new Error('Unable to retrieve location');
    }
  }
}
