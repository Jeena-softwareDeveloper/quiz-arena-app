import React from 'react';
import { View, Image } from 'react-native';

const heroImage = require('../../assets/quicktrade_hero_seamless.png');

/**
 * Pixel-Perfect 3D Golden Bitcoin Coin, Gold Bullion Bars, Glowing Pedestal & Candlesticks
 * Exact graphic from reference mockup
 */
export const BitcoinBullionGraphic: React.FC = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        height: 220,
        paddingBottom: 0,
      }}
    >
      <Image
        source={heroImage}
        style={{
          width: 345,
          height: 220,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
};


