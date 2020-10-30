import React, {ReactNode} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {Icon} from './Icon';
import {FAButton} from 'app-v3/components';
import {applyStyles} from 'app-v3/styles';

type Props = {
  style?: ViewStyle;
  children: ReactNode;
  onSnapReceipt(): void;
  onCreateReceipt(): void;
};

export const HomeContainer = ({
  style,
  children,
  // onSnapReceipt,
  onCreateReceipt,
}: Props) => {
  return (
    <View style={applyStyles('flex-1', {...style})}>
      <View style={applyStyles('flex-1')}>{children}</View>
      <FAButton
        style={applyStyles(
          'w-auto rounded-16 py-16 px-20 flex-row items-center',
        )}
        onPress={onCreateReceipt}>
        <Icon size={20} name="plus" color="white" type="feathericons" />
        <Text
          style={applyStyles(
            'text-400 text-uppercase pl-sm text-sm text-white',
          )}>
          Create Receipt
        </Text>
      </FAButton>
      {/*<View*/}
      {/*    style={applyStyles('flex-row center justify-between px-md py-lg', {*/}
      {/*      elevation: 100,*/}
      {/*      borderTopWidth: 1,*/}
      {/*      backgroundColor: colors.white,*/}
      {/*      borderTopColor: colors['gray-20'],*/}
      {/*    })}>*/}
      {/*  <View style={applyStyles({width: '48%'})}>*/}
      {/*    <Button onPress={onCreateReceipt}>*/}
      {/*      <View style={applyStyles('flex-row center')}>*/}
      {/*        <Icon*/}
      {/*            size={24}*/}
      {/*            name="plus"*/}
      {/*            type="feathericons"*/}
      {/*            color={colors.white}*/}
      {/*        />*/}
      {/*        <Text*/}
      {/*            style={applyStyles(*/}
      {/*                'text-400 text-uppercase pl-sm text-xs text-white',*/}
      {/*            )}>*/}
      {/*          Create receipt*/}
      {/*        </Text>*/}
      {/*      </View>*/}
      {/*    </Button>*/}
      {/*  </View>*/}
      {/*  <View style={applyStyles({width: '48%'})}>*/}
      {/*    <Button onPress={onSnapReceipt} variantColor="clear">*/}
      {/*      <View style={applyStyles('flex-row center')}>*/}
      {/*        <Icon*/}
      {/*            size={24}*/}
      {/*            name="camera"*/}
      {/*            type="feathericons"*/}
      {/*            color={colors['gray-300']}*/}
      {/*        />*/}
      {/*        <Text*/}
      {/*            style={applyStyles(*/}
      {/*                'text-400 text-uppercase pl-sm text-xs text-gray-300',*/}
      {/*            )}>*/}
      {/*          snap receipt*/}
      {/*        </Text>*/}
      {/*      </View>*/}
      {/*    </Button>*/}
      {/*  </View>*/}
      {/*</View>*/}
    </View>
  );
};
