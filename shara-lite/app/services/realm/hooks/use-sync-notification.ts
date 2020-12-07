import {useContext, useEffect} from 'react';
import {RealmContext} from '@/services/realm/provider';

interface useSyncNotificationProps {
  model: string;
  onAddition: () => void;
}

export const useSyncNotification = (props: useSyncNotificationProps) => {
  const {model, onAddition} = props;
  const {modelUpdates} = useContext(RealmContext);
  const modelUpdate = modelUpdates[model];

  useEffect(() => {
    if (modelUpdate) {
      onAddition();
    }
  }, [onAddition, modelUpdate]);
};
