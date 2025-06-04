# Forex Tracker Case Study

## Overview
In this case study, you are expected to develop a web application that displays and manages real-time forex data using the Finnhub API. The provided `websocket-service.ts` file contains the functionality to connect to the Finnhub WebSocket API and receive forex data.

## Getting Started

### Finnhub API Setup
1. Visit [Finnhub.io](https://finnhub.io/) and create a free account
2. After registration, get your API key from the dashboard
3. Add your API key to the `API_KEY` constant in `websocket-service.ts`

Note: The free tier of Finnhub API has certain rate limits, please refer to their documentation for details.

## Requirements

### 1. Forex Pairs Tracker Page
- Create a table displaying real-time forex pair data using the provided service file
- The table should include the following columns:
  - Pair (e.g., EUR/USD)
  - Price (5 decimals)
  - Change (as %, 3 decimals)
  - Volume
  - Last Update (hour:minute:second)
- Price changes should be indicated with different colors:
  - Increase: Green
  - Decrease: Red
- The table should support multiple selection

### 2. My Assets Page
- Create a portfolio page where users can track their selected forex pairs and amounts
- The table should include the following columns:
  - Pair
  - Price (purchase price)
  - Volume (amount)
  - Total Value (price * volume)
- Each row should have a delete button
- Add functionality to export data in CSV format

### 3. Navigation & Layout
- Create a fixed sidebar menu on the left
- Menu should contain links for two pages:
  - Tracker
  - My Assets
- Implement routing for page transitions

### 4. Import/Buy Functionality
- Add a "Buy" button to import selected pairs from Forex Pairs Tracker to My Assets
- During the Buy process:
  - Volume (amount) should be definable for each pair
  - Current price should be used
  - When buying the same pair again, volume values should be summed

## Technical Requirements
- Use Vue 3 Composition API
- Ensure type safety with TypeScript
- Use PrimeVue component library
- Use pinia store for state management
- Apply responsive design principles

## Bonus Points
- Write unit tests
- Implement error handling

## Evaluation Criteria
- Clean code and best practices
- Component architecture
- TypeScript usage
- State management
- UI/UX design
- Performance optimizations
- Error handling
- Code organization and structure

## Submission
- Share your work in a GitHub repository
- In the README file, explain:
  - Setup steps
  - Technologies used
  - Project structure
  - Important decisions and their reasons
- Share a working demo link

### Bonus Points
- Implement rate limiting
- Add data validation
- Implement data persistence
- Add performance optimizations
- Include monitoring and metrics

Good luck! 🚀

