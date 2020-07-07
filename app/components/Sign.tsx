import React, {useRef} from 'react';
import {StyleSheet, View, ViewStyle, Text} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {applyStyles} from '../helpers/utils';
import Touchable from './Touchable';
import {colors} from '../styles';

type Data = {
  encoded: string;
  pathName: string;
};

type Props = {
  style: ViewStyle;
  onChange?(data: Data): void;
};

const ESign = (props: Props) => {
  const {style, onChange} = props;
  const ref = useRef<any>(null);

  const saveSign = () => {
    ref.current.saveImage();
  };

  const resetSign = () => {
    ref.current.resetImage();
  };

  const onSaveEvent = (result: any) => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    console.log(result);
    onChange && onChange(result);
  };
  const onDragEvent = () => {
    // This callback will be called when the user enters signature
    console.log('dragged');
  };
  return (
    <View style={applyStyles('flex-1', 'flex-column')}>
      {/* <View
        style={applyStyles(
          'flex-1',
          'flex-row',
          'justify-center',
          'item-center',
        )}>
        <Touchable
          style={styles.buttonStyle}
          onPress={() => {
            saveSign();
          }}>
          <Text style={styles.buttonTextStyle}>Save</Text>
        </Touchable>
        <Touchable
          style={styles.buttonStyle}
          onPress={() => {
            resetSign();
          }}>
          <Text style={styles.buttonTextStyle}>Reset</Text>
        </Touchable>
      </View>
     */}
    </View>
  );
};

const styles = StyleSheet.create({
  signature: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: 'red',
  },
  buttonStyle: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextStyle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ESign;
