import React, {useCallback, useState} from 'react';
import {Linking, Platform, ScrollView, View, Text} from 'react-native';
import {applyStyles, renderList} from '@/helpers/utils';
import {colors} from '@/styles';
import {
  CardHeader,
  CardDetail,
  Card,
  CardButton,
  Button,
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

type DetailsTabProps = ModalWrapperFields & {};

const DetailsTab = ({openModal}: DetailsTabProps) => {
  const {currentLocation} = useGeolocation();
  const handleError = useErrorHandler();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const handleSaveAddress = useCallback(
    (
      nextAddress: IAddress = {
        ...getBaseModelValues(),
        text: '',
      },
    ) => {
      let mapAddress = false;
      const fields: FormFields = {
        address: {
          type: 'text',
          props: {
            initialValue: nextAddress.text,
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
                    nextAddress.text = values.address;
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
                    if (nextAddress.text) {
                      if (mapAddress && currentLocation) {
                        nextAddress.coordinates = `${currentLocation.latitude},${currentLocation.longitude}`;
                      }
                      setAddresses((prevAddresses) => {
                        const index = prevAddresses.findIndex(
                          (prevAddress) => prevAddress._id === nextAddress._id,
                        );
                        console.log('index', index);
                        if (index === -1) {
                          return [...prevAddresses, nextAddress];
                        }
                        return [
                          ...prevAddresses.slice(0, index),
                          nextAddress,
                          ...prevAddresses.slice(index + 1),
                        ];
                      });
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
    [currentLocation, openModal],
  );
  const handleMapAddress = useCallback(
    (address) => {
      setAddresses((prevLocations) => {
        const index = prevLocations.findIndex(
          (prevLocation) => prevLocation._id === address._id,
        );
        if (index === -1) {
          return prevLocations;
        }
        if (!currentLocation) {
          return prevLocations;
        }
        return [
          ...prevLocations.slice(0, index),
          {
            ...address,
            coordinates: `${currentLocation.latitude},${currentLocation.longitude}`,
          },
          ...prevLocations.slice(index + 1),
        ];
      });
    },
    [currentLocation],
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
              const {coordinates = ',', text} = address;
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
