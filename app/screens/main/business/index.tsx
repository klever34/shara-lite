import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import {colors} from '../../../styles';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import ActionCard from '../customers/ActionCard';
import {Button} from '../../../components';

const BusinessTab = () => {
  const navigation = useNavigation();
  const actions = [
    {
      name: 'NewReceipt',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Issue a receipt
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/receipts.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Inventory',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Record inventory
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/inventory.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Expenses',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Record expenses
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/expenses.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Credit',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Give Credit
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../assets/icons/business/credit.png')}
            />
          </View>
        );
      },
    },
  ];

  const handleActionItemClick = useCallback(
    (name?: string) => {
      if (name) {
        navigation.navigate(name);
      }
    },
    [navigation],
  );

  const handleViewFinances = useCallback(() => {
    Alert.alert('Coming soon', 'This feature is coming in a future release');
  }, []);

  const handleNavigation = useCallback(
    (route: string) => {
      navigation.navigate(route);
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <View style={applyStyles('mb-lg')}>
        <TouchableOpacity onPress={() => handleNavigation('MySales')}>
          <ActionCard
            style={applyStyles(styles.card, {backgroundColor: colors.primary})}>
            <Text
              style={applyStyles(styles.cardTitle, {color: colors['red-50']})}>
              My sales
            </Text>
            <Text
              style={applyStyles(styles.cardContent, {color: colors.white})}>
              &#8358;{numberWithCommas(15365400)}
            </Text>
          </ActionCard>
        </TouchableOpacity>
      </View>
      <View style={applyStyles('flex-row', 'mb-lg', 'justify-space-between')}>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total profit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors['gray-300'],
            })}>
            &#8358;{numberWithCommas(15365400)}
          </Text>
        </ActionCard>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total expenses
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors.primary,
            })}>
            &#8358;{numberWithCommas(1205400)}
          </Text>
        </ActionCard>
      </View>
      <View style={applyStyles('flex-row', 'mb-lg', 'justify-space-between')}>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Total credit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {
              color: colors['gray-300'],
            })}>
            &#8358;{numberWithCommas(14405000)}
          </Text>
        </ActionCard>
        <ActionCard
          style={applyStyles(styles.card, {
            backgroundColor: colors.white,
            width: '48%',
          })}>
          <Text
            style={applyStyles(styles.cardTitle, {color: colors['gray-100']})}>
            Overdue credit
          </Text>
          <Text
            style={applyStyles(styles.cardContent, {color: colors.primary})}>
            &#8358;{numberWithCommas(15365400)}
          </Text>
        </ActionCard>
      </View>
      <Button
        variantColor="white"
        title="View all finances"
        onPress={handleViewFinances}
        style={applyStyles({elevation: 0})}
      />
      <FloatingAction
        actions={actions}
        distanceToEdge={12}
        color={colors.primary}
        actionsPaddingTopBottom={4}
        onPressItem={handleActionItemClick}
        overlayColor="rgba(255,255,255,0.95)"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors['gray-10'],
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
    color: colors['gray-300'],
  },
  card: {
    padding: 16,
    paddingTop: 16,
    elevation: 0,
  },
  cardTitle: {
    fontSize: 12,
    paddingBottom: 4,
    fontFamily: 'Rubik-Medium',
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
});

export default BusinessTab;
