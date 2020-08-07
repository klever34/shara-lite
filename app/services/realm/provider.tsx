import React, {createContext, useState} from 'react';
import {getStorageService} from '../index';

type RealmObject = {
  realm?: Realm;
  updateRealm?: (realm: Realm) => void;
};

export const RealmContext = createContext<RealmObject>({});

const storageService = getStorageService();

const RealmProvider = (props: any) => {
  const [realm, setRealm] = useState<Realm>();
  const updateRealm = (realm: Realm) => {
    setRealm(realm);
    storageService.setItem('realm', realm);
  };

  return (
    <RealmContext.Provider value={{realm, updateRealm}}>
      {props.children}
    </RealmContext.Provider>
  );
};

export default RealmProvider;
