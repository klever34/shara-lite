import {Button} from '@/components';
import {Checkbox} from '@/components/Checkbox';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

type ConfirmationModalProps = {
  onSubmit(): void;
  onClose(): void;
};

const strings = getI18nService().strings;

export const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {onSubmit, onClose} = props;

  const [clientTerm, setClientTerm] = useState(false);
  const [merchantTerm, setMerchantTerm] = useState(false);

  const handleClientTermChange = useCallback(() => {
    if (clientTerm) {
      setClientTerm(false);
    } else {
      setClientTerm(true);
    }
  }, [clientTerm]);

  const handleMerchantTermChange = useCallback(() => {
    if (merchantTerm) {
      setMerchantTerm(false);
    } else {
      setMerchantTerm(true);
    }
  }, [merchantTerm]);

  return (
    <View>
      <Text style={applyStyles('py-24 text-center text-uppercase text-700')}>
        {strings('bnpl.confirmation.title')}
      </Text>
      <View style={applyStyles('px-24')}>
        <Markdown
          style={{
            ordered_list: applyStyles('pb-32 text-lg text-gray-200'),
          }}>
          {strings('bnpl.confirmation.instruction')}
        </Markdown>
        <Checkbox
          value=""
          isChecked={merchantTerm}
          onChange={handleMerchantTermChange}
          containerStyle={applyStyles('justify-between')}
          leftLabel={
            <View style={applyStyles('flex-row items-center')}>
              <Markdown
                style={{
                  textgroup: applyStyles('text-400 text-lg text-gray-200'),
                }}>
                {strings('bnpl.confirmation.merchant_terms')}
              </Markdown>
            </View>
          }
        />
        <Checkbox
          value=""
          isChecked={clientTerm}
          onChange={handleClientTermChange}
          containerStyle={applyStyles('justify-between mb-32')}
          leftLabel={
            <View style={applyStyles('flex-row items-center')}>
              <Markdown
                style={{
                  textgroup: applyStyles('text-400 text-lg text-gray-200'),
                }}>
                {strings('bnpl.confirmation.client_terms')}
              </Markdown>
            </View>
          }
        />
      </View>
      <View
        style={applyStyles('p-24 flex-row justify-end border-t-1', {
          borderColor: colors['gray-20'],
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Button
            onPress={onClose}
            variantColor="clear"
            title={strings('cancel')}
            textStyle={applyStyles('text-secondary text-uppercase')}
            style={applyStyles('mr-16', {width: 120, borderWidth: 0})}
          />
          <Button
            onPress={onSubmit}
            variantColor="blue"
            title={strings('confirm')}
            style={applyStyles({width: 120})}
            disabled={!clientTerm || !merchantTerm}
            textStyle={applyStyles('text-uppercase')}
          />
        </View>
      </View>
    </View>
  );
};
