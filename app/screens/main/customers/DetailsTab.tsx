import React from 'react';
import {Linking, Platform, ScrollView, View} from 'react-native';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {Card, CardHeader, CardDetail} from '@/components';
import {useGeolocation} from '@/services/geolocation';
import MapView, {Marker} from 'react-native-maps';
import {useErrorHandler} from '@/services/error-boundary';

const DetailsTab = () => {
  const {location} = useGeolocation();
  const handleError = useErrorHandler();
  return (
    <ScrollView
      style={applyStyles('p-lg', {backgroundColor: colors['gray-10']})}>
      <Card>
        <CardHeader style={applyStyles('mb-md')}>Location Details</CardHeader>
        {location && (
          <View
            style={applyStyles(
              'w-full rounded-8 overflow-hidden border-1 border-red-50 mb-lg',
              {
                height: 128,
              },
            )}>
            <MapView
              onPress={() => {
                const lat = location?.latitude;
                const lng = location?.longitude;
                const scheme = Platform.select({
                  ios: 'maps:0,0?q=',
                  android: 'geo:0,0?q=',
                });
                const latLng = `${lat},${lng}`;
                const label = 'Custom Label';
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
                ...location,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}>
              <Marker coordinate={location} />
            </MapView>
          </View>
        )}
        <CardDetail
          name="Address"
          value="105 Ngong Road, Highlands Nairobi, Nairobi Province, Kenya"
        />
      </Card>
    </ScrollView>
  );
};

export default DetailsTab;
