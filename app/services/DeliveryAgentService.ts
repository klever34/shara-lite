import Realm, {UpdateMode} from 'realm';
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
    id: deliveryAgent._id,
    ...updates,
  };

  const updateDeliveryAgentInDb = () => {
    realm.create<IDeliveryAgent>(
      modelName,
      updatedDeliveryAgent,
      UpdateMode.Modified,
    );
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
