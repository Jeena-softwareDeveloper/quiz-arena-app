import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BitcoinBullionGraphic } from './BitcoinBullionGraphic';
import { onboardingService, MobileOnboardingSlide, DEFAULT_ONBOARDING_SLIDES } from '../services/onboardingService';

/**
 * Slide 2 Graphic: Fast 60-Second Real-Time Trades & 90% Payouts (Tight Bottom Spacing)
 */
const FastTradesGraphic: React.FC = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        height: 220,
        position: 'relative',
        paddingBottom: 2,
      }}
    >
      {/* Background Soft Neon Green Glow Aura */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          width: 300,
          height: 90,
          borderRadius: 90,
          backgroundColor: '#00e676',
          opacity: 0.26,
          transform: [{ scaleY: 0.5 }],
          zIndex: 0,
        }}
      />

      {/* Futuristic Concentric Neon Green Pedestal */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: 280,
          height: 64,
          borderRadius: 140,
          borderWidth: 2.8,
          borderColor: '#00e676',
          backgroundColor: '#042215',
          shadowColor: '#00e676',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.95,
          shadowRadius: 24,
          elevation: 10,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <View
          style={{
            width: 235,
            height: 48,
            borderRadius: 118,
            borderWidth: 1.8,
            borderColor: '#69f0ae',
            backgroundColor: '#063320',
          }}
        />
      </View>

      {/* Center 60s Speed Dial Graphic (Sits directly on pedestal) */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          zIndex: 4,
        }}
      >
        <View
          style={{
            width: 136,
            height: 136,
            borderRadius: 68,
            backgroundColor: '#081710',
            borderWidth: 4,
            borderColor: '#00e676',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00e676',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.85,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          {/* Inner ring */}
          <View
            style={{
              width: 108,
              height: 108,
              borderRadius: 54,
              backgroundColor: '#042817',
              borderWidth: 2.5,
              borderColor: '#69f0ae',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="flash" size={42} color="#00e676" />
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', marginTop: -2 }}>
              60s
            </Text>
          </View>
        </View>

        {/* Floating Top Badge: 90% Profit */}
        <View
          style={{
            position: 'absolute',
            top: -12,
            backgroundColor: '#00e676',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            shadowColor: '#00e676',
            shadowOpacity: 0.95,
            shadowRadius: 16,
          }}
        >
          <Ionicons name="trending-up" size={15} color="#050a08" />
          <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#050a08' }}>
            +90%
          </Text>
        </View>

        {/* Floating Red Down Arrow indicator on left */}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            left: -34,
            backgroundColor: 'rgba(239, 68, 68, 0.28)',
            borderWidth: 1.8,
            borderColor: '#ef4444',
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-down" size={22} color="#ef4444" />
        </View>

        {/* Floating Green Up Arrow indicator on right */}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            right: -34,
            backgroundColor: 'rgba(0, 230, 118, 0.28)',
            borderWidth: 1.8,
            borderColor: '#00e676',
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-up" size={22} color="#00e676" />
        </View>
      </View>
    </View>
  );
};

/**
 * Slide 3 Graphic: ₹50 Free Bonus & Instant UPI Withdrawals (Tight Bottom Spacing)
 */
const BonusRewardGraphic: React.FC = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        height: 220,
        position: 'relative',
        paddingBottom: 2,
      }}
    >
      {/* Background Soft Golden Glow Aura */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          width: 300,
          height: 90,
          borderRadius: 90,
          backgroundColor: '#ffd700',
          opacity: 0.24,
          transform: [{ scaleY: 0.5 }],
          zIndex: 0,
        }}
      />

      {/* Futuristic Concentric Neon Pedestal */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: 280,
          height: 64,
          borderRadius: 140,
          borderWidth: 2.8,
          borderColor: '#ffd700',
          backgroundColor: '#201603',
          shadowColor: '#ffd700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.95,
          shadowRadius: 24,
          elevation: 10,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <View
          style={{
            width: 235,
            height: 48,
            borderRadius: 118,
            borderWidth: 1.8,
            borderColor: '#fef08a',
            backgroundColor: '#322305',
          }}
        />
      </View>

      {/* Center 3D Gift Box & ₹50 Coin Graphic */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          zIndex: 4,
        }}
      >
        {/* Shiny Golden Gift Box */}
        <View
          style={{
            width: 126,
            height: 126,
            borderRadius: 28,
            backgroundColor: '#b45309',
            borderWidth: 4,
            borderColor: '#fef08a',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.95,
            shadowRadius: 22,
            elevation: 12,
          }}
        >
          {/* Vertical Ribbon */}
          <View
            style={{
              position: 'absolute',
              width: 26,
              height: 126,
              backgroundColor: '#00e676',
              borderRadius: 6,
            }}
          />
          {/* Horizontal Ribbon */}
          <View
            style={{
              position: 'absolute',
              width: 126,
              height: 26,
              backgroundColor: '#00e676',
              borderRadius: 6,
            }}
          />

          {/* Center ₹50 Badge */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#ffd700',
              borderWidth: 3,
              borderColor: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOpacity: 0.55,
              shadowRadius: 8,
              zIndex: 5,
            }}
          >
            <Text style={{ fontSize: 21, fontWeight: '900', color: '#78350f' }}>
              ₹50
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#78350f', letterSpacing: 0.8 }}>
              BONUS
            </Text>
          </View>
        </View>

        {/* Floating Shield Checkmark (Instant UPI Verified) */}
        <View
          style={{
            position: 'absolute',
            top: -10,
            right: -22,
            backgroundColor: '#00e676',
            paddingHorizontal: 11,
            paddingVertical: 4.5,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            shadowColor: '#00e676',
            shadowOpacity: 0.9,
            shadowRadius: 14,
          }}
        >
          <Ionicons name="shield-checkmark" size={15} color="#050a08" />
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#050a08' }}>
            UPI FAST
          </Text>
        </View>
      </View>
    </View>
  );
};



/**
 * Format slide title with luminous glowing highlights for trading keywords
 */
function renderFormattedTitle(title: string) {
  // If title has specific key terms, highlight them
  const words = title.split(' ');
  return (
    <Text style={{ fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4, textAlign: 'center' }}>
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z0-9₹]/g, '');
        let color = '#ffffff';
        let glow = 'transparent';

        if (clean === 'green' || clean === 'profit' || clean === 'payouts' || clean === '60s') {
          color = '#00e676';
          glow = '#00e676';
        } else if (clean === 'red') {
          color = '#ff3b30';
          glow = '#ff3b30';
        } else if (clean.includes('₹50') || clean === 'bonus' || clean === 'free' || clean === 'gold') {
          color = '#ffd700';
          glow = '#ffd700';
        }

        return (
          <Text
            key={i}
            style={{
              color,
              textShadowColor: glow,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: glow !== 'transparent' ? 10 : 0,
            }}
          >
            {word}{i < words.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Text>
  );
}

/**
 * Smooth Horizontal Onboarding Carousel with Swipe Gestures, Auto-Scroll & Pagination Dots
 * Supports dynamic slides managed from the Admin Panel
 */
export const OnboardingCarousel: React.FC = () => {
  const [slides, setSlides] = useState<MobileOnboardingSlide[]>(DEFAULT_ONBOARDING_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isDragging = useRef(false);

  const { width: windowWidth } = useWindowDimensions();
  // Compute exact content width accounting for parent horizontal padding (22 on left + 22 on right = 44)
  const maxContentWidth = Math.min(windowWidth, 430);
  const slideWidth = maxContentWidth - 44;

  // Load dynamic slides from Backend Admin Panel
  useEffect(() => {
    let isMounted = true;
    onboardingService.getOnboardingSlides().then((data) => {
      if (isMounted && data && data.length > 0) {
        setSlides(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel timer every 4 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      if (!isDragging.current && slideWidth > 0) {
        setActiveSlide((prev) => {
          const next = (prev + 1) % slides.length;
          scrollViewRef.current?.scrollTo({
            x: next * slideWidth,
            animated: true,
          });
          return next;
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length, slideWidth]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (slideWidth > 0) {
      const index = Math.round(offsetX / slideWidth);
      if (index >= 0 && index < slides.length && index !== activeSlide) {
        setActiveSlide(index);
      }
    }
  };

  const handleDotPress = (index: number) => {
    setActiveSlide(index);
    scrollViewRef.current?.scrollTo({
      x: index * slideWidth,
      animated: true,
    });
  };

  // Render graphic for a slide
  const renderSlideGraphic = (slide: MobileOnboardingSlide, index: number) => {
    // If the slide has a valid uploaded image URL (Cloudinary, local server or web URL)
    if (slide.imageUrl && slide.imageUrl.trim().length > 0) {
      return (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: slideWidth,
            height: 220,
            position: 'relative',
            paddingBottom: 2,
          }}
        >
          {/* Luminous Glow aura underneath */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              width: 300,
              height: 90,
              borderRadius: 90,
              backgroundColor: index === 2 ? '#ffd700' : '#00e676',
              opacity: 0.24,
              transform: [{ scaleY: 0.5 }],
            }}
          />

          {/* Futuristic Concentric Neon Pedestal */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: 280,
              height: 64,
              borderRadius: 140,
              borderWidth: 2.8,
              borderColor: index === 2 ? '#ffd700' : '#00e676',
              backgroundColor: index === 2 ? '#201603' : '#042215',
              shadowColor: index === 2 ? '#ffd700' : '#00e676',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.95,
              shadowRadius: 24,
              elevation: 10,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <View
              style={{
                width: 235,
                height: 48,
                borderRadius: 118,
                borderWidth: 1.8,
                borderColor: index === 2 ? '#fef08a' : '#69f0ae',
                backgroundColor: index === 2 ? '#322305' : '#063320',
              }}
            />
          </View>

          {/* Center Uploaded Image Artwork (Enlarged) */}
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: Math.max(slideWidth - 10, 280),
              height: 200,
              marginBottom: 10,
              zIndex: 4,
            }}
          >
            <Image
              source={{ uri: slide.imageUrl }}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </View>
      );
    }

    // Default graphics fallback if no image URL
    if (index === 0) return <BitcoinBullionGraphic />;
    if (index === 1) return <FastTradesGraphic />;
    return <BonusRewardGraphic />;
  };

  return (
    <View style={{ width: slideWidth, overflow: 'hidden', alignItems: 'center' }}>
      {/* Horizontal Scrollable Carousel Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={Platform.OS === 'ios'}
        snapToInterval={slideWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isDragging.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isDragging.current = false;
          }, 500);
        }}
        onMomentumScrollEnd={handleScroll}
        style={{ width: slideWidth }}
        contentContainerStyle={{
          alignItems: 'center',
        }}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.id || `slide-${index}`}
            style={{
              width: slideWidth,
              minWidth: slideWidth,
              maxWidth: slideWidth,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Slide Graphic */}
            {renderSlideGraphic(slide, index)}

            {/* Slide Title */}
            <View style={{ alignItems: 'center', marginTop: 4, width: '100%' }}>
              {renderFormattedTitle(slide.title)}

              {/* Slide Subtitle / Paragraph */}
              <View style={{ marginTop: 5, paddingHorizontal: 16, width: '100%' }}>
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '500',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: 19,
                  }}
                >
                  {slide.subtitle}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots (Matching Mockup: Active white pill, inactive dark gray dots) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          marginTop: 10,
          marginBottom: 2,
        }}
      >

        {slides.map((_, index) => {
          const isActive = index === activeSlide;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
              style={{ padding: 4 }}
            >
              <View
                style={{
                  width: isActive ? 14 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? '#ffffff' : '#3f3f46',
                  shadowColor: isActive ? '#ffffff' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isActive ? 0.7 : 0,
                  shadowRadius: 4,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
