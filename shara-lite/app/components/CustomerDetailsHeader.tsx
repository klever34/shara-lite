import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {applyStyles, colors} from '@/styles';
import {format, formatDistanceToNowStrict} from 'date-fns';
import React, {useMemo, ReactNode} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {Icon} from './Icon';
import PlaceholderImage from './PlaceholderImage';
import Touchable from './Touchable';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {useAppNavigation} from '@/services/navigation';

export type CustomerDetailsHeaderProps = {
  style?: ViewStyle;
  customer?: ICustomer;
  onPress?: () => void;
  renderLeftSection?: () => ReactNode;
  renderRightSection?: () => ReactNode;
  backButton?: boolean;
};

const CustomerDetailsHeader = ({
  style,
  onPress,
  customer,
  renderLeftSection,
  renderRightSection,
  backButton = true,
}: CustomerDetailsHeaderProps) => {
  const credit = customer?.credits && customer.credits[0];
  const creditCreatedAt = credit?.created_at;

  renderLeftSection = useMemo(() => {
    if (!renderLeftSection) {
      return () => (
        <>
          <Text
            numberOfLines={1}
            style={applyStyles('text-uppercase text-700 text-gray-300')}>
            {customer?.name}
          </Text>
          <Text
            style={applyStyles(
              'text-uppercase text-400 text-gray-100 text-xxs',
            )}>
            {credit
              ? creditCreatedAt &&
                `${formatDistanceToNowStrict(creditCreatedAt, {
                  addSuffix: true,
                })}, ${format(creditCreatedAt, 'hh:mm a')}`
              : customer?.mobile}
          </Text>
        </>
      );
    }
    return renderLeftSection;
  }, [credit, customer, creditCreatedAt, renderLeftSection]);

  renderRightSection = useMemo(() => {
    if (!renderRightSection) {
      return () =>
        credit && (
          <>
            <Text
              style={applyStyles(
                'text-400 text-uppercase text-xxs text-gray-100',
              )}>
              You will collect
            </Text>
            <Text style={applyStyles('pb-4 text-700 text-red-200')}>
              {amountWithCurrency(
                customer?.overdueCreditAmount ||
                  customer?.remainingCreditAmount,
              )}
            </Text>
          </>
        );
    }
    return renderRightSection;
  }, [credit, customer, renderRightSection]);

  const navigation = useAppNavigation();

  return (
    <Touchable onPress={onPress ? onPress : undefined}>
      <View
        style={applyStyles('flex-row bg-white items-center', {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 10,
          borderBottomColor: colors['gray-10'],
        })}>
        {backButton && (
          <HeaderBackButton
            iconName="arrow-left"
            onPress={() => navigation.goBack()}
          />
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
                    Add Customer details
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <PlaceholderImage text={customer?.name ?? ''} />
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
