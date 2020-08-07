import React, {createContext, useState} from 'react';

type RealmObject = {
  realm?: Realm;
  updateRealm?: (realm: Realm) => void;
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const [realm, setRealm] = useState<Realm>();
  const updateRealm = (realm: Realm) => {
    setRealm(realm);
  };

  return (
    <RealmContext.Provider value={{realm, updateRealm}}>
      {props.children}
    </RealmContext.Provider>
  );
};

export default RealmProvider;
