import {UpdateMode} from 'realm';
import {omit} from 'lodash';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IDeliveryAgent, modelName} from '@/models/DeliveryAgent';
import {getAnalyticsService} from '@/services';
import perf from '@react-native-firebase/perf';

interface saveDeliveryAgentInterface {
  delivery_agent: IDeliveryAgent;
}

interface updateDeliveryAgentInterface {
  deliveryAgent: IDeliveryAgent;
  updates: object;
}

interface getDeliveryAgentInterface {
  deliveryAgentId: string;
}

interface deleteDeliveryAgentInterface {
  deliveryAgent: IDeliveryAgent;
}

interface useDeliveryAgentInterface {
  getDeliveryAgents: () => IDeliveryAgent[];
  saveDeliveryAgent: (
    data: saveDeliveryAgentInterface,
  ) => Promise<IDeliveryAgent>;
  getDeliveryAgent: (params: getDeliveryAgentInterface) => IDeliveryAgent;
  updateDeliveryAgent: (data: updateDeliveryAgentInterface) => void;
  deleteDeliveryAgent: (data: deleteDeliveryAgentInterface) => void;
}

export const useDeliveryAgent = (): useDeliveryAgentInterface => {
  const realm = useRealm();

  const getDeliveryAgents = (): IDeliveryAgent[] => {
    return (realm
      .objects<IDeliveryAgent>(modelName)
      .filtered('is_deleted = false') as unknown) as IDeliveryAgent[];
  };

  const getDeliveryAgentByMobile = ({
    mobile,
  }: {
    mobile?: string;
  }): IDeliveryAgent | null => {
    const foundDeliveryAgents = realm
      .objects<IDeliveryAgent>(modelName)
      .filtered(`mobile = "${mobile}" LIMIT(1)`);
    return foundDeliveryAgents.length
      ? (omit(foundDeliveryAgents[0]) as IDeliveryAgent)
      : null;
  };

  const saveDeliveryAgent = async ({
    delivery_agent,
  }: saveDeliveryAgentInterface): Promise<IDeliveryAgent> => {
    const deliveryAgentToCreate: IDeliveryAgent = {
      ...delivery_agent,
      ...getBaseModelValues(),
    };
    const existingDeliveryAgent = getDeliveryAgentByMobile({
      mobile: delivery_agent.mobile,
    });

    if (existingDeliveryAgent) {
      return existingDeliveryAgent;
    }

    const trace = await perf().startTrace('saveDeliveryAgent');
    realm.write(() => {
      realm.create<IDeliveryAgent>(
        modelName,
        deliveryAgentToCreate,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    getAnalyticsService()
      .logEvent('deliveryAgentAdded', {})
      .then(() => {});

    return deliveryAgentToCreate;
  };

  const updateDeliveryAgent = async ({
    deliveryAgent,
    updates,
  }: updateDeliveryAgentInterface) => {
    const updatedDeliveryAgent = {
      _id: deliveryAgent._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updateDeliveryAgent');
    realm.write(() => {
      realm.create(modelName, updatedDeliveryAgent, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const getDeliveryAgent = ({
    deliveryAgentId,
  }: getDeliveryAgentInterface): IDeliveryAgent => {
    return realm.objectForPrimaryKey(
      modelName,
      deliveryAgentId,
    ) as IDeliveryAgent;
  };

  const deleteDeliveryAgent = async ({
    deliveryAgent,
  }: deleteDeliveryAgentInterface) => {
    await updateDeliveryAgent({deliveryAgent, updates: {is_deleted: true}});
  };

  return {
    getDeliveryAgents,
    saveDeliveryAgent,
    updateDeliveryAgent,
    getDeliveryAgent,
    deleteDeliveryAgent,
  };
};
