import React, {ReactElement, useCallback} from 'react';
import {Linking, Platform, ScrollView, View} from 'react-native';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {CardHeader, CardDetail, Card} from '@/components';
import {useGeolocation} from '@/services/geolocation';
import MapView, {Marker} from 'react-native-maps';
import {useErrorHandler} from '@/services/error-boundary';
// import RNGooglePlaces from 'react-native-google-places';
import EmptyState from '@/components/EmptyState';

type Location = {
  coordinate: string;
  address: string;
};

const DetailsTab = () => {
  const {location} = useGeolocation();
  const handleError = useErrorHandler();
  let locations: Location[] = [];
  if (location) {
    locations = [
      {
        coordinate: `${location.latitude},${location.longitude}`,
        address: '105 Ngong Road, Highlands Nairobi, Nairobi Province, Kenya',
      },
      {
        coordinate: `${location.latitude},${location.longitude}`,
        address: '105 Ngong Road, Highlands Nairobi, Nairobi Province, Kenya',
      },
    ];
  }
  const renderList = useCallback(
    <T extends {}>(
      list: T[],
      renderItem: (item: T, index: number, list: T[]) => ReactElement,
    ) => {
      if (!list.length) {
        return (
          <EmptyState
            source={require('@/assets/images/coming-soon.png')}
            heading=""
            text="No location details added yet"
          />
        );
      } else {
        return list.map((...args) => renderItem(...args));
      }
    },
    [],
  );
  return (
    <ScrollView
      style={applyStyles('p-lg', {backgroundColor: colors['gray-10']})}>
      {location && (
        <Card>
          <CardHeader style={applyStyles('mb-md')}>Location Details</CardHeader>
          {renderList<Location>(locations, ({coordinate, address}, index) => {
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
                <CardDetail name="Address" value={address} />
              </View>
            );
          })}
        </Card>
      )}
    </ScrollView>
  );
};

export default DetailsTab;
