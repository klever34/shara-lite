import React, {useCallback, useContext} from 'react';
import {Linking, Platform, ScrollView, Text, View} from 'react-native';
import {applyStyles, renderList} from 'app-v1/helpers/utils';
import {colors, dimensions} from 'app-v1/styles';
import {
  Button,
  Card,
  CardDetail,
  CardHeader,
  FAButton,
  FormBuilder,
  FormFields,
} from 'app-v1/components';
import {
  convertToLocationString,
  parseLocationString,
} from 'app-v1/services/geolocation';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import EmptyState from 'app-v1/components/EmptyState';
import {ModalWrapperFields, withModal} from 'app-v1/helpers/hocs';
import {IAddress} from 'app-v1/models/Address';
import {getBaseModelValues} from 'app-v1/helpers/models';
import {CustomerContext} from 'app-v1/services/customer';
import {
  getAddressService,
  getAnalyticsService,
  getGeolocationService,
} from 'app-v1/services';
import Icon from 'app-v1/components/Icon';
import StaticMap from 'app-v1/components/StaticMap';
import Config from 'react-native-config';
import Touchable from 'app-v1/components/Touchable';
import {useRealm} from 'app-v1/services/realm';

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
                        getAnalyticsService()
                          .logEvent('customerLocationAdded')
                          .catch(handleError);
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
              source={require('app-v1/assets/images/coming-soon.png')}
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
