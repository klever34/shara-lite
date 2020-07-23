import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {colors} from '../../../styles';
import format from 'date-fns/format';
import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  View,
  TextStyle,
  ImageProps,
  ViewStyle,
  Platform,
  StyleSheet,
} from 'react-native';
import Touchable from '../../../components/Touchable';
import Icon from '../../../components/Icon';
import {Button} from '../../../components';

type Props = {
  amountPaid: number;
  visible: boolean;
  timeTaken: number;
  onClose: () => void;
  isSubmitting: boolean;
  creditAmount: number;
  onComplete: () => void;
  onOpenShareModal: () => void;
  onOpenCustomerModal: () => void;
};

type StatusProps = {
  [key: string]: PageProps;
};

type PageProps = {
  heading: string;
  buttonText: string;
  closeButtonColor: string;
  icon: ImageProps['source'];
  buttonVariant: 'red' | 'white';
  style: {container: ViewStyle; text: TextStyle; heading: TextStyle};
};

export const ReceiptStatusModal = (props: Props) => {
  const {
    visible,
    timeTaken,
    amountPaid,
    onComplete,
    isSubmitting,
    creditAmount,
    onOpenShareModal,
    onOpenCustomerModal,
  } = props;

  const statusProps: StatusProps = {
    success: {
      heading: 'Success!',
      buttonText: 'Done',
      closeButtonColor: colors.primary,
      icon: require('../../../assets/icons/check-circle.png'),
      buttonVariant: 'red',
      style: {
        text: {color: colors['gray-200']},
        heading: {color: colors['gray-300']},
        container: {backgroundColor: colors.white},
      },
    },
    error: {
      heading: 'Error!',
      buttonText: 'Retry',
      closeButtonColor: colors.white,
      icon: require('../../../assets/icons/x-circle.png'),
      buttonVariant: 'white',
      style: {
        text: {color: colors.white},
        heading: {color: colors.white},
        container: {backgroundColor: colors.primary},
      },
    },
  };
  return (
    <Modal transparent={false} animationType="slide" visible={visible}>
      <ScrollView>
        <View style={styles.statusModalContent}>
          <Image
            source={statusProps.success.icon}
            style={applyStyles('mb-xl', styles.statusModalIcon)}
          />
          <Text
            style={applyStyles(
              'pb-sm',
              styles.statusModalHeadingText,
              statusProps.success.style.heading,
              'heading-700',
            )}>
            {statusProps.success.heading}
          </Text>
          <Text
            style={applyStyles(
              styles.statusModalDescription,
              statusProps.success.style.text,
              'text-400',
            )}>
            {`You have successfully issued a receipt for N${numberWithCommas(
              amountPaid,
            )} in Cash and N${numberWithCommas(creditAmount)} in Credit`}
          </Text>
          <Text
            style={applyStyles(
              styles.statusModalDescription,
              statusProps.success.style.text,
              'text-400',
            )}>
            Time taken: {format(timeTaken, 'mm:ss')}
          </Text>
        </View>

        <View style={applyStyles({marginBottom: 40, paddingHorizontal: 16})}>
          <View
            style={applyStyles('items-center, justify-center', {
              marginBottom: 16,
            })}>
            <Text
              style={applyStyles('text-400', 'text-center', {
                color: colors['gray-100'],
              })}>
              Do you want to add the customers' details?
            </Text>
          </View>

          <Touchable onPress={onOpenCustomerModal}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center', {
                paddingVertical: 16,
              })}>
              <Icon
                size={24}
                type="ionicons"
                name={
                  Platform.select({
                    android: 'md-add',
                    ios: 'ios-add',
                  }) as string
                }
                color={colors.primary}
              />
              <Text style={styles.addProductButtonText}>
                Add customer details
              </Text>
            </View>
          </Touchable>
          <Button
            onPress={() => {}}
            variantColor="white"
            style={applyStyles({marginTop: 24})}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="printer"
                type="feathericons"
                color={colors['gray-50']}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  color: colors['gray-200'],
                })}>
                Print receipt
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          variantColor="clear"
          style={styles.actionButton}
          onPress={onOpenShareModal}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={24}
              name="share"
              type="feathericons"
              color={colors['gray-50']}
            />
            <Text
              style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Share
            </Text>
          </View>
        </Button>
        <Button
          title="Finish"
          variantColor="red"
          isLoading={isSubmitting}
          onPress={onComplete}
          style={styles.actionButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  addProductButtonText: {
    paddingLeft: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Rubik-Regular',
  },
  actionButtons: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  actionButton: {
    width: '48%',
  },
  statusModalContent: {
    flex: 1,
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
    borderBottomColor: colors['gray-20'],
  },
  statusModalIcon: {
    width: 64,
    height: 64,
  },
  statusModalHeadingText: {
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statusModalDescription: {
    fontSize: 16,
    maxWidth: 260,
    lineHeight: 27,
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
});
