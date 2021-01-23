import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform,
  SectionList,
  ToastAndroid,
  View,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import {Text} from '@/components';
// @ts-ignore
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import Modal from 'react-native-modal';
import {colors} from '@/styles';
import {Button} from './Button';
import Icon from './Icon';
import Touchable from './Touchable';
import {getAnalyticsService, getStorageService} from '../services';
import {applyStyles} from '@/styles';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type BluetoothDevice = {address: string; name?: string};
type BluetoothModalProps = {
  print?: boolean;
  error?: boolean;
  visible?: boolean;
  success?: boolean;
  onClose?: () => void;
  onPrintReceipt?: (address?: string) => void;
};

export const BluetoothModal = ({
  onClose,
  visible,
  onPrintReceipt,
}: BluetoothModalProps) => {
  const [section, setSection] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);

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
      () => {
        setIsScanning(false);
      },
    );
  }, []);

  const handlePrintReceipt = useCallback(
    async (address?: string) => {
      await storageService.setItem('printer', {
        address,
      });
      onPrintReceipt && onPrintReceipt(address);
      handleClose();
    },
    [onPrintReceipt, storageService, handleClose],
  );

  const handleEnableBluetooth = useCallback(() => {
    BluetoothManager.enableBluetooth().then(
      async (r: any[]) => {
        var paired = [];
        const savedPrinter = (await storageService.getItem('printer')) as {
          address: string;
        };
        if (savedPrinter) {
          handlePrintReceipt(savedPrinter.address);
          return;
        }
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
  }, [handleBluetoothScan, handlePrintReceipt, storageService]);

  const handleConnect = useCallback(
    (rowData: BluetoothDevice) => {
      getAnalyticsService().logEvent('selectContent', {
        item_id: String(rowData.name),
        content_type: 'BluetoothDevice',
      });
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
    ({item: device}: ListRenderItemInfo<BluetoothDevice>) => {
      return (
        <Touchable onPress={() => handleConnect(device)}>
          <View
            style={applyStyles('p-lg', {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <Text style={applyStyles('text-400', {fontSize: 16})}>
              {device.name || strings('unknown')}
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
      <View style={applyStyles('px-8 py-xl items-center justify-center')}>
        <View
          style={applyStyles('items-center justify-center', {
            maxWidth: 240,
          })}>
          <Text
            style={applyStyles(
              'pb-xl text-700 text-center text-uppercase text-sm text-gray-300',
            )}>
            {strings('bluetooth_printer.setup.title')}
          </Text>
          <Icon
            size={24}
            name="bluetooth"
            type="feathericons"
            color={colors.primary}
            style={applyStyles('mb-xl')}
          />
          <Text
            style={applyStyles(
              'pb-xl text-400 text-center text-base text-gray-300',
            )}>
            {strings('bluetooth_printer.setup.description')}
          </Text>
        </View>
        <View style={applyStyles('flex-row items-center justify-between')}>
          <View style={applyStyles('mr-8', {width: '48%'})}>
            <Button
              title={strings('cancel')}
              onPress={onClose}
              variantColor="white"
              style={applyStyles('w-full')}
            />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Button
              title={strings('enable')}
              variantColor="red"
              style={applyStyles('w-full')}
              onPress={handleEnableBluetooth}
            />
          </View>
        </View>
      </View>
    );
  }, [onClose, handleEnableBluetooth]);

  const renderDeviceList = useCallback(() => {
    return (
      <ScrollView style={applyStyles('pb-xl')} persistentScrollbar={true}>
        <View
          style={applyStyles('p-sm', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Text
            style={applyStyles('text-500 text-center text-uppercase', {
              fontSize: 12,
            })}>
            {strings('bluetooth_printer.select_printer')}
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
                {strings('bluetooth_printer.no_nearby_bluetooth')}
              </Text>
              <Button
                variantColor="clear"
                title={strings('search_for_devices')}
                onPress={handleBluetoothScan}
              />
            </View>
          }
        />
        <View
          style={applyStyles(
            'py-md px-lg flex-row items-center justify-between',
          )}>
          <View style={applyStyles('mr-8', {width: '48%'})}>
            <Button
              title={strings('cancel')}
              onPress={onClose}
              variantColor="white"
              style={applyStyles('w-full')}
            />
          </View>
          <View style={applyStyles({width: '48%'})}>
            <Button
              title={strings('scan')}
              style={applyStyles('w-full')}
              onPress={handleBluetoothScan}
            />
          </View>
        </View>
      </ScrollView>
    );
  }, [devices, onClose, handleBluetoothScan, renderBluetoothDevice]);

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
                    strings('bluetooth_printer.device_not_supported'),
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
        Alert.alert(strings('alert.error'), err);
      },
    );
    return () => {
      for (let ls in _listeners) {
        _listeners[ls].remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
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
              {strings('scanning')}...
            </Text>
          </View>
        ) : (
          <View>
            {section === 0 && renderSetupBluetooth()}
            {section === 1 && renderDeviceList()}
          </View>
        )}
      </View>
    </Modal>
  );
};
