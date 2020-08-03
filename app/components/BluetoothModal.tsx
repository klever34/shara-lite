import React, {useEffect, useState, useCallback} from 'react';
import Modal from 'react-native-modal';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform,
  ToastAndroid,
} from 'react-native';
import Icon from './Icon';
import {Button} from './Button';
import Touchable from './Touchable';

type BluetoothDevice = {address: string; name?: string};
type BluetoothDeviceItem = {item: BluetoothDevice};
type Props = {
  print?: boolean;
  error?: boolean;
  success?: boolean;
  onClose?: () => void;
  onPrintReceipt?: () => void;
};

export const BluetoothModal = ({
  error,
  print,
  success,
  onClose,
  onPrintReceipt,
}: Props) => {
  const [section, setSection] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isPrinting, setIsPrinting] = useState(print || false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isPrintError, setIsPrintError] = useState(error || false);
  const [isPrintSuccess, setIsPrintSuccess] = useState(success || false);

  const _listeners: any[] = [];

  const handleClose = useCallback(() => {
    setVisible(false);
    setIsPrinting(false);
    setIsPrintError(false);
    setIsPrintSuccess(false);
    onClose && onClose();
  }, [onClose]);

  const handleBluetoothScan = useCallback(() => {
    setIsScanning(true);
    BluetoothManager.scanDevices().then(
      (s: any) => {
        var ss = JSON.parse(s);
        setDevices([...devices, ...ss.paired, ...ss.found]);
        setIsScanning(false);
      },
      (error: any) => {
        setIsScanning(false);
        Alert.alert('Error', JSON.stringify(error));
      },
    );
  }, [devices]);

  const handleEnableBluetooth = useCallback(() => {
    BluetoothManager.enableBluetooth().then(
      (r: any[]) => {
        var paired = [];
        if (r && r.length > 0) {
          for (var i = 0; i < r.length; i++) {
            try {
              paired.push(JSON.parse(r[i]));
              setDevices([...paired, ...devices]);
              setSection(1);
            } catch (e) {
              //ignore
            }
          }
        } else {
          handleBluetoothScan();
        }
      },
      (error: any) => {
        Alert.alert('Error', JSON.stringify(error));
      },
    );
  }, [devices, handleBluetoothScan]);

  const handleConnect = useCallback((rowData) => {
    BluetoothManager.connect(rowData.address).then(
      (s: any) => {
        console.log(s);
        setVisible(false);
      },
      (error: any) => {
        Alert.alert('Error', error.message);
      },
    );
  }, []);

  const handlePrintReceipt = useCallback(() => {
    onPrintReceipt && onPrintReceipt();
  }, [onPrintReceipt]);

  const deviceAlreadyPaired = useCallback(
    (rsp: {devices: BluetoothDevice[]} | {devices: string}) => {
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) {}
      }
      if (ds && ds.length) {
        let paired = devices;
        paired = paired.concat(ds || []);
        setDevices(paired);

        // get default printer and connect automatically
        const defaultPrinter = paired.find(
          (item) => item.address === '10:8E:E0:AA:85:39',
        );
        if (defaultPrinter) {
          handleConnect(defaultPrinter);
        } else {
          setVisible(true);
        }
      }
    },
    [devices, handleConnect],
  );

  const deviceFoundEvent = useCallback(
    (rsp: {device: BluetoothDevice} | {device: string}) => {
      var r: any | null = null;
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device;
        } else {
          r = JSON.parse(rsp.device);
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
      if (r) {
        let found = devices || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x: BluetoothDevice) {
            return x.address === r.address;
          });
          //CHECK DEPLICATED HERE...
          if (duplicated === -1) {
            found.push(r);
            setDevices(found);

            // get default printer and connect automatically
            const defaultPrinter = found.find(
              (item) => item.address === '10:8E:E0:AA:85:39',
            );
            if (defaultPrinter) {
              handleConnect(defaultPrinter);
            } else {
              setVisible(true);
            }
          }
        }
      }
    },
    [devices, handleConnect],
  );

  const renderBluetoothDevice = useCallback(
    ({item: device}: BluetoothDeviceItem) => {
      return (
        <Touchable onPress={() => handleConnect(device)}>
          <View
            style={applyStyles('p-lg', {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <Text style={applyStyles('text-400', {fontSize: 16})}>
              {device.name || 'UNKNOWN'}
            </Text>
            <Text
              style={applyStyles('text-400', {
                color: colors['gray-200'],
                fontSize: 12,
              })}>
              {device.address}
            </Text>
          </View>
        </Touchable>
      );
    },
    [handleConnect],
  );

  const renderSetupBluetooth = useCallback(() => {
    return (
      <View style={applyStyles('px-lg py-xl items-center justify-center')}>
        <View
          style={applyStyles('items-center justify-center', {
            maxWidth: 240,
          })}>
          <Icon
            size={48}
            name="bluetooth"
            type="feathericons"
            color={colors['gray-50']}
            style={applyStyles('mb-xl')}
          />
          <Text
            style={applyStyles('pb-xl text-400 text-center', {
              fontSize: 16,
              color: colors['gray-200'],
            })}>
            Your Bluetooth is disabled. It needs to be enabled for print.
          </Text>
        </View>
        <Button
          variantColor="red"
          title="Enable bluetooth"
          style={applyStyles('w-full')}
          onPress={handleEnableBluetooth}
        />
      </View>
    );
  }, [handleEnableBluetooth]);

  const renderDeviceList = useCallback(() => {
    return (
      <View style={applyStyles('pb-xl')}>
        <View
          style={applyStyles('p-sm', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Text
            style={applyStyles('text-500 text-center text-uppercase', {
              fontSize: 12,
            })}>
            Bluetooth device list
          </Text>
        </View>
        <FlatList
          data={devices}
          renderItem={renderBluetoothDevice}
          keyExtractor={(item, index) => `${item.address}-${index}`}
          ListEmptyComponent={
            <View style={applyStyles('items-center justify-center py-xl')}>
              <Text
                style={applyStyles('mb-lg text-400 text-center', {
                  fontSize: 16,
                  color: colors['gray-200'],
                })}>
                No nearby Bluetooth devices were found
              </Text>
              <Button
                variantColor="clear"
                title="Search for devices"
                onPress={handleBluetoothScan}
              />
            </View>
          }
        />
        <View style={applyStyles('py-md px-lg')}>
          <Button title="Scan" onPress={handleBluetoothScan} />
        </View>
      </View>
    );
  }, [devices, handleBluetoothScan, renderBluetoothDevice]);

  const renderPrintInProgress = useCallback(() => {
    return (
      <View
        style={applyStyles('px-lg pb-xl items-center justify-center', {
          paddingTop: 48,
        })}>
        <Icon
          size={48}
          name="printer"
          type="feathericons"
          color={colors['gray-50']}
          style={applyStyles('mb-lg')}
        />
        <Text
          style={applyStyles('text-400 text-center pb-xl', {
            fontSize: 16,
            color: colors['gray-200'],
          })}>
          Print in progress...
        </Text>
        <Button
          title="Cancel"
          onPress={handleClose}
          style={applyStyles('w-full')}
        />
      </View>
    );
  }, [handleClose]);

  const renderPrintSuccess = useCallback(() => {
    return (
      <View
        style={applyStyles('px-lg pb-xl items-center justify-center', {
          paddingTop: 48,
        })}>
        <Icon
          size={48}
          name="check-circle"
          type="feathericons"
          color={colors.primary}
          style={applyStyles('mb-lg')}
        />
        <Text
          style={applyStyles('text-400 text-center pb-xl', {
            fontSize: 16,
            color: colors['gray-200'],
          })}>
          Print Successful
        </Text>
        <Button
          title="Done"
          onPress={handleClose}
          style={applyStyles('w-full')}
        />
      </View>
    );
  }, [handleClose]);

  const renderPrintError = useCallback(() => {
    return (
      <View
        style={applyStyles('px-lg pb-xl items-center justify-center', {
          paddingTop: 48,
        })}>
        <Icon
          size={48}
          name="x-circle"
          type="feathericons"
          color={colors.primary}
          style={applyStyles('mb-lg')}
        />
        <Text
          style={applyStyles('text-400 text-center pb-xl px-xl', {
            fontSize: 16,
            color: colors['gray-200'],
          })}>
          We encountered an error while trying to print.
        </Text>
        <View style={applyStyles('flex-row w-full justify-space-between')}>
          <View style={applyStyles({width: '48%'})}>
            <Button title="Cancel" variantColor="clear" onPress={handleClose} />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Button title="Retry" onPress={handlePrintReceipt} />
          </View>
        </View>
      </View>
    );
  }, [handleClose, handlePrintReceipt]);

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      (enabled: boolean) => {
        if (enabled) {
          setSection(1);
          handleBluetoothScan();

          if (Platform.OS === 'ios') {
            let bluetoothManagerEmitter = new NativeEventEmitter(
              BluetoothManager,
            );
            _listeners.push(
              bluetoothManagerEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                  deviceAlreadyPaired(rsp);
                },
              ),
            );
            _listeners.push(
              bluetoothManagerEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND,
                (rsp) => {
                  deviceFoundEvent(rsp);
                },
              ),
            );
          } else if (Platform.OS === 'android') {
            _listeners.push(
              DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                  deviceAlreadyPaired(rsp);
                },
              ),
            );
            _listeners.push(
              DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND,
                (rsp) => {
                  deviceFoundEvent(rsp);
                },
              ),
            );
            _listeners.push(
              DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
                () => {
                  ToastAndroid.show(
                    'Device Not Support Bluetooth !',
                    ToastAndroid.LONG,
                  );
                },
              ),
            );
          }
        } else {
          setSection(0);
          setVisible(true);
        }
      },
      (err: any) => {
        Alert.alert('Error', err);
      },
    );
    return () => {
      for (let ls in _listeners) {
        _listeners[ls].remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (print) {
      setVisible(true);
      setIsPrinting(true);
      setSection(2);
    }
  }, [print]);

  useEffect(() => {
    if (success) {
      setSection(3);
      setIsPrintSuccess(true);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setIsPrintError(true);
      setSection(4);
    }
  }, [error]);

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={handleClose}
      onBackButtonPress={handleClose}
      style={applyStyles({
        margin: 0,
        justifyContent: 'flex-end',
      })}>
      <View
        style={applyStyles({
          backgroundColor: colors.white,
        })}>
        {isScanning ? (
          <View
            style={applyStyles('items-center justify-center', {
              marginVertical: 100,
            })}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={applyStyles('mb-md')}
            />
            <Text style={applyStyles('text-center text-400', {fontSize: 18})}>
              Scanning...
            </Text>
          </View>
        ) : (
          <View>
            {section === 0 && renderSetupBluetooth()}
            {section === 1 && renderDeviceList()}
            {section === 2 && isPrinting && renderPrintInProgress()}
            {section === 3 && isPrintSuccess && renderPrintSuccess()}
            {section === 4 && isPrintError && renderPrintError()}
          </View>
        )}
      </View>
    </Modal>
  );
};
