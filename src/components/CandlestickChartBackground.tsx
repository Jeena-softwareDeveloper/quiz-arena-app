import React from 'react';
import { View, Image } from 'react-native';

const topCandlesImage = require('../../assets/quicktrade_top_candles_seamless.png');

interface CandlestickChartBackgroundProps {
  compact?: boolean;
}

/**
 * Atmospheric background trading chart with floating green and red candlesticks
 * Sourced directly from the QuickTrade reference mockup
 */
export const CandlestickChartBackground: React.FC<CandlestickChartBackgroundProps> = ({
  compact = false,
}) => {
  if (compact) {
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 90,
          overflow: 'hidden',
          opacity: 0.35,
          zIndex: 0,
        }}
      >
        <Image
          source={topCandlesImage}
          style={{
            width: '100%',
            height: 90,
            resizeMode: 'cover',
          }}
        />
        {/* Soft feather gradient over bottom edge */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 35,
            backgroundColor: '#030705',
            opacity: 0.85,
          }}
        />
      </View>
    );
  }


  // Full-screen background candlesticks for landing are seamlessly built into the hero graphic
  return null;
};
