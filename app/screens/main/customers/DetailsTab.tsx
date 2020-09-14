import React, {useCallback, useContext} from 'react';
import {Linking, Platform, ScrollView, Text, View} from 'react-native';
import {applyStyles, renderList} from '@/helpers/utils';
import {colors} from '@/styles';
import {
  Button,
  Card,
  CardButton,
  CardDetail,
  CardHeader,
  FormBuilder,
  FormFields,
} from '@/components';
import {useGeolocation} from '@/services/geolocation';
import MapView, {Marker} from 'react-native-maps';
import {useErrorHandler} from '@/services/error-boundary';
// import RNGooglePlaces from 'react-native-google-places';
import EmptyState from '@/components/EmptyState';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IAddress} from '@/models/Address';
import {getBaseModelValues} from '@/helpers/models';
import {CustomerContext} from '@/services/customer';
import {getAddressService} from '@/services';

type DetailsTabProps = ModalWrapperFields & {};

const DetailsTab = ({openModal}: DetailsTabProps) => {
  const customer = useContext(CustomerContext);
  const {addresses = []} = customer || {};
  const {currentLocation} = useGeolocation();
  const handleError = useErrorHandler();
  const handleSaveAddress = useCallback(
    (address?: IAddress) => {
      let addressText = address?.text;
      let mapAddress = !!address?.coordinates;
      const fields: FormFields = {
        address: {
          type: 'text',
          props: {
            initialValue: addressText,
            initialToggle: mapAddress,
            autoFocus: true,
            placeholder: 'Type in address',
            icon: {
              type: 'feathericons',
              name: 'map-pin',
              onPress: (active) => {
                mapAddress = active;
              },
              activeStyle: 'text-green',
            },
          },
        },
      };
      const closeModal = openModal('bottom-half', {
        renderContent: () => {
          return (
            <View>
              <View style={applyStyles('border-b-1 border-gray-20 mb-4')}>
                <Text
                  style={applyStyles(
                    'text-primary uppercase text-center py-16 text-500',
                  )}>
                  add address
                </Text>
              </View>
              <View style={applyStyles('px-8')}>
                <FormBuilder
                  fields={fields}
                  onInputChange={(values) => {
                    addressText = values.address;
                  }}
                />
              </View>
              <View style={applyStyles('p-8 flex-row w-full')}>
                <Button
                  onPress={() => {
                    closeModal();
                  }}
                  title="cancel"
                  style={applyStyles('flex-1')}
                  variantColor="clear"
                />
                <Button
                  onPress={() => {
                    console.log('addressText', addressText);
                    console.log('customer', customer);
                    if (addressText && customer) {
                      let nextAddress: Partial<IAddress>;
                      if (!address) {
                        nextAddress = {
                          ...getBaseModelValues(),
                          text: addressText,
                          coordinates: '',
                          customer,
                        };
                      } else {
                        nextAddress = {
                          _id: address._id,
                          text: addressText,
                        };
                      }
                      if (mapAddress && currentLocation) {
                        nextAddress.coordinates = `${currentLocation.latitude},${currentLocation.longitude}`;
                      } else {
                        nextAddress.coordinates = '';
                      }
                      getAddressService().saveAddress(nextAddress);
                    }
                    closeModal();
                  }}
                  title="save"
                  style={applyStyles('flex-1')}
                />
              </View>
            </View>
          );
        },
      });
    },
    [currentLocation, customer, openModal],
  );
  const handleMapAddress = useCallback(
    (address) => {
      if (!customer) {
        return;
      }
      if (!currentLocation) {
        return;
      }
      getAddressService().saveAddress({
        _id: address._id,
        coordinates: `${currentLocation.latitude},${currentLocation.longitude}`,
      });
    },
    [currentLocation, customer],
  );
  return (
    <ScrollView
      style={applyStyles('p-lg', {backgroundColor: colors['gray-10']})}>
      {currentLocation && (
        <Card>
          <CardHeader style={applyStyles('mb-md')}>Location Details</CardHeader>
          {renderList<IAddress>(
            addresses,
            (address, index) => {
              let {coordinates, text} = address;
              if (!coordinates) {
                coordinates = ',';
              }
              const [latitude, longitude] = coordinates.split(',');
              return (
                <View
                  style={applyStyles(
                    '',
                    addresses.length - 1 !== index &&
                      'mb-lg border-b-1 border-gray-20 pb-md',
                  )}>
                  {!!latitude && !!longitude && (
                    <View
                      style={applyStyles(
                        'w-full rounded-8 overflow-hidden border-1 border-red-50 mb-md',
                        {
                          height: 128,
                        },
                      )}>
                      <MapView
                        onPress={() => {
                          const scheme = Platform.select({
                            ios: 'maps:0,0?q=',
                            android: 'geo:0,0?q=',
                          });
                          const latLng = coordinates;
                          const label = text;
                          const url = Platform.select({
                            ios: `${scheme}${label}@${latLng}`,
                            android: `${scheme}${latLng}(${label})`,
                          });
                          if (url) {
                            Linking.openURL(url).catch(handleError);
                          }
                        }}
                        style={applyStyles('w-full h-full')}
                        initialRegion={{
                          latitude: Number(latitude),
                          longitude: Number(longitude),
                          latitudeDelta: 0.1,
                          longitudeDelta: 0.1,
                        }}>
                        <Marker
                          coordinate={{
                            latitude: Number(latitude),
                            longitude: Number(longitude),
                          }}
                        />
                      </MapView>
                    </View>
                  )}
                  <CardDetail
                    name="Address"
                    value={text}
                    onPress={() => {
                      const closeModal = openModal('options', {
                        options: [
                          {
                            text: 'Map current location as address',
                            onPress: () => {
                              handleMapAddress(address);
                              closeModal();
                            },
                          },
                          {
                            text: 'Edit Address',
                            onPress: () => {
                              closeModal();
                              handleSaveAddress(address);
                            },
                          },
                        ],
                      });
                    }}
                  />
                </View>
              );
            },
            <EmptyState
              source={require('@/assets/images/coming-soon.png')}
              heading=""
              text="No location details added yet"
            />,
          )}
          <CardButton
            onPress={() => {
              handleSaveAddress();
            }}>
            add
          </CardButton>
        </Card>
      )}
    </ScrollView>
  );
};

export default withModal(DetailsTab);
