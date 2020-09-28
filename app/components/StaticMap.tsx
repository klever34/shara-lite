import React, {useMemo} from 'react';
import {Image, ImageProps, PixelRatio} from 'react-native';

const rootUrl = 'https://maps.googleapis.com/maps/api/staticmap';

type ImageFormat = 'png' | 'png32' | 'gif' | 'jpg' | 'jpg-baseline';
type MapType = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

type StaticMapProps = Omit<ImageProps, 'source'> & {
  coordinate: {
    latitude: string;
    longitude: string;
  };
  size: {
    width: number;
    height: number;
  };
  zoom: number;
  apiKey: string;
  scale?: number;
  format?: ImageFormat;
  mapType?: MapType;
  hasCenterMarker?: boolean;
  onError?: () => void;
  onLoad?: () => void;
};

const StaticMap = ({
  style,
  size,
  coordinate,
  zoom,
  apiKey,
  scale = defaultMapScale(),
  format = 'png',
  mapType = 'roadmap',
  hasCenterMarker = true,
  ...restProps
}: StaticMapProps) => {
  const apiKeyParam = useMemo(() => {
    return apiKey ? `key=${apiKey}` : '';
  }, [apiKey]);

  const markerParams = useMemo(() => {
    const {latitude, longitude} = coordinate;
    const params = `markers=${latitude},${longitude}`;
    return hasCenterMarker ? params : '';
  }, [coordinate, hasCenterMarker]);

  const staticMapUrl = useMemo(() => {
    const {latitude, longitude} = coordinate;
    const {width, height} = size;
    return `${rootUrl}?center=${latitude},${longitude}&zoom=${zoom}&scale=${scale}&size=${width}x${height}&maptype=${mapType}&format=${format}&${markerParams}&${apiKeyParam}`;
  }, [
    apiKeyParam,
    coordinate,
    format,
    mapType,
    markerParams,
    scale,
    size,
    zoom,
  ]);

  return (
    <Image {...restProps} style={[style, size]} source={{uri: staticMapUrl}} />
  );
};

const defaultMapScale = () => {
  const isRetina = PixelRatio.get() >= 2;
  return isRetina ? 2 : 1;
};

export default StaticMap;
