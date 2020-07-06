import React, {useLayoutEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, Platform} from 'react-native';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../styles';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';

const Receipts = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <FAButton
        style={styles.fabButton}
        onPress={() => {
          navigation.navigate('NewReceipt');
        }}>
        <Icon
          type="ionicons"
          name={
            Platform.select({
              android: 'md-add',
              ios: 'ios-add',
            }) as string
          }
          size={20}
          color="white"
        />
        <Text style={styles.fabButtonText}>Issue a receipt</Text>
      </FAButton>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  fabButton: {
    height: 40,
    width: 'auto',
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  fabButtonText: {
    paddingLeft: 8,
    color: colors.white,
  },
});

export default Receipts;
