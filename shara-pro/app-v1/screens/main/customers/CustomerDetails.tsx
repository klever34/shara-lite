import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {applyStyles} from 'app-v1/helpers/utils';
import {colors} from 'app-v1/styles';
import CreditsTab from './CreditsTab';
import DetailsTab from './DetailsTab';
import OrdersTab from './OrdersTab';
import PaymentsTab from './PaymentsTab';
import HeaderRight from '../../../components/HeaderRight';
import {CustomerContext} from 'app-v1/services/customer';

type CustomerDetailsParamList = {
  Details: undefined;
  Orders: undefined;
  Payments: undefined;
  CreditsTab: undefined;
};

const CustomerDetailsTab = createMaterialTopTabNavigator<
  CustomerDetailsParamList
>();

const CustomerDetails = ({route}: {route: any}) => {
  const navigation = useNavigation();
  const {customer} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          tintColor={colors.white}
          onPress={() => navigation.navigate('Customers')}
        />
      ),
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const addCustomerToComponent = useCallback(
    (Component) => (props: any) => <Component {...props} customer={customer} />,
    [customer],
  );

  return (
    <CustomerContext.Provider value={customer}>
      <SafeAreaView style={applyStyles('flex-1')}>
        <CustomerDetailsTab.Navigator
          initialRouteName="CreditsTab"
          tabBarOptions={{
            indicatorContainerStyle: {backgroundColor: colors.primary},
            indicatorStyle: {backgroundColor: colors.white},
            labelStyle: {fontFamily: 'Rubik-Regular'},
            activeTintColor: 'rgba(255,255,255, 1)',
            inactiveTintColor: 'rgba(255,255,255, 0.75)',
          }}>
          <CustomerDetailsTab.Screen
            name="CreditsTab"
            options={{title: 'Credit'}}>
            {addCustomerToComponent(CreditsTab)}
          </CustomerDetailsTab.Screen>
          <CustomerDetailsTab.Screen
            name="Payments"
            options={{title: 'Payments'}}>
            {addCustomerToComponent(PaymentsTab)}
          </CustomerDetailsTab.Screen>
          <CustomerDetailsTab.Screen
            name="Orders"
            options={{title: 'Orders'}}
            component={OrdersTab}
          />
          <CustomerDetailsTab.Screen
            name="Details"
            options={{title: 'Details'}}
            component={DetailsTab}
          />
        </CustomerDetailsTab.Navigator>
      </SafeAreaView>
    </CustomerContext.Provider>
  );
};

export default CustomerDetails;
