import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { ForexData, WebSocketTrade } from '@/types'
import { logger } from '@/utils/logger'

const COMPONENT_NAME = 'WebSocketService'
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const WS_URL = `wss://ws.finnhub.io?token=${API_KEY}`
const REST_URL = 'https://finnhub.io/api/v1'

export const useWebSocketService = () => {
    const forexDataMap = ref<Record<string, ForexData>>({})
    const ws = ref<WebSocket | null>(null)
    const isConnected = ref(false)
    const error = ref<string | null>(null)
    const symbolDisplayMap = ref<Record<string, string>>({})

    const connectWebSocket = () => {
        if (!API_KEY) {
            error.value = 'Finnhub API key not found. Please set VITE_FINNHUB_API_KEY in your .env file.'
            logger.error('Finnhub API key not found', null, { component: COMPONENT_NAME })
            return
        }

        logger.info('Starting WebSocket connection', {
            component: COMPONENT_NAME,
            action: 'connect',
            data: { url: WS_URL }
        })

        try {
            ws.value = new WebSocket(WS_URL)

            ws.value.onopen = () => {
                logger.info('WebSocket connection established', {
                    component: COMPONENT_NAME,
                    action: 'onopen'
                })
                isConnected.value = true
                error.value = null
                subscribeToAllPairs()
            }

            ws.value.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.type === 'trade' && data.data && Array.isArray(data.data)) {
                    handleTradeData(data.data)
                } else if (data.type === 'ping') {
                    // Ping messages are expected and don't need logging
                } else if (data.type === 'error') {
                    const errorMessage = `API Error: ${data.msg}`
                    logger.error('Finnhub API error', data.msg, {
                        component: COMPONENT_NAME,
                        action: 'onmessage'
                    })
                    error.value = errorMessage
                } else if (data.type !== 'ping') {
                    logger.debug('Unknown message type or format', {
                        component: COMPONENT_NAME,
                        action: 'onmessage',
                        data
                    })
                }
            }

            ws.value.onerror = (event) => {
                logger.error('WebSocket connection error', event, {
                    component: COMPONENT_NAME,
                    action: 'onerror'
                })
                isConnected.value = false
                error.value = 'WebSocket connection error occurred.'
                setTimeout(connectWebSocket, 5000)
            }

            ws.value.onclose = (event) => {
                logger.info('WebSocket connection closed', {
                    component: COMPONENT_NAME,
                    action: 'onclose',
                    data: { code: event.code, reason: event.reason }
                })
                isConnected.value = false
                error.value = `WebSocket connection closed. Code: ${event.code}`

                if (event.code !== 1000) {
                    logger.info('Unexpected WebSocket closure, attempting to reconnect', {
                        component: COMPONENT_NAME,
                        action: 'reconnect'
                    })
                    setTimeout(connectWebSocket, 5000)
                }
            }
        } catch (err) {
            logger.error('Connection error caught', err, {
                component: COMPONENT_NAME,
                action: 'connect'
            })
            error.value = 'An error occurred while establishing connection.'
            setTimeout(connectWebSocket, 5000)
        }
    }

    const handleTradeData = (trades: any[]) => {
        trades.forEach((trade: any) => {
            const pair = trade.s
            const price = trade.p
            const volume = trade.v
            const timestamp = new Date().toLocaleTimeString()

            const displayPair = symbolDisplayMap.value[pair] || pair

            if (forexDataMap.value[displayPair]) {
                const existing = forexDataMap.value[displayPair]
                const change = ((price - existing.price) / existing.price) * 100
                forexDataMap.value[displayPair] = {
                    ...existing,
                    price,
                    change: isNaN(change) ? 0 : change,
                    volume,
                    lastUpdate: timestamp
                }
            } else {
                forexDataMap.value[displayPair] = {
                    pair: displayPair,
                    price,
                    change: 0,
                    volume,
                    lastUpdate: timestamp
                }
            }
        })
    }

    const subscribeToAllPairs = async () => {
        if (!API_KEY) return

        try {
            const res = await fetch(`${REST_URL}/forex/symbol?exchange=oanda&token=${API_KEY}`)

            if (!res.ok) {
                const errorText = await res.text()
                const errorMessage = `Symbol list fetch failed: ${res.status} ${errorText}`
                logger.error('Finnhub /forex/symbol REST API error', null, {
                    component: COMPONENT_NAME,
                    action: 'subscribeToAllPairs',
                    data: { status: res.status, errorText }
                })
                error.value = errorMessage
                return
            }

            const symbolsData = await res.json()

            if (symbolsData && Array.isArray(symbolsData)) {
                const symbolsToSubscribe = symbolsData.map((item: any) => item.symbol)

                symbolsData.forEach((item: any) => {
                    symbolDisplayMap.value[item.symbol] = item.displaySymbol
                })

                if (ws.value && ws.value.readyState === WebSocket.OPEN) {
                    symbolsToSubscribe.slice(0, 50).forEach((symbol: string) => {
                        const msg = { type: 'subscribe', symbol: symbol }
                        ws.value?.send(JSON.stringify(msg))
                    })
                } else {
                    logger.warn('WebSocket connection not ready, unable to subscribe to symbols', {
                        component: COMPONENT_NAME,
                        action: 'subscribeToAllPairs'
                    })
                }
            } else {
                const errorMessage = 'Invalid symbol list received from Finnhub API.'
                logger.error('Invalid data format from Finnhub /forex/symbol REST API', symbolsData, {
                    component: COMPONENT_NAME,
                    action: 'subscribeToAllPairs'
                })
                error.value = errorMessage
            }

        } catch (err) {
            logger.error('Error fetching forex symbol list', err, {
                component: COMPONENT_NAME,
                action: 'subscribeToAllPairs'
            })
            error.value = 'An error occurred while fetching forex symbol list.'
        }
    }

    const disconnect = () => {
        if (ws.value) {
            logger.info('Closing WebSocket connection', {
                component: COMPONENT_NAME,
                action: 'disconnect'
            })
            ws.value.close(1000, 'User initiated disconnect')
            ws.value = null
        }
    }

    onMounted(() => {
        connectWebSocket()
    })

    onUnmounted(() => {
        disconnect()
    })

    const forexDataArray = computed<ForexData[]>(() => {
        return Object.values(forexDataMap.value)
    })

    return {
        forexData: forexDataArray,
        isConnected,
        error,
        disconnect
    }
} 