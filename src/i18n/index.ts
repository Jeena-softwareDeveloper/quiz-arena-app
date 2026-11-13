import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app_name: 'Quiz Arena',
      skill_tournaments: 'Skill Tournament Arena',
      enter_battles: 'Enter live battles and win cash prizes',
      arenas_tab: 'Arenas',
      wallet_tab: 'Wallet',
      profile_tab: 'Profile',
      
      // Header
      for_you: 'For You',
      wallet_balance: 'Wallet',
      elo_rating: 'ELO',
      active_tournaments: 'Active Tournaments',
      categories: 'Categories',

      // Room Card
      best_match: 'BEST MATCH FOR YOU',
      starts_in: 'Starts in',
      starting_now: 'Starting Now',
      starts_at: 'Starts',
      closes_at: 'Closes',
      match_window: 'Match Window',
      duration: 'Duration',
      closed: 'Closed',
      entry_fee: 'Entry Fee',
      prize_pool: 'Prize Pool',
      players: 'Players',
      questions: 'Questions (10s timer)',
      unseen_questions: '100% Unseen',
      slot_confirmed: 'Slot Confirmed (Email Sent)',
      doors_open_soon: 'Doors open 10m prior',
      enter_live_arena: 'Enter Live Arena Now',
      enter_arena_now: 'Enter Live Arena Now',
      pre_register_slot: 'Pre-Register Slot',
      joining: 'Joining...',

      // Checkout Sheet
      checkout_title: 'Tournament Entry Checkout',
      checkout_subtitle: 'Confirm your slot and entry fee deduction',
      tournament_details: 'Tournament Details',
      entry_fee_due: 'Entry Fee Due',
      platform_fee: 'Platform Fee (0%)',
      total_payable: 'Total Payable',
      payment_source: 'Payment Method',
      wallet_payment: 'Quiz Arena Cash Wallet',
      available_balance: 'Available Balance',
      insufficient_balance: 'Insufficient Balance. Please recharge your wallet.',
      recharge_now: 'Quick Recharge +₹50',
      pay_and_confirm: 'Pay & Confirm Registration',
      processing_payment: 'Processing Payment...',
      cancel: 'Cancel',

      // Ticket Modal
      ticket_title: 'Registration Confirmed!',
      ticket_subtitle: 'Your battle slot has been secured',
      ticket_id: 'Ticket ID',
      email_sent_to: 'Confirmation details sent to your registered email.',
      doors_reminder: 'Important: Join the live arena during the joining window (10 mins before battle).',
      done: 'Awesome, Got It!',

      // Live Arena
      exit: 'Exit',
      score: 'Score',
      matchmaking: 'Matchmaking in progress',
      waiting_competitors: 'Waiting for Competitors...',
      matched_desc: 'Matched with players of similar education & skill tier',
      players_joined: 'Players Joined',
      participants_ready: 'Participants Ready',
      force_start: 'Force Start Match (Demo)',
      battle_starts_in: 'Battle Starts In',
      speed_bonus_hint: 'Faster answers earn speed bonus points!',
      question_of: 'Question',
      speed_points: 'Speed Points',
      correct: 'Correct!',
      incorrect: 'Incorrect! Better luck next question',
      round_complete: 'Round Complete',
      spot_on: 'Spot On! Correct Answer',
      correct_answer: 'Correct Answer',
      live_leaderboard: 'Live Round Leaderboard',
      next_in_3s: 'Next question loading in 3s...',

      // Waiting for Results
      results_pending: 'Tournament Completed!',
      results_under_review: 'Results Under Master Review (~10 mins)',
      results_waiting_desc: 'Your answers have been securely recorded. The Tournament Master is reviewing final scores and will officially release results & distribute cash prizes shortly.',
      tentative_standings: 'Tentative Standings (Under Review)',
      auto_podium_hint: 'This screen will automatically transition to the victory podium the moment the admin releases results.',

      // Finished Podium
      results_released_title: 'Tournament Results Officially Released!',
      won_prize: 'WON',
      prizes_credited: 'Cash prizes won have been instantly credited to your wallet balance!',
      return_lobby: 'Return to Battle Lobby',

      // Wallet Screen
      available_cash: 'Available Cash Balance',
      wallet_desc: '100% Usable for entering Skill Quizzes & Tournaments',
      instant_withdraw: 'Instant UPI Withdraw',
      quick_recharge: 'Quick Recharge (UPI / GPay / PhonePe)',
      ledger_audit: 'Transaction Ledger Audit',
      no_transactions: 'No transactions recorded yet',
      request_withdrawal: 'Request Cash Withdrawal',
      min_withdraw: 'Minimum: ₹20 • Instant UPI direct transfer',
      amount_label: 'Amount (₹)',
      upi_label: 'UPI ID',
      confirm_payout: 'Confirm Payout',

      // Profile Screen
      profile_matchmaking: 'Profile & Matchmaking',
      skill_rating_label: 'Skill Rating',
      your_name: 'Your Name',
      edu_level_title: 'Education Level (Matchmaking Engine)',
      edu_level_desc: 'Rooms and difficulty are dynamically matched to this selection.',
      topic_interests: 'Topic & Exam Interests',
      save_preferences: 'Save Matchmaking Preferences',
      logout: 'Logout Account',
    },
  },
  ta: {
    translation: {
      app_name: 'குவிஸ் அரினா',
      skill_tournaments: 'திறன் போட்டி அரங்கம்',
      enter_battles: 'நேரடி போட்டிகளில் வென்று பணப்பரிசுகளை வெல்லுங்கள்',
      arenas_tab: 'போட்டிகள்',
      wallet_tab: 'வாலட்',
      profile_tab: 'சுயவிவரம்',
      
      // Header
      for_you: 'உங்களுக்காக',
      wallet_balance: 'இருப்பு',
      elo_rating: 'திறன்',
      active_tournaments: 'தற்போதுள்ள போட்டிகள்',
      categories: 'பிரிவுகள்',

      // Room Card
      best_match: 'உங்களுக்கு மிகவும் பொருத்தமானது',
      starts_in: 'தொடங்குகிறது',
      starting_now: 'இப்போதே தொடங்குகிறது',
      starts_at: 'தொடக்கம்',
      closes_at: 'முடிவு',
      match_window: 'போட்டி நேரம்',
      duration: 'கால அளவு',
      closed: 'முடிந்தது',
      entry_fee: 'நுழைவுக் கட்டணம்',
      prize_pool: 'பரிசுத் தொகை',
      players: 'வீரர்கள்',
      questions: 'கேள்விகள் (10 வினாடி நேரம்)',
      unseen_questions: '100% புதிய கேள்விகள்',
      slot_confirmed: 'பதிவு முடிந்தது (மின்னஞ்சல் அனுப்பப்பட்டது)',
      doors_open_soon: '10 நிமிடங்களுக்கு முன் அரங்கம் திறக்கும்',
      enter_live_arena: 'இப்போதே களமிறங்கு (Doors Open)',
      enter_arena_now: 'இப்போதே களமிறங்கு',
      pre_register_slot: 'முன்பதிவு செய்',
      joining: 'பதிவாகிறது...',

      // Checkout Sheet
      checkout_title: 'போட்டி நுழைவுக் கட்டணம் செலுத்துதல்',
      checkout_subtitle: 'கட்டணம் செலுத்தி உங்கள் இடத்தை உறுதி செய்யுங்கள்',
      tournament_details: 'போட்டி விவரங்கள்',
      entry_fee_due: 'நுழைவுக் கட்டணம்',
      platform_fee: 'தளக் கட்டணம் (0%)',
      total_payable: 'செலுத்த வேண்டிய தொகை',
      payment_source: 'பணம் செலுத்தும் முறை',
      wallet_payment: 'குவிஸ் அரினா வாலட்',
      available_balance: 'வாலட் இருப்பு',
      insufficient_balance: 'வாலட்டில் போதுமான இருப்பு இல்லை. ரீசார்ஜ் செய்யவும்.',
      recharge_now: 'உடனடி ரீசார்ஜ் +₹50',
      pay_and_confirm: 'பணம் செலுத்தி பதிவு செய்',
      processing_payment: 'பணம் செலுத்தப்படுகிறது...',
      cancel: 'ரத்து செய்',

      // Ticket Modal
      ticket_title: 'முன்பதிவு வெற்றிகரமாக முடிந்தது!',
      ticket_subtitle: 'உங்கள் போட்டிக் களம் உறுதி செய்யப்பட்டது',
      ticket_id: 'டிக்கெட் எண்',
      email_sent_to: 'முழு விவரங்கள் உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.',
      doors_reminder: 'முக்கிய அறிவிப்பு: போட்டி தொடங்குவதற்கு 10 நிமிடங்களுக்கு முன் அரங்கில் இணையவும்.',
      done: 'சரி, புரிந்தது!',

      // Live Arena
      exit: 'வெளியேறு',
      score: 'மதிப்பெண்',
      matchmaking: 'வீரர்கள் இணைகிறார்கள்...',
      waiting_competitors: 'போட்டியாளர்கள் தயாராகிறார்கள்...',
      matched_desc: 'உங்கள் கல்வி நிலை மற்றும் திறனுக்கு ஏற்ப அமைக்கப்பட்ட களம்',
      players_joined: 'இணைந்துள்ள வீரர்கள்',
      participants_ready: 'களத்தில் உள்ளவர்கள்',
      force_start: 'போட்டியை இப்போதே தொடங்கு (Demo)',
      battle_starts_in: 'போட்டி தொடங்குகிறது',
      speed_bonus_hint: 'விரைவாக விடையளித்தால் கூடுதல் வேகப் புள்ளிகள்!',
      question_of: 'கேள்வி',
      speed_points: 'வேகப் புள்ளிகள்',
      correct: 'சரியான விடை!',
      incorrect: 'தவறான விடை! அடுத்த கேள்விக்கு முயற்சி செய்யுங்கள்',
      round_complete: 'சுற்று நிறைவு பெற்றது',
      spot_on: 'அருமை! சரியான விடை',
      correct_answer: 'சரியான விடை:',
      live_leaderboard: 'நேரடி சுற்று நிலவரம்',
      next_in_3s: 'அடுத்த கேள்வி 3 வினாடிகளில் வரும்...',

      // Waiting for Results
      results_pending: 'போட்டி முடிந்தது!',
      results_under_review: 'நிர்வாகியின் மதிப்பாய்வில் உள்ளது (~10 நிமிடங்கள்)',
      results_waiting_desc: 'உங்கள் விடைகள் வெற்றிகரமாக பதிவு செய்யப்பட்டன. நிர்வாகி முடிவுகளை இறுதி செய்ததும் வெற்றியாளர் பட்டியல் வெளியிடப்பட்டு பரிசுகள் வரவு வைக்கப்படும்.',
      tentative_standings: 'தற்காலிக நிலை (மதிப்பாய்வில்)',
      auto_podium_hint: 'நிர்வாகி முடிவுகளை வெளியிட்டவுடன் இந்த திரை தானாக வெற்றியாளர் மேடைக்கு மாறும்.',

      // Finished Podium
      results_released_title: 'போட்டி முடிவுகள் அதிகாரப்பூர்வமாக வெளியானது!',
      won_prize: 'வென்ற தொகை',
      prizes_credited: 'வெற்றி பெற்ற ரொக்கப் பரிசுகள் உடனடியாக உங்கள் வாலட்டில் வரவு வைக்கப்பட்டது!',
      return_lobby: 'போட்டி முகப்பிற்கு திரும்பு',

      // Wallet Screen
      available_cash: 'பயன்படுத்தக்கூடிய வாலட் இருப்பு',
      wallet_desc: '100% போட்டிகளில் கலந்து கொள்ள பயன்படுத்தலாம்',
      instant_withdraw: 'உடனடி UPI பணம் எடுத்தல்',
      quick_recharge: 'உடனடி ரீசார்ஜ் (UPI / GPay / PhonePe)',
      ledger_audit: 'பணப் பரிவர்த்தனை வரலாறு',
      no_transactions: 'இதுவரை பரிவர்த்தனைகள் எதுவும் இல்லை',
      request_withdrawal: 'பணம் எடுப்பதற்கான கோரிக்கை',
      min_withdraw: 'குறைந்தபட்சம்: ₹20 • உடனடி UPI வங்கிக் கணக்கு மாற்றம்',
      amount_label: 'தொகை (₹)',
      upi_label: 'UPI முகவரி',
      confirm_payout: 'பணம் எடுப்பதை உறுதி செய்',

      // Profile Screen
      profile_matchmaking: 'சுயவிவரம் & அமைப்புகள்',
      skill_rating_label: 'திறன் மதிப்பீடு',
      your_name: 'உங்கள் பெயர்',
      edu_level_title: 'கல்வி நிலை (Matchmaking Engine)',
      edu_level_desc: 'இந்த தேர்வுக்கு ஏற்பவே போட்டிகளும் கேள்விகளும் தேர்ந்தெடுக்கப்படும்.',
      topic_interests: 'பாடங்கள் & தேர்வு விருப்பங்கள்',
      save_preferences: 'அமைப்புகளைச் சேமி',
      logout: 'கணக்கிலிருந்து வெளியேறு',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

