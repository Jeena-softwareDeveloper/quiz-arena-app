import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface GoldenTrophyProps {
  size?: number;
  width?: number;
  height?: number;
}

export const TROPHY_ASSET = require('./golden_trophy.png');

export const GoldenTrophy: React.FC<GoldenTrophyProps> = ({ size = 80, width, height }) => {
  const w = width || size;
  const h = height || size;

  return (
    <View style={[styles.container, { width: w, height: h }]}>
      <Image
        source={TROPHY_ASSET}
        style={{ width: w, height: h, resizeMode: 'contain' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
