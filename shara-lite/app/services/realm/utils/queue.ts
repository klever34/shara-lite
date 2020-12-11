const queueDelay = 250;
const queueItems: Array<() => void> = [];

const processItems = () => {
  if (queueItems.length) {
    const item = queueItems.shift();
    item && item();
  }

  setTimeout(() => {
    processItems();
  }, queueDelay);
};

export const addItemToQueue = (item: () => void) => {
  queueItems.push(item);
};

export const isBackgroundSyncCompleted = (): boolean => !queueItems.length;

export const clearQueue = () => {
  queueItems.length = 0;
};

processItems();
