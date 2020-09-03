import Realm, {UpdateMode} from 'realm';
import {omit} from 'lodash';
import {IDeliveryAgent, modelName} from '../models/DeliveryAgent';
import {getBaseModelValues} from '../helpers/models';

export const getDeliveryAgents = ({
  realm,
}: {
  realm: Realm;
}): IDeliveryAgent[] => {
  return (realm.objects<IDeliveryAgent>(
    modelName,
  ) as unknown) as IDeliveryAgent[];
};

export const getDeliveryAgentByMobile = ({
  realm,
  mobile,
}: {
  realm: Realm;
  mobile: string;
}): IDeliveryAgent | null => {
  const foundDeliveryAgents = realm
    .objects<IDeliveryAgent>(modelName)
    .filtered(`mobile = "${mobile}" LIMIT(1)`);
  return foundDeliveryAgents.length
    ? (omit(foundDeliveryAgents[0]) as IDeliveryAgent)
    : null;
};

export const saveDeliveryAgent = ({
  realm,
  delivery_agent,
}: {
  realm: Realm;
  delivery_agent: IDeliveryAgent;
}): IDeliveryAgent => {
  const deliveryAgentToCreate: IDeliveryAgent = {
    ...delivery_agent,
    ...getBaseModelValues(),
  };
  const existingDeliveryAgent = getDeliveryAgentByMobile({
    realm,
    mobile: delivery_agent.mobile,
  });

  if (existingDeliveryAgent) {
    return existingDeliveryAgent;
  }

  const saveDeliveryAgentInDb = () => {
    realm.create<IDeliveryAgent>(
      modelName,
      deliveryAgentToCreate,
      UpdateMode.Modified,
    );
  };

  if (realm.isInTransaction) {
    saveDeliveryAgentInDb();
  } else {
    realm.write(saveDeliveryAgentInDb);
  }

  return deliveryAgentToCreate;
};

export const updateDeliveryAgent = ({
  realm,
  deliveryAgent,
  updates,
}: {
  realm: Realm;
  deliveryAgent: IDeliveryAgent;
  updates: Partial<IDeliveryAgent>;
}) => {
  const updatedDeliveryAgent = {
    _id: deliveryAgent._id,
    ...updates,
  };

  const updateDeliveryAgentInDb = () => {
    realm.create(modelName, updatedDeliveryAgent, UpdateMode.Modified);
  };

  if (realm.isInTransaction) {
    updateDeliveryAgentInDb();
  } else {
    realm.write(updateDeliveryAgentInDb);
  }
};

export const getDeliveryAgent = ({
  realm,
  deliveryAgentId,
}: {
  realm: Realm;
  deliveryAgentId: string;
}) => {
  return realm.objectForPrimaryKey(
    modelName,
    deliveryAgentId,
  ) as IDeliveryAgent;
};

export const deleteDeliveryAgent = ({
  realm,
  deliveryAgent,
}: {
  realm: Realm;
  deliveryAgent: IDeliveryAgent;
}) => {
  realm.write(() => {
    realm.delete(deliveryAgent);
  });
};
