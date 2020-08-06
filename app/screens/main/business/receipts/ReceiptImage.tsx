import format from 'date-fns/format';
import React, {Component} from 'react';
import {FlatList, Text, View, Image, ScrollView} from 'react-native';
import ViewShot from 'react-native-view-shot';
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
  user: User | null;
  customer?: ICustomer;
  totalAmount?: number;
  products?: IReceiptItem[];
  getImageUri: (base64: string) => void;
};

type State = {
  uri: string;
};

export class ReceiptImage extends Component<Props, State> {
  state = {
    uri: '',
  };

  onCapture = async (uri: any) => {
    RNFetchBlob.fs.readFile(uri, 'base64').then((data) => {
      this.setState({uri: data});
      this.props.getImageUri(data);
    });
  };

  renderSummaryItem = ({item}: SummaryTableItemProps) => (
    <SummaryTableItem item={item} />
  );

  render() {
    const {tax, user, customer, products, totalAmount} = this.props;
    const businessInfo = user?.businesses[0];
    return (
      <ScrollView>
        <ViewShot
          captureMode="mount"
          onCapture={this.onCapture}
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
                style={applyStyles(
                  'pb-xs text-700 text-center text-uppercase',
                  {
                    fontSize: 18,
                  },
                )}>
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
              <View
                style={applyStyles('flex-row w-full justify-space-between')}>
                <View style={applyStyles({width: '60%'})}>
                  <Text style={applyStyles('text-400')}>
                    Receipt For:{' '}
                    <Text style={applyStyles('text-500')}>
                      {customer?.name}
                    </Text>
                  </Text>
                </View>
                <View style={applyStyles({width: '60%'})}>
                  <Text style={applyStyles('text-400')}>
                    {format(new Date(), 'dd/MM/yyyy')}
                  </Text>
                  <Text style={applyStyles('text-400', {fontSize: 10})}>
                    {format(new Date(), 'hh:mm:a')}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <FlatList
                data={products}
                style={applyStyles('mt-lg')}
                renderItem={this.renderSummaryItem}
                keyExtractor={(item) => `${item.id}`}
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
  }
}
