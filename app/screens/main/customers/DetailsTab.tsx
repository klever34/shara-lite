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

type Location = {
  coordinate: string;
  address: string;
};

type DetailsTabProps = ModalWrapperFields & {};

const DetailsTab = ({openModal}: DetailsTabProps) => {
  const {location} = useGeolocation();
  const handleError = useErrorHandler();
  const [locations] = useState<Location[]>([]);
  const handleAddAddress = useCallback(() => {
    let address = '';
    let mapAddress = false;
    const fields: FormFields = {
      address: {
        type: 'text',
        props: {
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
                  ({address} = values);
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
                  console.log('location', location);
                  if (address) {
                    if (!mapAddress || !location) {
                      console.log(address, mapAddress);
                    } else {
                      const position = `${location.latitude},${location.longitude}`;
                      console.log(address, mapAddress, position);
                    }
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
  }, [location, openModal]);
  return (
    <ScrollView
      style={applyStyles('p-lg', {backgroundColor: colors['gray-10']})}>
      {location && (
        <Card>
          <CardHeader style={applyStyles('mb-md')}>Location Details</CardHeader>
          {renderList<Location>(
            locations,
            ({coordinate, address}, index) => {
              return (
                <View
                  style={applyStyles(
                    '',
                    locations.length - 1 !== index &&
                      'mb-lg border-b-1 border-gray-20 pb-md',
                  )}>
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
                        const latLng = coordinate;
                        const label = address;
                        const url = Platform.select({
                          ios: `${scheme}${label}@${latLng}`,
                          android: `${scheme}${latLng}(${label})`,
                        });
                        if (url) {
                          Linking.openURL(url).catch(handleError);
                        }
                        // RNGooglePlaces.openAutocompleteModal({useOverlay: true}, [
                        //   'name',
                        // ])
                        //   .then((place) => {
                        //     console.log(place);
                        //   })
                        //   .catch();
                      }}
                      style={applyStyles('w-full h-full')}
                      initialRegion={{
                        ...location,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                      }}>
                      <Marker coordinate={location} />
                    </MapView>
                  </View>
                  <CardDetail
                    name="Address"
                    value={address}
                    onPress={() => {
                      openModal('options', {
                        options: [{text: 'Map address', onPress: () => {}}],
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
          <CardButton onPress={handleAddAddress}>add</CardButton>
        </Card>
      )}
    </ScrollView>
  );
};

export default withModal(DetailsTab);
