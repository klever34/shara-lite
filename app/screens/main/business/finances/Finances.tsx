import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {SafeAreaView, View} from 'react-native';
import Icon from '../../../../components/Icon';
import AppMenu from '../../../../components/Menu';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {MyCredit, MyInventory, MyReceipts} from './index';

type TabStackParamList = {
  Credit: undefined;
  Receipts: undefined;
  Inventory: undefined;
};

const TabStack = createMaterialTopTabNavigator<TabStackParamList>();

export const Finances = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={applyStyles('flex-row flex-1 items-center')}>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="sliders"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="search"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <View style={applyStyles('px-xs', {width: '33%'})}>
            <AppMenu options={[{text: 'Help', onSelect: () => {}}]} />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <TabStack.Navigator
        tabBarOptions={{
          activeTintColor: 'rgba(255,255,255, 1)',
          labelStyle: {fontFamily: 'Rubik-Regular'},
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
          indicatorStyle: {backgroundColor: colors.white},
          indicatorContainerStyle: {backgroundColor: colors.primary},
        }}>
        <TabStack.Screen name="Receipts" component={MyReceipts} />
        <TabStack.Screen name="Credit" component={MyCredit} />
        <TabStack.Screen name="Inventory" component={MyInventory} />
      </TabStack.Navigator>
    </SafeAreaView>
  );
};
