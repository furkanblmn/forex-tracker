# Forex Tracker - Real-time Currency Exchange Monitoring

A modern, responsive web application for tracking real-time forex data with portfolio management capabilities. Built with Vue 3, TypeScript, PrimeVue, and Finnhub API.

## 🚀 Features

### Core Functionality
- **Real-time Forex Data**: Live forex pair updates via WebSocket connection
- **Portfolio Management**: Track your forex investments with volume and value calculations
- **Buy & Sell Simulation**: Virtual trading with volume selection and transaction history
- **Export Capabilities**: CSV export for portfolio data
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features
- **Global State Management**: Optimized Pinia store with WebSocket management
- **Error Handling**: Comprehensive error system with different error types
- **Rate Limiting**: API protection with configurable limits
- **Data Validation**: Input validation for volume and forex data
- **Local Storage**: Persistent data with cross-tab synchronization
- **Performance Monitoring**: Metrics tracking and performance optimization
- **Debounced Input**: 300ms debounce for better UX
- **Dynamic Scroll Height**: Responsive table heights based on viewport

## 🛠 Technologies Used

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **PrimeVue** - Rich UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - Modern state management for Vue
- **Vite** - Fast build tool and development server
- **Finnhub API** - Real-time financial data provider

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Finnhub API account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aegeanlabs-case-study
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Finnhub API key:
   ```env
   VITE_FINNHUB_API_KEY=your_actual_api_key_here
   NODE_ENV=development
   ```

4. **Get Finnhub API Key**
   - Visit [Finnhub.io](https://finnhub.io/register)
   - Create an account
   - Copy your API key from the dashboard
   - Paste it in the `.env` file

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will start and display the local URL in your terminal.

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 🏗 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── forex/              # Forex-specific components
│   │   ├── BuyForexModal.vue    # Buy dialog with volume input
│   │   └── ErrorDisplay.vue     # Global error display
│   └── Sidebar.vue             # Navigation sidebar
├── composables/            # Vue composition functions
│   ├── useCommon.ts           # Common utilities & formatting
│   ├── useErrorHandler.ts     # Error management system
│   ├── useValidation.ts       # Input validation rules
│   ├── useLocalStorage.ts     # Persistent data storage
│   ├── useRateLimit.ts        # API rate limiting
│   └── useMetrics.ts          # Performance monitoring
├── stores/                 # Pinia state management
│   └── forex.ts              # Main forex store with WebSocket
├── services/               # External API services
│   └── websocket-service.ts   # Finnhub WebSocket integration
├── views/                  # Page components
│   ├── TrackerView.vue        # Main forex tracking page
│   └── MyAssetsView.vue       # Portfolio management page
├── router/                 # Vue Router configuration
│   └── index.ts
├── assets/                 # Static assets
│   └── css/app.css           # Global styles
└── App.vue                 # Root application component
```

## 📱 Usage Guide

### Forex Pairs Tracker Page
1. **View Real-time Data**: 
   - Navigate to the main tracker page
   - See live forex pairs with price, change%, volume, and timestamps
   - Green/red colors indicate price increases/decreases

2. **Select Forex Pairs**:
   - Use checkboxes to select multiple pairs
   - Selected pairs enable the "Buy" button

3. **Purchase Simulation**:
   - Click "Buy" button to open purchase modal
   - Enter volume amounts for each selected pair
   - Debounced input validation (300ms delay)
   - Confirm to add to your portfolio

### My Assets Portfolio Page
1. **Portfolio Management**:
   - View all your forex holdings
   - See purchase prices, volumes, and calculated total values
   - Real-time portfolio value updates

2. **Export Data**:
   - Click "Export CSV" to download portfolio data
   - Includes all transaction history and current values

3. **Remove Assets**:
   - Use trash icon to remove individual positions
   - Portfolio summary updates automatically

### Navigation
- **Sidebar Menu**: Fixed left navigation with Tracker and My Assets
- **Responsive Design**: Mobile-friendly collapsible menu
- **Active States**: Current page highlighted

## ⚡ Key Features Implemented

### Core Functionality
- ✅ Real-time forex data via WebSocket
- ✅ Multiple pair selection and portfolio management
- ✅ Buy simulation with volume input
- ✅ CSV export functionality
- ✅ Responsive sidebar navigation

### Advanced Features
- ✅ **Global WebSocket Management**: Single connection optimization
- ✅ **Error Handling**: Comprehensive error system with types
- ✅ **Rate Limiting**: API protection (10 buys/min, 5 exports/min)
- ✅ **Data Validation**: Volume limits (0-1M, 2 decimals max)
- ✅ **Local Storage**: Portfolio persistence with cross-tab sync
- ✅ **Performance Metrics**: User action tracking and analytics
- ✅ **Debounced Input**: 300ms debounce for better UX
- ✅ **Dynamic UI**: Responsive table heights and virtual scrolling

### Performance Optimizations
- ✅ Single WebSocket connection across components
- ✅ Virtual scrolling for large datasets
- ✅ Dynamic scroll heights based on viewport
- ✅ Efficient Vue 3 reactivity patterns
- ✅ Optimized re-rendering with proper key usage

## 🔧 Configuration Options

### Environment Variables
```env
# Required
VITE_FINNHUB_API_KEY=your_api_key_here

# Optional
NODE_ENV=development
```

### Customizable Settings
- **Rate Limits**: Modify in `useRateLimit.ts`
- **Validation Rules**: Adjust in `useValidation.ts`
- **Storage Keys**: Configure in `useLocalStorage.ts`
- **Scroll Heights**: Customize in `useCommon.ts`

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Network Errors**: WebSocket connection failures with auto-retry
- **Validation Errors**: Input validation with user feedback
- **API Errors**: Rate limiting and API response errors
- **User Errors**: Form validation and data integrity checks

All errors are displayed via the global error system with auto-removal.

## 📊 Monitoring & Analytics

Built-in performance monitoring includes:
- User action tracking (buy, export, page views)
- Performance metrics (load times, response times)
- Error logging and analytics
- Browser performance API integration

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for medium screens
- **Desktop Experience**: Full-featured desktop interface
- **Touch-Friendly**: Large tap targets and touch gestures

## 🔒 Security Features

- **Environment Variables**: Secure API key management
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention
- **Error Sanitization**: Safe error message handling

## 🧪 Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Component Architecture**: Modular, reusable components
- **Composition API**: Modern Vue 3 patterns

### Performance Monitoring
- **Metrics Tracking**: Built-in performance monitoring
- **Error Logging**: Comprehensive error tracking
- **User Analytics**: Action tracking and usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:
1. Check the browser console for error messages
2. Verify your Finnhub API key is correct
3. Ensure stable internet connection for WebSocket
4. Check Finnhub API rate limits if requests fail

---

Built with ❤️ using Vue 3, TypeScript, and modern web technologies.

