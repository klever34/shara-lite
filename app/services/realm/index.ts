import {useContext} from 'react';
import Realm from 'realm';
import {RealmContext} from './provider';

export const useRealm = (): Realm => {
  // @ts-ignore
  const {realm} = useContext(RealmContext);
  return <Realm>realm;
};

export * from './hooks';

export * from './service';
