import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import {colors} from '@/styles';
import format from 'date-fns/format';
import React, {useCallback} from 'react';
import {FlatList, Image, ScrollView, Text, View, ViewStyle} from 'react-native';
import ViewShot, {ViewShotProperties} from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {User} from 'types/app';
import {
  SummaryTableFooter,
  SummaryTableHeader,
  SummaryTableItem,
  SummaryTableItemProps,
} from './receipt-preview';

type Props = {
  tax?: number;
  createdAt?: Date;
  user: User | null;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditDueDate?: Date;
  creditAmount?: number;
  products?: IReceiptItem[];
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
  captureMode?: ViewShotProperties['captureMode'];
};

export const ReceiptImage = (props: Props) => {
  const {
    tax,
    user,
    customer,
    products,
    createdAt,
    amountPaid,
    totalAmount,
    getImageUri,
    creditAmount,
    creditDueDate,
    containerStyle,
    captureMode = 'mount',
  } = props;
  const businessInfo = user?.businesses[0];

  const onCapture = useCallback(
    async (uri: any) => {
      RNFetchBlob.fs.readFile(uri, 'base64').then((data) => {
        getImageUri(data);
      });
    },
    [getImageUri],
  );

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  console.log(customer?.name ?? '');

  return (
    <ScrollView>
      <ViewShot
        onCapture={onCapture}
        captureMode={captureMode}
        options={{format: 'png', quality: 0.9}}>
        <View
          style={applyStyles('flex-1', {
            backgroundColor: colors.white,
            ...containerStyle,
          })}>
          <View style={applyStyles('py-lg items-center justify-center')}>
            <View style={applyStyles('mb-md')}>
              {businessInfo?.profile_image?.url && (
                <Image
                  style={applyStyles('mb-lg items-center justify-center', {
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    backgroundColor: colors['gray-20'],
                  })}
                  source={{uri: businessInfo?.profile_image?.url}}
                />
              )}
            </View>
            <Text
              style={applyStyles('pb-xs text-700 text-center text-uppercase', {
                fontSize: 18,
                color: colors['gray-300'],
              })}>
              {businessInfo?.name}
            </Text>
            <Text
              style={applyStyles('text-400 pb-xs text-center', {
                color: colors['gray-200'],
              })}>
              {businessInfo?.address}
            </Text>
            <Text
              style={applyStyles('text-400 pb-xs text-center', {
                color: colors['gray-200'],
              })}>
              Tel: +{businessInfo?.mobile || user?.mobile}
            </Text>
            {user?.email && (
              <Text
                style={applyStyles('text-400 pb-xs text-center', {
                  color: colors['gray-200'],
                })}>
                Email: {user?.email}
              </Text>
            )}
          </View>
          <View style={applyStyles('py-sm  px-lg')}>
            <View style={applyStyles('pb-sm flex-row items-center')}>
              <Text
                style={applyStyles('text-400', {color: colors['gray-200']})}>
                Receipt For:
              </Text>
              <Text style={applyStyles('pl-sm text-500')}>
                {customer?.name ?? 'No Customer'}
              </Text>
            </View>
            <View style={applyStyles('pb-sm flex-row items-center')}>
              <Text
                style={applyStyles('text-400', {color: colors['gray-200']})}>
                Date:
              </Text>
              <Text
                style={applyStyles('pl-sm text-400', {
                  color: colors['gray-200'],
                })}>
                {format(
                  createdAt ? new Date(createdAt) : new Date(),
                  'dd/MM/yyyy',
                )}
              </Text>
            </View>
          </View>
          <View style={applyStyles('mb-xl')}>
            <FlatList
              data={products}
              style={applyStyles('mt-lg')}
              renderItem={renderSummaryItem}
              keyExtractor={(item) => `${item._id}`}
              ListHeaderComponent={SummaryTableHeader}
              ListFooterComponent={
                <SummaryTableFooter tax={tax} totalAmount={totalAmount} />
              }
            />
          </View>
          <View>
            <View style={applyStyles('mb-xl px-lg flex-row items-center')}>
              <View style={applyStyles('pr-sm')}>
                <Text style={applyStyles('text-400')}>Paid:</Text>
              </View>
              <View
                style={applyStyles('p-sm', {
                  borderWidth: 1,
                  borderColor: colors['gray-900'],
                })}>
                <Text style={applyStyles('text-500')}>
                  {amountWithCurrency(amountPaid)}
                </Text>
              </View>
            </View>
          </View>

          {!!creditAmount && (
            <View
              style={applyStyles({
                borderTopWidth: 1,
                borderTopColor: colors['gray-20'],
              })}>
              <View style={applyStyles('pt-md pb-xl center')}>
                <Text
                  style={applyStyles('text-500', {color: colors['gray-200']})}>
                  Credit Details
                </Text>
              </View>
              <View
                style={applyStyles(
                  'px-lg flex-row items-center, justify-between  flex-wrap',
                )}>
                <View style={applyStyles('flex-row items-center mb-md')}>
                  <View style={applyStyles('pr-sm')}>
                    <Text style={applyStyles('text-400')}>Balance:</Text>
                  </View>
                  <View>
                    <Text style={applyStyles('text-500')}>
                      {amountWithCurrency(creditAmount)}
                    </Text>
                  </View>
                </View>
                {creditDueDate && (
                  <View style={applyStyles('flex-row items-center mb-md')}>
                    <View style={applyStyles('pr-sm')}>
                      <Text style={applyStyles('text-400')}>Collect on:</Text>
                    </View>
                    <View
                      style={applyStyles('p-sm', {
                        borderWidth: 1,
                        borderColor: colors['gray-900'],
                      })}>
                      <Text style={applyStyles('text-500')}>
                        {format(creditDueDate, 'dd/MM/yyyy')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
          <View style={applyStyles({paddingVertical: 40})}>
            <Text
              style={applyStyles('text-center text-400', {
                fontSize: 12,
                color: colors['gray-100'],
              })}>
              Free receipting by Shara &copy; www.shara.co
            </Text>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
};
