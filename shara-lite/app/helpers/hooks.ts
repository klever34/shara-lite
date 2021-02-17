import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useAppNavigation} from '@/services/navigation';
import Clipboard from '@react-native-community/clipboard';
import {ToastContext} from '@/components/Toast';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export const useInfo = <T extends any>(getInfo: () => T) => {
  const getInfoRef = useRef(getInfo);
  const [info, setInfo] = useState(getInfo());
  const navigation = useAppNavigation();
  useEffect(() => {
    return navigation.addListener('focus', () => {
      setInfo(getInfoRef.current());
    });
  }, [navigation]);
  return info;
};

export const useClipboard = () => {
  const {showSuccessToast} = useContext(ToastContext);
  const copyToClipboard = useCallback(
    (
      value: string,
      options: {showToast: boolean | string} = {showToast: true},
    ) => {
      Clipboard.setString(value);
      if (options.showToast) {
        showSuccessToast(
          typeof options.showToast === 'string'
            ? options.showToast
            : strings('copied'),
        );
      }
    },
    [showSuccessToast],
  );
  return {copyToClipboard};
};
