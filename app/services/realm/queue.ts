const queueDelay = 2000;
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

processItems();
