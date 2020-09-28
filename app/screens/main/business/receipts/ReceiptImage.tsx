import format from 'date-fns/format';
import React, {useCallback} from 'react';
import {FlatList, Image, ScrollView, Text, View} from 'react-native';
import ViewShot, {ViewShotProperties} from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {User} from '../../../../../types/app';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {colors} from '../../../../styles';
import {
  SummaryTableHeader,
  SummaryTableItem,
  SummaryTableItemProps,
} from './ReceiptSummary';

type Props = {
  tax?: number;
  createdAt?: Date;
  user: User | null;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditAmount?: number;
  products?: IReceiptItem[];
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

  return (
    <ScrollView>
      <ViewShot
        onCapture={onCapture}
        captureMode={captureMode}
        options={{format: 'png', quality: 0.9}}>
        <View
          style={applyStyles('px-lg flex-1', {
            backgroundColor: colors.white,
          })}>
          <View style={applyStyles('py-lg items-center justify-center')}>
            <View style={applyStyles('mb-md')}>
              {businessInfo?.profile_image_url ? (
                <Image
                  style={applyStyles('mb-lg items-center justify-center', {
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    backgroundColor: colors['gray-20'],
                  })}
                  source={{uri: businessInfo?.profile_image_url}}
                />
              ) : (
                <View
                  style={applyStyles('mb-lg items-center justify-center', {
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    backgroundColor: colors['gray-20'],
                  })}>
                  <Text style={applyStyles('text-400 text-uppercase')}>
                    Logo
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={applyStyles('pb-xs text-700 text-center text-uppercase', {
                fontSize: 18,
              })}>
              {businessInfo?.name}
            </Text>
            <Text style={applyStyles('text-400 pb-xs text-center')}>
              {businessInfo?.address}
            </Text>
            <Text style={applyStyles('text-400 pb-xs text-center')}>
              Tel: {user?.mobile}
            </Text>
          </View>
          <View
            style={applyStyles('py-lg', {
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderTopColor: colors['gray-20'],
              borderBottomColor: colors['gray-20'],
            })}>
            <View style={applyStyles('flex-row w-full justify-space-between')}>
              <View style={applyStyles({width: '60%'})}>
                <Text style={applyStyles('text-400')}>
                  Receipt For:{' '}
                  <Text style={applyStyles('text-500')}>{customer?.name}</Text>
                </Text>
              </View>
              <View style={applyStyles({width: '60%'})}>
                <Text style={applyStyles('text-400')}>
                  {format(
                    createdAt ? new Date(createdAt) : new Date(),
                    'dd/MM/yyyy',
                  )}
                </Text>
                <Text style={applyStyles('text-400', {fontSize: 10})}>
                  {format(
                    createdAt ? new Date(createdAt) : new Date(),
                    'hh:mm:a',
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View>
            <FlatList
              data={products}
              style={applyStyles('mt-lg')}
              renderItem={renderSummaryItem}
              keyExtractor={(item) => `${item._id}`}
              ListHeaderComponent={SummaryTableHeader}
            />
            <View style={applyStyles('my-md items-end')}>
              <View style={applyStyles({width: '60%'})}>
                <View
                  style={applyStyles(
                    'pb-sm',
                    'flex-row',
                    'items-center',
                    'justify-space-between',
                  )}>
                  <Text
                    style={applyStyles(
                      {
                        color: colors['gray-300'],
                      },
                      'text-400',
                    )}>
                    Tax:
                  </Text>
                  <Text
                    style={applyStyles(
                      {
                        color: colors['gray-300'],
                      },
                      'text-400',
                    )}>
                    {tax}
                  </Text>
                </View>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-space-between',
                  )}>
                  <Text
                    style={applyStyles(
                      {
                        color: colors['gray-300'],
                      },
                      'text-400',
                    )}>
                    Total:
                  </Text>
                  <Text
                    style={applyStyles('text-500', {
                      fontSize: 18,
                      color: colors['gray-300'],
                    })}>
                    {amountWithCurrency(totalAmount)}
                  </Text>
                </View>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-space-between',
                  )}>
                  <Text
                    style={applyStyles(
                      {
                        color: colors['gray-300'],
                      },
                      'text-400',
                    )}>
                    Amount Paid:
                  </Text>
                  <Text
                    style={applyStyles('text-500', {
                      fontSize: 18,
                      color: colors['gray-300'],
                    })}>
                    {amountWithCurrency(amountPaid)}
                  </Text>
                </View>
                {!!creditAmount && (
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-space-between',
                    )}>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      Balance:
                    </Text>
                    <Text
                      style={applyStyles('text-500', {
                        fontSize: 18,
                        color: colors.primary,
                      })}>
                      {amountWithCurrency(creditAmount)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View
            style={applyStyles('py-lg', {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            })}>
            <Text style={applyStyles('text-center text-400')}>
              Powered by Shara &copy; www.shara.co
            </Text>
          </View>
        </View>
      </ViewShot>
    </ScrollView>
  );
};
