// import React, {useEffect, useState, useCallback} from 'react';
// import Modal from 'react-native-modal';
// import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
// import {applyStyles} from '../helpers/utils';
// import {colors} from '../styles';
// import {
//   View,
//   Text,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   DeviceEventEmitter,
//   NativeEventEmitter,
//   Platform,
//   ToastAndroid,
// } from 'react-native';
// import Icon from './Icon';
// import {Button} from './Button';
// import Touchable from './Touchable';

// type BluetoothDevice = {address: string; name?: string};
// type BluetoothDeviceItem = {item: BluetoothDevice};

export const BluetoothModal = () => {
  return null;
};
//   const [section, setSection] = useState(0);
//   const [visible, setVisible] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const [devices, setDevices] = useState<BluetoothDevice[]>([]);
//   const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(
//     null,
//   );

//   const _listeners: any[] = [];

//   const handleClose = useCallback(() => {
//     setVisible(false);
//   }, []);

//   const handleSelectDevice = useCallback((device) => {
//     setSelectedDevice(device);
//   }, []);

//   const handleBluetoothScan = useCallback(() => {
//     setIsScanning(true);
//     BluetoothManager.scanDevices().then(
//       (s: any) => {
//         var ss = JSON.parse(s);
//         setDevices([...devices, ...ss.paired, ...ss.found]);
//         setIsScanning(false);
//       },
//       (error: any) => {
//         setIsScanning(false);
//         Alert.alert('Error', JSON.stringify(error));
//       },
//     );
//   }, [devices]);

//   const handlePrint = useCallback(() => {}, []);

//   const deviceAlreadyPaired = useCallback(
//     (rsp: any) => {
//       var ds = null;
//       if (typeof rsp.devices === 'object') {
//         ds = rsp.devices;
//       } else {
//         try {
//           ds = JSON.parse(rsp.devices);
//         } catch (e) {}
//       }
//       if (ds && ds.length) {
//         let pared = devices;
//         pared = pared.concat(ds || []);
//         setDevices(pared);
//       }
//     },
//     [devices],
//   );

//   const deviceFoundEvent = useCallback(
//     (rsp: any) => {
//       var r: any | null = null;
//       try {
//         if (typeof rsp.device === 'object') {
//           r = rsp.device;
//         } else {
//           r = JSON.parse(rsp.device);
//         }
//       } catch (e) {
//         Alert.alert('Error', e.message);
//       }
//       if (r) {
//         let found = devices || [];
//         if (found.findIndex) {
//           let duplicated = found.findIndex(function (x: any) {
//             return x.address === r.address;
//           });
//           //CHECK DEPLICATED HERE...
//           if (duplicated === -1) {
//             found.push(r);
//             setDevices(found);
//           }
//         }
//       }
//     },
//     [devices],
//   );

//   const handleEnableBluetooth = useCallback(() => {
//     BluetoothManager.enableBluetooth().then(
//       (r: any[]) => {
//         var paired = [];
//         if (r && r.length > 0) {
//           for (var i = 0; i < r.length; i++) {
//             try {
//               paired.push(JSON.parse(r[i]));
//               setDevices([...paired, ...devices]);
//             } catch (e) {
//               //ignore
//             }
//           }
//         } else {
//           handleBluetoothScan();
//         }
//       },
//       (error: any) => {
//         Alert.alert('Error', JSON.stringify(error));
//       },
//     );
//   }, [devices, handleBluetoothScan]);

//   const renderBluetoothDevice = useCallback(
//     ({item: device}: BluetoothDeviceItem) => {
//       return (
//         <Touchable onPress={() => handleSelectDevice(device)}>
//           <View
//             style={applyStyles('p-lg', {
//               borderBottomWidth: 1,
//               borderBottomColor: colors['gray-20'],
//             })}>
//             <Text style={applyStyles('text-400', {fontSize: 16})}>
//               {device.name || 'UNKNOWN'}
//             </Text>
//             <Text
//               style={applyStyles('text-400', {
//                 color: colors['gray-200'],
//                 fontSize: 12,
//               })}>
//               {device.address}
//             </Text>
//           </View>
//         </Touchable>
//       );
//     },
//     [handleSelectDevice],
//   );

//   const renderSetupBluetooth = useCallback(() => {
//     return (
//       <View style={applyStyles('px-lg py-xl items-center justify-center')}>
//         <View
//           style={applyStyles('items-center justify-center', {
//             maxWidth: 240,
//           })}>
//           <Icon
//             size={48}
//             name="bluetooth"
//             type="feathericons"
//             color={colors['gray-50']}
//             style={applyStyles('mb-xl')}
//           />
//           <Text
//             style={applyStyles('pb-xl text-400 text-center', {
//               fontSize: 16,
//               color: colors['gray-200'],
//             })}>
//             Your Bluetooth is disabled. It needs to be enabled for print.
//           </Text>
//         </View>
//         <Button
//           variantColor="red"
//           title="Enable bluetooth"
//           style={applyStyles('w-full')}
//           onPress={handleEnableBluetooth}
//         />
//       </View>
//     );
//   }, [handleEnableBluetooth]);

//   const renderDeviceList = useCallback(() => {
//     return (
//       <View style={applyStyles('pb-xl')}>
//         <View
//           style={applyStyles('p-sm', {
//             borderBottomWidth: 1,
//             borderBottomColor: colors['gray-20'],
//           })}>
//           <Text
//             style={applyStyles('text-500 text-center text-uppercase', {
//               fontSize: 12,
//             })}>
//             Bluetooth device list
//           </Text>
//         </View>
//         <FlatList
//           data={devices}
//           renderItem={renderBluetoothDevice}
//           keyExtractor={(item, index) => index.toString()}
//         />
//         <View style={applyStyles('mx-lg')}>
//           {devices.length ? (
//             <Button
//               title="Print"
//               variantColor="red"
//               onPress={handlePrint}
//               disabled={!selectedDevice}
//               style={applyStyles('mt-xl w-full')}
//             />
//           ) : (
//             <Button
//               title="Scan"
//               variantColor="red"
//               onPress={handleBluetoothScan}
//               style={applyStyles('mt-xl w-full')}
//             />
//           )}
//         </View>
//       </View>
//     );
//   }, [
//     devices,
//     handlePrint,
//     selectedDevice,
//     handleBluetoothScan,
//     renderBluetoothDevice,
//   ]);

//   useEffect(() => {
//     BluetoothManager.isBluetoothEnabled().then(
//       (enabled: boolean) => {
//         setVisible(true);
//         if (enabled) {
//           setSection(1);

//           if (Platform.OS === 'ios') {
//             let bluetoothManagerEmitter = new NativeEventEmitter(
//               BluetoothManager,
//             );
//             _listeners.push(
//               bluetoothManagerEmitter.addListener(
//                 BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
//                 (rsp) => {
//                   deviceAlreadyPaired(rsp);
//                 },
//               ),
//             );
//             _listeners.push(
//               bluetoothManagerEmitter.addListener(
//                 BluetoothManager.EVENT_DEVICE_FOUND,
//                 (rsp) => {
//                   deviceFoundEvent(rsp);
//                 },
//               ),
//             );
//           } else if (Platform.OS === 'android') {
//             _listeners.push(
//               DeviceEventEmitter.addListener(
//                 BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
//                 (rsp) => {
//                   deviceAlreadyPaired(rsp);
//                 },
//               ),
//             );
//             _listeners.push(
//               DeviceEventEmitter.addListener(
//                 BluetoothManager.EVENT_DEVICE_FOUND,
//                 (rsp) => {
//                   deviceFoundEvent(rsp);
//                 },
//               ),
//             );
//             _listeners.push(
//               DeviceEventEmitter.addListener(
//                 BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
//                 () => {
//                   ToastAndroid.show(
//                     'Device Not Support Bluetooth !',
//                     ToastAndroid.LONG,
//                   );
//                 },
//               ),
//             );
//           }
//         } else {
//           setSection(0);
//         }
//       },
//       (err: any) => {
//         Alert.alert('Error', err);
//       },
//     );
//     return () => {
//       for (let ls in _listeners) {
//         _listeners[ls].remove();
//       }
//     };
//   }, [_listeners, deviceAlreadyPaired, deviceFoundEvent]);

//   return (
//     <Modal
//       isVisible={visible}
//       onSwipeComplete={handleClose}
//       onBackButtonPress={handleClose}
//       style={applyStyles({
//         margin: 0,
//         justifyContent: 'flex-end',
//       })}>
//       <View
//         style={applyStyles({
//           backgroundColor: colors.white,
//         })}>
//         {isScanning ? (
//           <View
//             style={applyStyles('items-center justify-center', {
//               marginVertical: 100,
//             })}>
//             <ActivityIndicator
//               size="large"
//               color={colors.primary}
//               style={applyStyles('mb-md')}
//             />
//             <Text style={applyStyles('text-center text-400', {fontSize: 18})}>
//               Scanning...
//             </Text>
//           </View>
//         ) : (
//           <View>
//             {section === 0 && renderSetupBluetooth()}
//             {section === 1 && renderDeviceList()}
//           </View>
//         )}
//       </View>
//     </Modal>
//   );
// };
