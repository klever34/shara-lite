import AsyncStorage from '@react-native-community/async-storage';

export interface IStorageService {
  getItem<T>(key: string): Promise<T | null>;

  setItem<T>(key: string, value: T): Promise<boolean>;

  clear(): Promise<boolean>;
}

export class StorageService implements IStorageService {
  async getItem<T>(key: string) {
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      return null;
    }

    try {
      const parsedData: T = JSON.parse(data);
      return parsedData;
    } catch (e) {
      return (data as unknown) as T;
    }
  }

  async setItem<T>(key: string, value: T) {
    try {
      const valueToSave =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, valueToSave);
      return true;
    } catch (e) {
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }
}
