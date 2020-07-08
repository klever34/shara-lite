import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Touchable from '../../../components/Touchable';
import {colors} from '../../../styles';
import Icon from '../../../components/Icon';
import {applyStyles} from '../../../helpers/utils';

type Props = {
  buttonIcon?: string;
  onClick?(): void;
  buttonText?: string;
  children: React.ReactNode;
};

const ActionCard = (props: Props) => {
  const {children, onClick, buttonIcon, buttonText} = props;
  return (
    <View style={styles.container}>
      {children}
      {onClick && (
        <Touchable onPress={onClick}>
          <View
            style={applyStyles(
              'flex-row',
              'items-center',
              'justify-center',
              styles.button,
            )}>
            <Icon
              size={16}
              name={buttonIcon}
              type="feathericons"
              color={colors.primary}
            />
            <Text style={applyStyles('text-400', styles.buttonText)}>
              {buttonText}
            </Text>
          </View>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    borderRadius: 8,
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors['gray-20'],
  },
  buttonText: {
    fontSize: 16,
    paddingLeft: 4,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});

export default ActionCard;
