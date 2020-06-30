import AsyncStorage from '@react-native-community/async-storage';

export interface IStorageService {
  getItem<T>(key: string): Promise<T | null>;
}

export default class StorageService implements IStorageService {
  async getItem<T>(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      if (!data) {
        return null;
      }
      const parsedData: T = JSON.parse(data);
      return parsedData;
    } catch (e) {
      return null;
    }
  }
}
