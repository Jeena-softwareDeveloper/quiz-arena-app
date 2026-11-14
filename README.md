# quiz-arena-app

Cross-platform React Native & Expo mobile application for **Set Quick Trade** — the Tamil Nadu & multi-category skill tournament platform.

## 🚀 Features

- **Cyberpunk Emerald UI**: Fast, responsive dark theme tailored for competitive skill gaming.
- **Dynamic Hero Banners**: Auto-cycling promo carousel controlled directly from Admin Panel.
- **Bilingual Interface**: Full English and தமிழ் language toggling with live text updates.
- **Matchmaking & Tournaments**: Group 4 / Group 2 TNPSC, Kollywood Cinema, General GK, Science & Tech arenas.
- **Skill Wallet & Payouts**: Real-time balance updates, mock UPI withdrawal requests, and live verified transaction proofs.
- **Multi-Player Arenas**: Scheduled tournaments, countdown timers, and synchronized buzzer quizzes via Socket.IO.

## 🛠️ Tech Stack

- **Framework**: React Native 0.76+ / Expo SDK 52
- **Styling**: NativeWind / TailwindCSS & Custom Glassmorphic Styles
- **Real-Time**: Socket.IO Client
- **Internationalization**: i18next & react-i18next
- **Icons**: Expo Vector Icons (Ionicons)
- **Fonts**: Noto Sans Tamil & Plus Jakarta Sans

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npx expo start
```

