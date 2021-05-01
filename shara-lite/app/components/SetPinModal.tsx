import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';
import {Icon} from './Icon';
import Touchable from './Touchable';

type SetPinModalProps = {
  onSkip(): void;
  onSetWithdrawalPin(): void;
};

const strings = getI18nService().strings;

export const SetPinModal = (props: SetPinModalProps) => {
  const {onSkip, onSetWithdrawalPin} = props;

  return (
    <View
      style={applyStyles('px-16 bg-white pb-40 pt-80 flex-1 justify-between')}>
      <View
        style={applyStyles('flex-row center w-96 h-96 bg-green-10', {
          borderRadius: '50%',
        })}>
        <Icon
          size={64}
          name="lock"
          type="feathericons"
          color={colors['green-200']}
        />
      </View>
      <View>
        <View style={applyStyles('mb-8 px-2 py-4 bg-green-10 rounded-8')}>
          <Text style={applyStyles('text-uppercase text-green-200')}>
            {strings('new_feature')}
          </Text>
        </View>
        <Text style={applyStyles('pb-16 text-center text-black text-lg')}>
          {strings('set_pin_modal.heading')}
        </Text>
        <Text style={applyStyles('text-gray-200 text-center')}>
          {strings('set_pin_modal.caption')}
        </Text>
      </View>
      <View>
        <Touchable onPress={onSetWithdrawalPin}>
          <View style={applyStyles('py-8 mb-4 center')}>
            <Text style={applyStyles('text-uppercase text-secondary text-400')}>
              {strings('set_pin_modal.action_button_text')}
            </Text>
          </View>
        </Touchable>
        <Touchable onPress={onSkip}>
          <View style={applyStyles('py-8 center')}>
            <Text style={applyStyles('text-uppercase text-gray-300 text-400')}>
              {strings('skip')}
            </Text>
          </View>
        </Touchable>
      </View>
    </View>
  );
};
