import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import AppMenu from '../../../components/Menu';
import {applyStyles} from '../../../helpers/utils';
import {colors} from '../../../styles';
import CreditsTab from './CreditsTab';
import DetailsTab from './DetailsTab';
import OrdersTab from './OrdersTab';
import PaymentsTab from './PaymentsTab';

type CustomerDetailsParamList = {
  Details: undefined;
  Orders: undefined;
  Payments: undefined;
  Credit: undefined;
};

const CustomerDetailsTab = createMaterialTopTabNavigator<
  CustomerDetailsParamList
>();

const CustomerDetails = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <CustomerDetailsTab.Navigator
        initialRouteName="Details"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.primary},
          indicatorStyle: {backgroundColor: colors.white},
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: 'rgba(255,255,255, 1)',
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
        }}>
        <CustomerDetailsTab.Screen
          name="Details"
          options={{title: 'Details'}}
          component={DetailsTab}
        />
        <CustomerDetailsTab.Screen
          name="Orders"
          options={{title: 'Orders'}}
          component={OrdersTab}
        />
        <CustomerDetailsTab.Screen
          name="Payments"
          component={PaymentsTab}
          options={{title: 'Payments'}}
        />
        <CustomerDetailsTab.Screen
          name="Credit"
          component={CreditsTab}
          options={{title: 'Credit'}}
        />
      </CustomerDetailsTab.Navigator>
    </SafeAreaView>
  );
};

export default CustomerDetails;
