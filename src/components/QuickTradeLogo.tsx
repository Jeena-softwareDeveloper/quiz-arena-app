import React from 'react';
import { View, Image } from 'react-native';

const logoImage = require('../../assets/quicktrade_logo_seamless.png');

interface QuickTradeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

/**
 * Pixel-Perfect QuickTrade Logo
 * Exact graphic from reference mockup with green arrow, chart bars, 'QuickTrade', and 'Trade • Predict • Earn'
 */
export const QuickTradeLogo: React.FC<QuickTradeLogoProps> = ({
  size = 'md',
}) => {
  const isSmall = size === 'sm';
  const width = isSmall ? 135 : 185;
  const height = isSmall ? 68 : 94;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={logoImage}
        style={{
          width,
          height,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
};
