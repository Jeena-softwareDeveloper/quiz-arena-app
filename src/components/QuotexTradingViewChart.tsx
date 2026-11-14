import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { CandleData, TradeBetResult } from '../services/tradingService';
import { TRADINGVIEW_SCRIPT } from './tradingViewScript';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface QuotexTradingViewChartProps {
  candles: CandleData[];
  currentPrice: number;
  isPositive: boolean;
  activeTrade?: TradeBetResult | null;
  chartType: 'candles' | 'area';
  onChangeChartType?: (type: 'candles' | 'area') => void;
  height?: number;
  timeframes?: string[];
  selectedTimeframe?: string;
  onSelectTimeframe?: (tf: string) => void;
}

export default function QuotexTradingViewChart({
  candles,
  currentPrice,
  isPositive,
  activeTrade,
  chartType,
  onChangeChartType,
  height = 290,
  timeframes,
  selectedTimeframe,
  onSelectTimeframe,
}: QuotexTradingViewChartProps) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);

  // Format candles for TradingView (time in UTC seconds, sorted ascending, no duplicate timestamps)
  const formatCandlesForTV = useCallback((rawCandles: CandleData[]) => {
    const sorted = [...rawCandles].sort((a, b) => a.time - b.time);
    const seen = new Set<number>();
    const formattedCandles: { time: number; open: number; high: number; low: number; close: number }[] = [];
    const formattedArea: { time: number; value: number }[] = [];

    for (const c of sorted) {
      const sec = Math.floor(c.time / 1000);
      if (seen.has(sec)) continue;
      seen.add(sec);

      formattedCandles.push({
        time: sec,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });

      formattedArea.push({
        time: sec,
        value: c.close,
      });
    }

    return { formattedCandles, formattedArea };
  }, []);

  const { formattedCandles, formattedArea } = formatCandlesForTV(candles);

  // Sync dataset when candles length changes or first loaded
  useEffect(() => {
    if (!isLoadedRef.current || !webViewRef.current || formattedCandles.length === 0) return;
    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'SET_DATA',
        candles: formattedCandles,
        area: formattedArea,
      })
    );
  }, [candles.length]);

  // Send tick updates to WebView
  useEffect(() => {
    if (!isLoadedRef.current || !webViewRef.current || candles.length === 0) return;

    const latest = candles[candles.length - 1];
    const sec = Math.floor((latest?.time || Date.now()) / 1000);

    const payload = JSON.stringify({
      type: 'TICK',
      price: currentPrice,
      isPositive,
      candle: {
        time: sec,
        open: latest.open,
        high: Math.max(latest.high, currentPrice),
        low: Math.min(latest.low, currentPrice),
        close: currentPrice,
      },
    });

    webViewRef.current.postMessage(payload);
  }, [currentPrice, isPositive, candles]);

  // Send active trade entry line updates via both postMessage and direct JS evaluation
  useEffect(() => {
    if (!webViewRef.current) return;

    const payload = activeTrade
      ? {
          type: 'SET_ENTRY_LINE',
          entryPrice: activeTrade.entryPrice,
          direction: activeTrade.direction,
          amount: activeTrade.amount,
        }
      : {
          type: 'CLEAR_ENTRY_LINE',
        };

    const payloadStr = JSON.stringify(payload);
    webViewRef.current.postMessage(payloadStr);
    webViewRef.current.injectJavaScript(`
      try {
        if (typeof window.handleIncomingMessage === 'function') {
          window.handleIncomingMessage({ data: ${payloadStr} });
        }
      } catch (e) {}
      true;
    `);
  }, [activeTrade]);

  // Send chart type switch updates
  useEffect(() => {
    if (!isLoadedRef.current || !webViewRef.current) return;

    const payload = JSON.stringify({
      type: 'SWITCH_CHART_TYPE',
      chartType,
    });
    webViewRef.current.postMessage(payload);
  }, [chartType]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #040d07;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
  </style>
  <script>
    ${TRADINGVIEW_SCRIPT}
  </script>
</head>
<body>
  <div id="chart-container"></div>
  <script>
    try {
      const container = document.getElementById('chart-container');
      const chart = LightweightCharts.createChart(container, {
        width: container.clientWidth || window.innerWidth,
        height: container.clientHeight || window.innerHeight,
        layout: {
          background: { type: 'solid', color: '#040d07' },
          textColor: '#94a3b8',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
          vertLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: LightweightCharts.LineStyle.Dashed,
          },
          horzLine: {
            color: 'rgba(0, 230, 118, 0.8)',
            width: 1,
            style: LightweightCharts.LineStyle.Dashed,
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          scaleMargins: {
            top: 0.12,
            bottom: 0.12,
          },
          entireTextOnly: true,
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 10,
          rightOffset: 6,
        },
        handleScale: {
          axisPressedMouseMove: { time: true, price: true },
          pinch: true,
          mouseWheel: true,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
      });

      // 1. Candlestick Series (Quotex default)
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#00e676',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#00e676',
        wickDownColor: '#ef4444',
      });

      // 2. Area Series (Binomo mountain wave)
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(0, 230, 118, 0.38)',
        bottomColor: 'rgba(0, 230, 118, 0.0)',
        lineColor: '#00e676',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#ffffff',
        crosshairMarkerBackgroundColor: '#00e676',
      });

      // Initial Data Injection
      const initialCandles = ${JSON.stringify(formattedCandles)};
      const initialArea = ${JSON.stringify(formattedArea)};
      const currentMode = ${JSON.stringify(chartType)};

      if (initialCandles && initialCandles.length > 0) {
        candleSeries.setData(initialCandles);
        areaSeries.setData(initialArea);
        chart.timeScale().fitContent();
      }

      // Initial visibility
      if (currentMode === 'area') {
        candleSeries.applyOptions({ visible: false });
        areaSeries.applyOptions({ visible: true });
      } else {
        candleSeries.applyOptions({ visible: true });
        areaSeries.applyOptions({ visible: false });
      }

      let candleEntryLine = null;
      let areaEntryLine = null;
      let lastCandleTime = initialCandles && initialCandles.length > 0 ? initialCandles[initialCandles.length - 1].time : null;

      function updateEntryLine(entryPrice, direction, amount) {
        if (candleEntryLine) {
          try { candleSeries.removePriceLine(candleEntryLine); } catch (e) {}
          candleEntryLine = null;
        }
        if (areaEntryLine) {
          try { areaSeries.removePriceLine(areaEntryLine); } catch (e) {}
          areaEntryLine = null;
        }

        if (!entryPrice) return;
        var numPrice = typeof entryPrice === 'string' ? parseFloat(entryPrice.replace(/[^0-9.]/g, '')) : Number(entryPrice);
        if (isNaN(numPrice)) return;

        var isUp = direction === 'UP';
        var color = isUp ? '#00e676' : '#ef4444';
        var titleText = (isUp ? '▲ CALL ₹' : '▼ PUT ₹') + (amount || '');

        try {
          candleEntryLine = candleSeries.createPriceLine({
            price: numPrice,
            color: color,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: titleText,
          });
        } catch (e) {
          console.error('candleEntryLine error:', e);
        }

        try {
          areaEntryLine = areaSeries.createPriceLine({
            price: numPrice,
            color: color,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: titleText,
          });
        } catch (e) {
          console.error('areaEntryLine error:', e);
        }

        if (lastCandleTime) {
          try {
            var marker = [{
              time: lastCandleTime,
              position: isUp ? 'belowBar' : 'aboveBar',
              color: color,
              shape: isUp ? 'arrowUp' : 'arrowDown',
              text: titleText,
              size: 2,
            }];
            candleSeries.setMarkers(marker);
            areaSeries.setMarkers(marker);
          } catch (e) {
            console.error('setMarkers error:', e);
          }
        }
      }

      function clearEntryLine() {
        if (candleEntryLine) {
          try { candleSeries.removePriceLine(candleEntryLine); } catch (e) {}
          candleEntryLine = null;
        }
        if (areaEntryLine) {
          try { areaSeries.removePriceLine(areaEntryLine); } catch (e) {}
          areaEntryLine = null;
        }
        try {
          candleSeries.setMarkers([]);
          areaSeries.setMarkers([]);
        } catch (e) {}
      }

      // Initial active trade injection if present
      ${activeTrade ? `updateEntryLine(${JSON.stringify(activeTrade.entryPrice)}, ${JSON.stringify(activeTrade.direction)}, ${JSON.stringify(activeTrade.amount)});` : ''}

      // Handle message from React Native (both window & document listeners for Android)
      window.handleIncomingMessage = function(event) {
        try {
          var raw = event.data;
          var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!msg || !msg.type) return;
          
          if (msg.type === 'TICK') {
            if (msg.candle) {
              lastCandleTime = msg.candle.time;
              candleSeries.update(msg.candle);
              areaSeries.update({
                time: msg.candle.time,
                value: msg.candle.close,
              });

              // Adjust area series color based on positive/negative
              if (msg.isPositive) {
                areaSeries.applyOptions({
                  lineColor: '#00e676',
                  topColor: 'rgba(0, 230, 118, 0.38)',
                });
              } else {
                areaSeries.applyOptions({
                  lineColor: '#ef4444',
                  topColor: 'rgba(239, 68, 68, 0.38)',
                });
              }
            }
          } else if (msg.type === 'SET_ENTRY_LINE') {
            updateEntryLine(msg.entryPrice, msg.direction, msg.amount);
          } else if (msg.type === 'CLEAR_ENTRY_LINE') {
            clearEntryLine();
          } else if (msg.type === 'SWITCH_CHART_TYPE') {
            currentMode = msg.chartType;
            if (msg.chartType === 'area') {
              candleSeries.applyOptions({ visible: false });
              areaSeries.applyOptions({ visible: true });
            } else {
              candleSeries.applyOptions({ visible: true });
              areaSeries.applyOptions({ visible: false });
            }
          } else if (msg.type === 'SET_DATA') {
            if (msg.candles && msg.candles.length > 0) {
              candleSeries.setData(msg.candles);
              areaSeries.setData(msg.area || []);
              lastCandleTime = msg.candles[msg.candles.length - 1].time;
              chart.timeScale().scrollToRealtime();
            }
          } else if (msg.type === 'RESET_VIEW') {
            chart.timeScale().scrollToRealtime();
          }
        } catch (err) {
          console.error('Error processing postMessage:', err);
        }
      };

      window.addEventListener('message', window.handleIncomingMessage);
      document.addEventListener('message', window.handleIncomingMessage);

      // Window resize handler
      window.addEventListener('resize', () => {
        chart.applyOptions({
          width: container.clientWidth || window.innerWidth,
          height: container.clientHeight || window.innerHeight,
        });
      });

      // Notify React Native that chart is ready
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CHART_READY' }));
      }
    } catch (e) {
      console.error('LightweightCharts Init Error:', e);
    }
  </script>
</body>
</html>
`;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.topControlBar}>
        <View style={styles.chartTypeGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChangeChartType && onChangeChartType('candles')}
            style={[styles.typeButton, chartType === 'candles' && styles.typeButtonActive]}
          >
            <Ionicons
              name="stats-chart"
              size={13}
              color={chartType === 'candles' ? '#00e676' : '#94a3b8'}
            />
            <Text
              style={[styles.typeButtonText, chartType === 'candles' && styles.typeButtonTextActive]}
            >
              Candles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChangeChartType && onChangeChartType('area')}
            style={[styles.typeButton, chartType === 'area' && styles.typeButtonActive]}
          >
            <Ionicons
              name="pulse"
              size={13}
              color={chartType === 'area' ? '#00e676' : '#94a3b8'}
            />
            <Text
              style={[styles.typeButtonText, chartType === 'area' && styles.typeButtonTextActive]}
            >
              Area Wave
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({ type: 'RESET_VIEW' }));
            }
          }}
          style={styles.resetButton}
        >
          <Ionicons name="refresh" size={13} color="#94a3b8" />
          <Text style={styles.resetButtonText}>Live View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webViewWrapper}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'CHART_READY') {
                isLoadedRef.current = true;
                if (formattedCandles.length > 0) {
                  webViewRef.current?.postMessage(
                    JSON.stringify({
                      type: 'SET_DATA',
                      candles: formattedCandles,
                      area: formattedArea,
                    })
                  );
                }
                if (activeTrade) {
                  webViewRef.current?.postMessage(
                    JSON.stringify({
                      type: 'SET_ENTRY_LINE',
                      entryPrice: activeTrade.entryPrice,
                      direction: activeTrade.direction,
                      amount: activeTrade.amount,
                    })
                  );
                }
              }
            } catch (e) {}
          }}
          style={styles.webView}
        />

        {activeTrade && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 76,
              backgroundColor:
                activeTrade.direction === 'UP'
                  ? 'rgba(4, 38, 18, 0.94)'
                  : 'rgba(56, 8, 8, 0.94)',
              borderWidth: 1.5,
              borderColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              borderRadius: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: 0.2,
                }}
              >
                {activeTrade.direction === 'UP' ? '⬆ CALL' : '⬇ PUT'} ₹{activeTrade.amount}
              </Text>
              <Text style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#94a3b8' }}>
                @ ₹{Number(activeTrade.entryPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View
              style={{
                backgroundColor:
                  (activeTrade.direction === 'UP'
                    ? currentPrice >= activeTrade.entryPrice
                    : currentPrice <= activeTrade.entryPrice)
                    ? 'rgba(0, 230, 118, 0.25)'
                    : 'rgba(239, 68, 68, 0.25)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                borderWidth: 0.8,
                borderColor:
                  (activeTrade.direction === 'UP'
                    ? currentPrice >= activeTrade.entryPrice
                    : currentPrice <= activeTrade.entryPrice)
                    ? '#00e676'
                    : '#ef4444',
              }}
            >
              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: '900',
                  color:
                    (activeTrade.direction === 'UP'
                      ? currentPrice >= activeTrade.entryPrice
                      : currentPrice <= activeTrade.entryPrice)
                      ? '#00e676'
                      : '#ef4444',
                }}
              >
                {(activeTrade.direction === 'UP'
                  ? currentPrice >= activeTrade.entryPrice
                  : currentPrice <= activeTrade.entryPrice)
                  ? 'PROFIT'
                  : 'LOSS'}
              </Text>
            </View>
          </View>
        )}

        {/* Live Active Trade In-Chart Floating Indicator Badge */}
        {activeTrade && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 76,
              backgroundColor:
                activeTrade.direction === 'UP'
                  ? 'rgba(4, 38, 18, 0.94)'
                  : 'rgba(56, 8, 8, 0.94)',
              borderWidth: 1.5,
              borderColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              borderRadius: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: activeTrade.direction === 'UP' ? '#00e676' : '#ef4444',
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: 0.2,
                }}
              >
                {activeTrade.direction === 'UP' ? '⬆ CALL' : '⬇ PUT'} ₹{activeTrade.amount}
              </Text>
              <Text style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#94a3b8' }}>
                @ ₹{Number(activeTrade.entryPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View
              style={{
                backgroundColor:
                  (activeTrade.direction === 'UP'
                    ? currentPrice >= activeTrade.entryPrice
                    : currentPrice <= activeTrade.entryPrice)
                    ? 'rgba(0, 230, 118, 0.25)'
                    : 'rgba(239, 68, 68, 0.25)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                borderWidth: 0.8,
                borderColor:
                  (activeTrade.direction === 'UP'
                    ? currentPrice >= activeTrade.entryPrice
                    : currentPrice <= activeTrade.entryPrice)
                    ? '#00e676'
                    : '#ef4444',
              }}
            >
              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: '900',
                  color:
                    (activeTrade.direction === 'UP'
                      ? currentPrice >= activeTrade.entryPrice
                      : currentPrice <= activeTrade.entryPrice)
                      ? '#00e676'
                      : '#ef4444',
                }}
              >
                {(activeTrade.direction === 'UP'
                  ? currentPrice >= activeTrade.entryPrice
                  : currentPrice <= activeTrade.entryPrice)
                  ? 'PROFIT'
                  : 'LOSS'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {timeframes && timeframes.length > 0 && (
        <View style={styles.bottomTimeframeBar}>
          {timeframes.map((tf) => {
            const isActive = selectedTimeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                activeOpacity={0.7}
                onPress={() => onSelectTimeframe && onSelectTimeframe(tf)}
                style={[styles.tfButton, isActive && styles.tfButtonActive]}
              >
                <Text style={[styles.tfButtonText, isActive && styles.tfButtonTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#040d07',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#020604',
  },
  chartTypeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 3,
    borderRadius: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  typeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  typeButtonTextActive: {
    color: '#00e676',
    fontWeight: '900',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#040d07',
  },
  webView: {
    backgroundColor: '#040d07',
    opacity: 0.99, // fixes android webview rendering flicker
  },
  bottomTimeframeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    backgroundColor: '#020604',
  },
  tfButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tfButtonActive: {
    backgroundColor: '#0284c7',
  },
  tfButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  tfButtonTextActive: {
    color: '#ffffff',
  },
});
