import React from 'react';
import {applyStyles} from '@/styles';
import {View} from 'react-native';
import {Button, ButtonProps} from '@/components/Button';

type ActionButtonSetProps = {
  actionBtns: ButtonProps[];
};

const ActionButtonSet = ({actionBtns}: ActionButtonSetProps) => {
  return (
    <View style={applyStyles('w-full flex-row')}>
      {actionBtns.map((actionBtn, index, arr) => {
        return (
          <View
            key={`${arr}-${index}`}
            style={applyStyles(
              'flex-1',
              index !== 0 && 'ml-8',
              index !== arr.length - 1 && 'mr-8',
            )}>
            {actionBtn && <Button {...actionBtn} />}
          </View>
        );
      })}
    </View>
  );
};

export default ActionButtonSet;
