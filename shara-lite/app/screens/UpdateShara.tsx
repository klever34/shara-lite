import React from 'react';
import EmptyState from '@/components/EmptyState';
import {Button} from '@/components';
import {getI18nService} from '@/services';
import {SafeAreaView} from 'react-native';
import {applyStyles} from '@/styles';

const strings = getI18nService().strings;

const UpdateSharaScreen = () => {
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
          title={strings('update_shara.submit_button')}
          style={applyStyles('w-full mt-32')}
        />
      </EmptyState>
    </SafeAreaView>
  );
};

export default UpdateSharaScreen;
