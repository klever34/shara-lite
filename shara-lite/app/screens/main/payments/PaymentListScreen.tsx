import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {withModal} from '@/helpers/hocs';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack';
import React, {useLayoutEffect} from 'react';
import {Text, View} from 'react-native';

export const PaymentListScreen = withModal(() => {
  const navigation = useAppNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    size={22}
                    borderRadius={12}
                    name="dollar-sign"
                    type="feathericons"
                    color={colors['gray-300']}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Payments
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
    });
  }, [navigation]);

  return null;
});
