import React, {useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Platform,
  Image,
  StyleSheet,
  ViewStyle,
  ImageProps,
  TextStyle,
} from 'react-native';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import {Button} from '../../components/Button';
import {applyStyles} from '../../helpers/utils';
import {colors} from '../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '.';

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

const StatusModal = ({
  route,
}: StackScreenProps<MainStackParamList, 'StatusModal'>) => {
  const {onClick, status, text} = route.params;
  const navigation = useNavigation();
  const statusProps: StatusProps = {
    success: {
      heading: 'Success!',
      buttonText: 'Done',
      closeButtonColor: colors.primary,
      icon: require('../../assets/icons/check-circle.png'),
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
      icon: require('../../assets/icons/x-circle.png'),
      buttonVariant: 'white',
      style: {
        text: {color: colors.white},
        heading: {color: colors.white},
        container: {backgroundColor: colors.primary},
      },
    },
  };
  const type = statusProps[status];

  const handleCloseModal = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles(styles.container, type.style.container)}>
      {status === 'error' && (
        <Touchable onPress={handleCloseModal} style={styles.closeButton}>
          <Icon
            type="ionicons"
            name={
              Platform.select({
                android: 'md-close',
                ios: 'ios-close',
              }) as string
            }
            color={type.closeButtonColor}
            size={16}
          />
        </Touchable>
      )}
      <View style={styles.content}>
        <Image source={type.icon} style={applyStyles('mb-xl', styles.icon)} />
        <Text
          style={applyStyles('pb-sm', styles.headingText, type.style.heading)}>
          {type.heading}
        </Text>
        <Text style={applyStyles(styles.subText, type.style.text)}>{text}</Text>
      </View>
      <View style={styles.actionButton}>
        <Button
          onPress={onClick}
          title={type.buttonText}
          variantColor={type.buttonVariant}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 48,
    paddingHorizontal: 12,
  },
  closeButton: {
    height: 40,
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 100,
    height: 100,
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: 16,
    maxWidth: 260,
    lineHeight: 27,
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
  actionButton: {},
});

export default StatusModal;
