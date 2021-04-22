import {HeaderBackButton} from '@/components/HeaderBackButton';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {ReactNode, useMemo} from 'react';
import {Text} from '@/components';
import {View, ViewStyle, TouchableOpacity} from 'react-native';
import {Icon} from './Icon';
import PlaceholderImage from './PlaceholderImage';
import Touchable from './Touchable';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type CustomerDetailsHeaderProps = {
  style?: ViewStyle;
  backButton?: boolean;
  customer?: ICustomer;
  onPress?: () => void;
  renderLeftSection?: () => ReactNode;
  renderRightSection?: () => ReactNode;
};

const CustomerDetailsHeader = ({
  style,
  onPress,
  customer,
  renderLeftSection,
  renderRightSection,
  backButton = true,
}: CustomerDetailsHeaderProps) => {
  renderLeftSection = useMemo(() => {
    if (!renderLeftSection) {
      return () => (
        <>
          <Text
            numberOfLines={1}
            style={applyStyles(
              'text-capitalize text-400 text-black text-base',
            )}>
            {customer?.name}
          </Text>
        </>
      );
    }
    return renderLeftSection;
  }, [customer, renderLeftSection]);

  renderRightSection = useMemo(() => {
    if (!renderRightSection) {
      return () =>
        !!customer?.balance && (
          <>
            <View style={applyStyles('pb-4 flex-row items-center')}>
              {!!customer?.balance && customer?.balance < 0 && (
                <View style={applyStyles('pr-4')}>
                  <Icon
                    size={14}
                    name="arrow-up"
                    type="feathericons"
                    color={colors['red-100']}
                  />
                </View>
              )}
              {!!customer?.balance && customer?.balance > 0 && (
                <View style={applyStyles('pr-4')}>
                  <Icon
                    size={14}
                    name="arrow-down"
                    type="feathericons"
                    color={colors['green-200']}
                  />
                </View>
              )}
              <Text
                style={applyStyles(
                  'text-700 text-uppercase text-xxs text-gray-200',
                )}>
                {strings('balance')}
              </Text>
            </View>
            <Text style={applyStyles('pb-4 text-700 text-black text-base')}>
              {customer.balance && customer.balance < 0 ? '-' : ''}
              {amountWithCurrency(customer?.balance)}
            </Text>
          </>
        );
    }
    return renderRightSection;
  }, [customer, renderRightSection]);

  const navigation = useAppNavigation();

  return (
    <Touchable onPress={onPress}>
      <View
        style={applyStyles('flex-row bg-white items-center', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        {backButton && (
          <TouchableOpacity style={{marginRight: 20}} onPress={() => navigation.goBack()}>
            <HeaderBackButton
              iconName="arrow-left"
              onPress={() => navigation.goBack()}
            />
          </TouchableOpacity>
        )}
        <View
          style={applyStyles(
            'px-16 py-16 flex-row items-center justify-between flex-1',
            {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-10'],
            },
            style,
          )}>
          <View style={applyStyles('flex-row items-center', {width: '48%'})}>
            {!customer ? (
              <View style={applyStyles('flex-row items-center')}>
                <View
                  style={applyStyles('center bg-gray-20', {
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                  })}>
                  <Icon
                    size={16}
                    name="plus"
                    type="feathericons"
                    color={colors['gray-50']}
                  />
                </View>
                <View style={applyStyles('pl-8')}>
                  <Text
                    style={applyStyles(
                      'pb-4 text-700 text-sm text-primary text-uppercase',
                      {
                        textDecorationLine: 'underline',
                      },
                    )}>
                    {strings('customers.add_customer_details')}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <PlaceholderImage
                  text={customer?.name ?? ''}
                  image={customer.image ? {uri: customer?.image} : undefined}
                />
                <View style={applyStyles('pl-sm')}>{renderLeftSection()}</View>
              </>
            )}
          </View>
          <View style={applyStyles('items-end', {width: '48%'})}>
            {renderRightSection()}
          </View>
        </View>
      </View>
    </Touchable>
  );
};

export default CustomerDetailsHeader;
