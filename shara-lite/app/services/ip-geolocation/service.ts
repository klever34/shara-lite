import {IPGeolocationResponse} from 'types/app';

export interface IIPGeolocationService {
  getUserIpDetails(): IPGeolocationResponse | null;
  setUserIpDetails(userIpDetails: IPGeolocationResponse): void;
}

export class IPGeolocationService implements IIPGeolocationService {
  private userIpDetails: IPGeolocationResponse | null = null;

  public getUserIpDetails() {
    return this.userIpDetails;
  }

  public setUserIpDetails(userIpDetails: IPGeolocationResponse) {
    this.userIpDetails = userIpDetails;
  }
}
