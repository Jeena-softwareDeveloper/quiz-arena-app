import React from 'react';
import { View, Image } from 'react-native';

const wavesImage = require('../../assets/quicktrade_waves_seamless.png');

/**
 * Wavy Neon Green Luminous Landscape
 * Exact graphic from reference mockup
 */
export const NeonWaveMesh: React.FC = () => {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <Image
        source={wavesImage}
        style={{
          width: '100%',
          height: 85,
          resizeMode: 'stretch',
        }}
      />
    </View>
  );
};
