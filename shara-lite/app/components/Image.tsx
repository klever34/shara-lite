import React, {useState} from 'react';
import {Image as RNImage, ImageProps as RNImageProps, View} from 'react-native';
import {applyStyles} from '@/styles';

export const Image = (props: RNImageProps) => {
  const [error, setError] = useState(false);
  if (error) {
    return <View style={applyStyles('bg-green-50', props.style)} />;
  }
  return (
    <RNImage
      {...props}
      onLoad={() => {
        setError(false);
      }}
      onError={() => {
        setError(true);
      }}
    />
  );
};
