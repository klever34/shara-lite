import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Touchable from '../../../components/Touchable';

const BusinessTab = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Touchable
        onPress={() => {
          navigation.navigate('Finances');
        }}>
        <View style={styles.listItem}>
          <Image
            style={styles.listItemIcon}
            source={require('../../../assets/icons/business/finances.png')}
          />
          <Text style={styles.listItemText}>Finances</Text>
        </View>
      </Touchable>
      <Touchable
        onPress={() => {
          navigation.navigate('Receipts');
        }}>
        <View style={styles.listItem}>
          <Image
            style={styles.listItemIcon}
            source={require('../../../assets/icons/business/receipts.png')}
          />
          <Text style={styles.listItemText}>Receipts</Text>
        </View>
      </Touchable>
      <Touchable
        onPress={() => {
          navigation.navigate('Inventory');
        }}>
        <View style={styles.listItem}>
          <Image
            style={styles.listItemIcon}
            source={require('../../../assets/icons/business/inventory.png')}
          />
          <Text style={styles.listItemText}>Inventory</Text>
        </View>
      </Touchable>
      <Touchable
        onPress={() => {
          navigation.navigate('Credit');
        }}>
        <View style={styles.listItem}>
          <Image
            style={styles.listItemIcon}
            source={require('../../../assets/icons/business/credit.png')}
          />
          <Text style={styles.listItemText}>Credit</Text>
        </View>
      </Touchable>
      <Touchable
        onPress={() => {
          navigation.navigate('Expenses');
        }}>
        <View style={styles.listItem}>
          <Image
            style={styles.listItemIcon}
            source={require('../../../assets/icons/business/expenses.png')}
          />
          <Text style={styles.listItemText}>Expenses</Text>
        </View>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  listItem: {
    marginBottom: 4,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
  },
  listItemIcon: {
    height: 50,
    width: 50,
  },
  listItemText: {
    fontSize: 16,
    paddingLeft: 12,
    fontWeight: 'bold',
  },
});

export default BusinessTab;
