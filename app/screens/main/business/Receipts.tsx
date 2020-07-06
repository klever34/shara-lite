import React from 'react';
import {SafeAreaView, StyleSheet, Text, Platform} from 'react-native';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../styles';
import Icon from '../../../components/Icon';

const Receipts = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <FAButton
        style={styles.fabButton}
        onPress={() => {
          navigation.navigate('Contacts');
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
    height: 48,
    width: 'auto',
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  fabButtonText: {
    paddingLeft: 8,
    color: colors.white,
  },
});

export default Receipts;
