import PubNub from 'pubnub';

export interface IPubNubService {
  getInstance(): PubNub | null;

  setInstance(PubNub: PubNub): void;
}

export class PubNubService implements IPubNubService {
  private pubNub: PubNub | null = null;

  public getInstance() {
    return this.pubNub;
  }

  public setInstance(pubNub: PubNub) {
    if (!this.pubNub) {
      this.pubNub = pubNub;
    }
  }
}
