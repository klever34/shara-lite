import React, {useCallback, useContext} from 'react';
import {Linking, Platform, ScrollView, Text, View} from 'react-native';
import {applyStyles, renderList} from '@/helpers/utils';
import {colors, dimensions} from '@/styles';
import {
  Button,
  Card,
  CardDetail,
  CardHeader,
  FAButton,
  FormBuilder,
  FormFields,
} from '@/components';
import {
  convertToLocationString,
  parseLocationString,
} from '@/services/geolocation';
import {useErrorHandler} from '@/services/error-boundary';
import EmptyState from '@/components/EmptyState';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IAddress} from '@/models/Address';
import {getBaseModelValues} from '@/helpers/models';
import {CustomerContext} from '@/services/customer';
import {getAddressService, getGeolocationService} from '@/services';
import Icon from '@/components/Icon';
import StaticMap from '@/components/StaticMap';
import Config from 'react-native-config';
import Touchable from '@/components/Touchable';
import {useRealm} from '@/services/realm';

type DetailsTabProps = ModalWrapperFields & {};

const DetailsTab = ({openModal}: DetailsTabProps) => {
  const customer = useContext(CustomerContext);
  const {addresses = []} = customer || {};
  const handleError = useErrorHandler();
  useRealm();
  const handleSaveAddress = useCallback(
    (address?: IAddress) => {
      let addressText = address?.text;
      let mapAddress = !!address?.coordinates;
      const fields: FormFields = {
        address: {
          type: 'text',
          props: {
            value: addressText,
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
                  {address ? 'edit' : 'add'} address
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
                    closeModal();
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
                      if (mapAddress) {
                        getAddressService().saveAddress(nextAddress);
                        const closeLoadingModal = openModal('loading', {
                          text: 'Mapping Address...',
                        });
                        getGeolocationService()
                          .getCurrentPosition()
                          .then((currentLocation) => {
                            getAddressService().saveAddress({
                              _id: nextAddress._id,
                              coordinates: convertToLocationString(
                                currentLocation,
                              ),
                            });
                          })
                          .catch(handleError)
                          .finally(() => {
                            closeLoadingModal();
                          });
                      } else {
                        nextAddress.coordinates = '';
                        getAddressService().saveAddress(nextAddress);
                      }
                    }
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
    [customer, handleError, openModal],
  );
  const handleMapAddress = useCallback(
    (address) => {
      if (!customer) {
        return;
      }
      const closeModal = openModal('loading', {text: 'Mapping Address...'});
      getGeolocationService()
        .getCurrentPosition()
        .then((currentLocation) => {
          getAddressService().saveAddress({
            _id: address._id,
            coordinates: convertToLocationString(currentLocation),
          });
        })
        .catch(handleError)
        .finally(() => {
          closeModal();
        });
    },
    [customer, handleError, openModal],
  );
  return (
    <>
      <ScrollView
        style={applyStyles('p-lg', {backgroundColor: colors['gray-10']})}>
        <Card>
          <CardHeader style={applyStyles('mb-md')}>Location Details</CardHeader>
          {renderList<IAddress>(
            addresses,
            (address, index) => {
              let {coordinates, text} = address;
              const [latitude, longitude] = parseLocationString(coordinates);
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
                      <Touchable
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
                        }}>
                        <StaticMap
                          coordinate={{
                            latitude,
                            longitude,
                          }}
                          size={{
                            width: Math.round(dimensions.fullWidth) - 66,
                            height: 128,
                          }}
                          zoom={16}
                          apiKey={Config.GOOGLE_API_KEY}
                        />
                      </Touchable>
                    </View>
                  )}
                  <CardDetail
                    name="Address"
                    value={text}
                    onMorePress={() => {
                      const closeModal = openModal('options', {
                        options: [
                          {
                            text: 'Map current location as address',
                            onPress: () => {
                              closeModal();
                              handleMapAddress(address);
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
        </Card>
        <View style={applyStyles('h-96')} />
      </ScrollView>
      <FAButton
        style={applyStyles(
          'h-48 w-auto rounded-16 px-12 flex-row items-center',
        )}
        onPress={() => {
          handleSaveAddress();
        }}>
        <Icon size={18} name="plus" color="white" type="feathericons" />
        <Text
          style={applyStyles('text-400 text-base ml-8 text-white uppercase')}>
          add address
        </Text>
      </FAButton>
    </>
  );
};

export default withModal(DetailsTab);
