import {ICustomer} from '@/models';
import {IReceiptItem} from '@/models/ReceiptItem';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList, View, ViewStyle} from 'react-native';
import {captureRef} from 'react-native-view-shot';
import RNFetchBlob from 'rn-fetch-blob';
import {User} from 'types/app';

type Props = {
  tax?: number;
  createdAt?: Date;
  user: User | null;
  amountPaid?: number;
  customer?: ICustomer;
  totalAmount?: number;
  creditDueDate?: Date;
  creditAmount?: number;
  isCancelled?: boolean;
  products?: IReceiptItem[];
  containerStyle?: ViewStyle;
  getImageUri: (base64: string) => void;
};

export const ReceiptImage = (props: Props) => {
  const {
    // tax,
    // user,
    customer,
    // products,
    // createdAt,
    // amountPaid,
    // totalAmount,
    getImageUri,
    // isCancelled,
    // creditAmount,
    // creditDueDate,
    containerStyle,
  } = props;

  // const businessInfo = getAuthService().getBusinessInfo();
  const viewRef = useRef<any>(null);

  const onCapture = useCallback(async () => {
    captureRef(viewRef, {
      format: 'png',
    }).then(
      (uri) => {
        RNFetchBlob.fs.readFile(uri, 'base64').then((data) => {
          getImageUri(data);
        });
      },
      (error) => console.error('Oops, snapshot failed', error),
    );
  }, [getImageUri]);

  // const renderSummaryItem = useCallback(({item}: any) => null, []);

  useEffect(() => {
    if (customer?.name) {
      onCapture();
    }
  }, [customer, onCapture]);

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
        ...containerStyle,
      })}
      ref={viewRef}>
      <FlatList
        data={[]}
        style={applyStyles('mt-lg')}
        renderItem={undefined}
        // keyExtractor={(item) => `${item._id}`}
        ListHeaderComponent={<></>}
        ListFooterComponent={<></>}
      />
    </View>
  );
};
