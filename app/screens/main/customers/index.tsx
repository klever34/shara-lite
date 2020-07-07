import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {colors} from '../../../styles';

const CustomersTab = () => {
  const navigation = useNavigation();
  const actions = [
    {
      position: 1,
      name: 'Receipts',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Issue a receipt</Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/receipts.png')}
            />
          </View>
        );
      },
    },
    {
      position: 2,
      name: 'Credit',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Give Credit</Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/credit.png')}
            />
          </View>
        );
      },
    },
  ];
  return (
    <View style={styles.container}>
      <FloatingAction
        animated={false}
        actions={actions}
        distanceToEdge={12}
        color={colors.primary}
        showBackground={false}
        actionsPaddingTopBottom={4}
        onPressItem={(name) => name && navigation.navigate(name)}
      />
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
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemIcon: {
    height: 45,
    width: 45,
  },
  listItemText: {
    fontSize: 16,
    paddingRight: 12,
    fontWeight: '500',
  },
  fabButton: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    color: colors.white,
  },
});

export default CustomersTab;