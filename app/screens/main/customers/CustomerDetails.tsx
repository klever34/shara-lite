import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect} from 'react';
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

const CustomerDetails = ({route}: {route: any}) => {
  const navigation = useNavigation();
  const {customer} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const addCustomerToComponent = useCallback(
    (Component) => (props: any) => <Component {...props} customer={customer} />,
    [customer],
  );

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
          options={{title: 'Payments'}}>
          {addCustomerToComponent(PaymentsTab)}
        </CustomerDetailsTab.Screen>
        <CustomerDetailsTab.Screen name="Credit" options={{title: 'Credit'}}>
          {addCustomerToComponent(CreditsTab)}
        </CustomerDetailsTab.Screen>
      </CustomerDetailsTab.Navigator>
    </SafeAreaView>
  );
};

export default CustomerDetails;
