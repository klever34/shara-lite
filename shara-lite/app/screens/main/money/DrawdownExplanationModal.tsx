import {Header, HeaderTitleProps} from '@/components';
import {applyStyles} from '@/styles';
import React from 'react';
import {View} from 'react-native';

type DrawdownExplanationModalProps = {
  header: HeaderTitleProps;
};

export const DrawdownExplanationModal = ({
  header,
}: DrawdownExplanationModalProps) => {
  return (
    <View>
      <Header {...header} style={applyStyles('border-b-0 pt-12 pb-0')} />
      <View style={applyStyles('px-24 py-12')} />
    </View>
  );
};
