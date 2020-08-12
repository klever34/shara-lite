import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform,
  SectionList,
  Text,
  ToastAndroid,
  View,
  ScrollView,
} from 'react-native';
// @ts-ignore
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import Modal from 'react-native-modal';
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import {Button} from './Button';
import Icon from './Icon';
import Touchable from './Touchable';
import {getStorageService} from '../services';

type BluetoothDevice = {address: string; name?: string};
type BluetoothDeviceItem = {item: BluetoothDevice};
type Props = {
  print?: boolean;
  error?: boolean;
  visible?: boolean;
  success?: boolean;
  onClose?: () => void;
  onPrintReceipt?: (address?: string) => void;
};

export const BluetoothModal = ({
  error,
  print,
  success,
  onClose,
  visible,
  onPrintReceipt,
}: Props) => {
  const [section, setSection] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isPrinting, setIsPrinting] = useState(print || false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [isPrintError, setIsPrintError] = useState(error || false);
  const [isPrintSuccess, setIsPrintSuccess] = useState(success || false);

  const storageService = getStorageService();

  const _listeners: any[] = [];
  const devices = [
    {
      data: pairedDevices,
      title: 'Paired devices',
    },
    {
      data: foundDevices,
      title: 'Available devices',
    },
  ];

  const handleClose = useCallback(() => {
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
        setPairedDevices(ss.paired);
        setFoundDevices(ss.found);
        setIsScanning(false);
      },
      (errorData: any) => {
        setIsScanning(false);
        Alert.alert('Error', JSON.stringify(errorData));
      },
    );
  }, []);

  const handleEnableBluetooth = useCallback(() => {
    BluetoothManager.enableBluetooth().then(
      (r: any[]) => {
        var paired = [];
        if (r && r.length > 0) {
          for (var i = 0; i < r.length; i++) {
            try {
              paired.push(JSON.parse(r[i]));
              setPairedDevices(paired);
              setSection(1);
            } catch (e) {
              //ignore
            }
          }
        } else {
          handleBluetoothScan();
        }
      },
      (errorInfo: any) => {
        Alert.alert('Error', JSON.stringify(errorInfo));
      },
    );
  }, [handleBluetoothScan]);

  const handlePrintReceipt = useCallback(
    async (address?: string) => {
      const savedPrinter = (await storageService.getItem('printer')) as {
        address: string;
      };
      if (savedPrinter) {
        onPrintReceipt && onPrintReceipt(savedPrinter.address);
      } else {
        onPrintReceipt && onPrintReceipt(address);
      }
    },
    [onPrintReceipt, storageService],
  );

  const handleConnect = useCallback(
    (rowData) => {
      BluetoothManager.connect(rowData.address).then(
        async () => {
          await storageService.setItem('printer', {
            address: rowData.address,
          });
          handleClose();
          handlePrintReceipt(rowData.address);
        },
        (e: any) => {
          Alert.alert('Error', e.message);
        },
      );
    },
    [handleClose, handlePrintReceipt, storageService],
  );

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
        let paired = pairedDevices;
        paired = paired.concat(ds || []);
        setPairedDevices(paired);

        // get default printer and connect automatically
        const defaultPrinter = paired.find(
          (item) => item.address === '10:8E:E0:AA:85:39',
        );
        if (defaultPrinter) {
          handleConnect(defaultPrinter);
        }
      }
    },
    [pairedDevices, handleConnect],
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
        let found = foundDevices || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x: BluetoothDevice) {
            return x.address === r.address;
          });
          //CHECK DEPLICATED HERE...
          if (duplicated === -1) {
            found.push(r);
            setFoundDevices(found);

            // get default printer and connect automatically
            const defaultPrinter = found.find(
              (item) => item.address === 'DC:0D:30:91:67:90',
            );
            if (defaultPrinter) {
              handleConnect(defaultPrinter);
            }
          }
        }
      }
    },
    [foundDevices, handleConnect],
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
      <ScrollView style={applyStyles('pb-xl')}>
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
        <SectionList
          sections={devices}
          renderItem={renderBluetoothDevice}
          keyExtractor={(item, index) => `${item.address}-${index}`}
          renderSectionHeader={({section: {title}}) => (
            <Text
              style={applyStyles('px-lg py-sm text-500 text-uppercase', {
                fontSize: 12,
              })}>
              {title}
            </Text>
          )}
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
      </ScrollView>
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
                    'Device does not support bluetooth!',
                    ToastAndroid.LONG,
                  );
                },
              ),
            );
          }
        } else {
          setSection(0);
          // setVisible(true);
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
      onBackdropPress={handleClose}
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
            <Text style={applyStyles('text-center text-500', {fontSize: 18})}>
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
