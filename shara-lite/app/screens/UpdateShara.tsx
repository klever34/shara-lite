import {Button} from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import {getI18nService} from '@/services';
import {applyStyles} from '@/styles';
import React, {useCallback} from 'react';
import {Linking, SafeAreaView} from 'react-native';

const strings = getI18nService().strings;

const UpdateSharaScreen = () => {
  const handleOpenStore = useCallback(() => {
    Linking.openURL('market://details?id=co.shara.lite');
  }, []);

  return (
    <SafeAreaView style={applyStyles('flex-1 px-16')}>
      <EmptyState
        source={require('../assets/images/shara-lite_logo.png')}
        imageStyle={applyStyles({
          width: '80%',
          height: '25%',
          marginBottom: 0,
          resizeMode: 'contain',
        })}
        heading={strings('update_shara.title')}
        text={strings('update_shara.description')}>
        <Button
          onPress={handleOpenStore}
          title={strings('update_shara.submit_button')}
          style={applyStyles('w-full mt-32')}
        />
      </EmptyState>
    </SafeAreaView>
  );
};

export default UpdateSharaScreen;
