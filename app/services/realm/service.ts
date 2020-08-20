import Realm from 'realm';

export interface IRealmService {
  getInstance(): Realm | null;

  setInstance(realm: Realm): void;

  clearRealm(): void;
}

export class RealmService implements IRealmService {
  private realm: Realm | null = null;

  public getInstance() {
    return this.realm;
  }

  public setInstance(realm: Realm) {
    if (!this.realm) {
      this.realm = realm;
    }
  }

  clearRealm() {
    const realm = this.realm;
    if (realm) {
      realm.write(() => {
        realm.deleteAll();
      });
    }
  }
}
