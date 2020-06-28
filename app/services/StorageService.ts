import AsyncStorage from '@react-native-community/async-storage';

class StorageService {
  async getItem(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      if (!data) {
        return null;
      }
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (e) {
      return null;
    }
  }
}

export default new StorageService();
