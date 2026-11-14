const fs = require('fs');
let code = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');

// 1. Update data block
const oldDataStart = code.indexOf('const LIVE_MARKET_ASSETS = [');
const oldDataEnd = code.indexOf('const ALL_RECENT_WITHDRAWALS = [');
if (oldDataStart === -1 || oldDataEnd === -1) {
  console.error('Data markers not found');
  process.exit(1);
}

const newDataBlock = `const TOP_5_LIVE_ASSETS = [
    {
      id: 'BTC-USDT',
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      price: '₹68,342.56',
      change: '+0.82%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_btc.png'),
      iconBg: '#f7931a',
      iconType: 'fa5' as const,
      iconName: 'bitcoin',
    },
    {
      id: 'ETH-USDT',
      symbol: 'ETH/USDT',
      name: 'Ethereum',
      price: '₹2,948.12',
      change: '+1.45%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_eth.png'),
      iconBg: '#6366f1',
      iconType: 'mci' as const,
      iconName: 'ethereum',
    },
    {
      id: 'GOLD-XAU',
      symbol: 'Gold (XAU)',
      name: 'Gold',
      price: '₹6,238.40',
      change: '-0.34%',
      isPositive: false,
      sparkline: require('../../assets/sparkline_gold.png'),
      iconBg: '#eab308',
      iconType: 'mci' as const,
      iconName: 'gold',
    },
    {
      id: 'SOL-USDT',
      symbol: 'SOL/USDT',
      name: 'Solana',
      price: '₹13,420.00',
      change: '+3.20%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_sol.png'),
      iconBg: '#a855f7',
      iconType: 'mci' as const,
      iconName: 'flash',
    },
    {
      id: 'SILVER-XAG',
      symbol: 'Silver (XAG)',
      name: 'Silver',
      price: '₹78.20',
      change: '+0.15%',
      isPositive: true,
      sparkline: require('../../assets/sparkline_btc.png'),
      iconBg: '#94a3b8',
      iconType: 'mci' as const,
      iconName: 'diamond-stone',
    },
  ];

  const LIVE_MARKET_ASSETS = TOP_5_LIVE_ASSETS;

  const listAnim = useRef(new Animated.Value(0)).current;

  const RECENT_WITHDRAWALS = [
    {
      name: 'Senthil Kumar',
      avatarBg: '#059669',
      amount: '1,500',
      method: 'UPI Bank',
      badgeBg: 'rgba(0, 230, 118, 0.15)',
      badgeColor: '#00e676',
      time: '2 mins ago',
      timeTa: '2 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Priya Dharshini',
      avatarBg: '#0284c7',
      amount: '800',
      method: 'Paytm',
      badgeBg: 'rgba(0, 180, 255, 0.15)',
      badgeColor: '#00b0ff',
      time: '5 mins ago',
      timeTa: '5 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Ramesh K',
      avatarBg: '#8b5cf6',
      amount: '2,500',
      method: 'PhonePe',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      badgeColor: '#c084fc',
      time: '12 mins ago',
      timeTa: '12 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Kavitha Rajan',
      avatarBg: '#d97706',
      amount: '3,200',
      method: 'IMPS Bank',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeColor: '#facc15',
      time: '20 mins ago',
      timeTa: '20 நிமிடங்களுக்கு முன்',
    },
    {
      name: 'Anand Murugan',
      avatarBg: '#10b981',
      amount: '950',
      method: 'GPay UPI',
      badgeBg: 'rgba(0, 230, 118, 0.15)',
      badgeColor: '#00e676',
      time: '34 mins ago',
      timeTa: '34 நிமிடங்களுக்கு முன்',
    },
  ];\n\n  `;

code = code.substring(0, oldDataStart) + newDataBlock + code.substring(oldDataEnd);

// 2. Update JSX block
const startMarker = '{/* Live Assets (Market Trends) Section';
const endMarker = '{/* 4. Recommended for You Section';
const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  console.error('JSX markers not found');
  process.exit(1);
}

const newJSX = `{/* Live Assets (Market Trends) Section - Top 5 Live Assets */}
            <View style={{ marginBottom: 18 }}>
              {/* Header: Live Assets Title & View All */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: -0.3 }}>
                  Live Assets
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAllAssetsModal(true)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#00e676' }}>View All</Text>
                  <Ionicons name="chevron-forward" size={13} color="#00e676" />
                </TouchableOpacity>
              </View>

              {/* 5 Live Asset Cards */}
              {TOP_5_LIVE_ASSETS.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    const featured = rooms[0] || DEFAULT_RECOMMENDED_ROOMS[0];
                    if (featured) setSelectedRoomForCheckout(featured);
                  }}
                  style={{
                    backgroundColor: '#071317',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {/* Left: Squircle Icon & Symbol/Name */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 95 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 11,
                        backgroundColor: asset.iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: asset.iconBg,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.35,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {asset.iconType === 'fa5' ? (
                        <FontAwesome5 name={asset.iconName as any} size={19} color="#ffffff" />
                      ) : (
                        <MaterialCommunityIcons name={asset.iconName as any} size={20} color="#ffffff" />
                      )}
                    </View>
                    <View>
                      <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                        {asset.symbol}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '500', color: '#94a3b8', marginTop: 1 }}>
                        {asset.name}
                      </Text>
                    </View>
                  </View>

                  {/* Center: Glowing Sparkline */}
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                    <Image
                      source={asset.sparkline}
                      style={{ width: 80, height: 26, resizeMode: 'contain' }}
                    />
                  </View>

                  {/* Right: Price & Pill Badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                      {asset.price}
                    </Text>
                    <View
                      style={{
                        backgroundColor: asset.isPositive ? '#00c853' : '#d32f2f',
                        paddingHorizontal: 7,
                        paddingVertical: 3.5,
                        borderRadius: 6,
                        minWidth: 54,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>
                        {asset.change}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Withdrawals Section - Directly Below Live Assets */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#00e676" />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 }}>
                    {currentLang === 'ta' ? 'சமீபத்திய பணப் பரிமாற்றம்' : 'Recent Withdrawals'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowWithdrawalsModal(true)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(0, 230, 118, 0.1)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 230, 118, 0.25)',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#00e676' }}>
                    {currentLang === 'ta' ? 'அனைத்தும் காண்க →' : 'View All →'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {RECENT_WITHDRAWALS.map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: 156,
                      backgroundColor: '#071317',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      padding: 12,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: w.avatarBg, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>{w.name[0]}</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff', flex: 1 }} numberOfLines={1}>
                        {w.name}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 }}>
                      <Ionicons name="checkmark-circle" size={12} color="#00e676" />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#00e676' }}>
                        Withdrawal Successful
                      </Text>
                    </View>

                    <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: '#ffffff' }}>
                        ₹{w.amount}
                      </Text>
                      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#94a3b8' }}>
                          {w.method}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
                      {currentLang === 'ta' ? w.timeTa : w.time}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>\n\n            `;

code = code.substring(0, startIdx) + newJSX + code.substring(endIdx);

fs.writeFileSync('src/screens/HomeScreen.tsx', code, 'utf8');
console.log('Successfully updated HomeScreen.tsx');

