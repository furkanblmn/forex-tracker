import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ForexData } from '@/services/websocket-service'
import { useWebSocketService } from '@/services/websocket-service'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMetrics } from '@/composables/useMetrics'

export const useForexStore = defineStore('forex', () => {
    const selectedPairs = ref<ForexData[]>([])
    const errorHandler = useErrorHandler()
    const metrics = useMetrics()

    // Global WebSocket bağlantısı
    const { forexData, isConnected, error, disconnect } = useWebSocketService()

    watch(error, (newError) => {
        if (newError) {
            errorHandler.handleWebSocketError(newError)
            metrics.trackWebSocketEvent('connection_error', { error: newError })
        }
    })

    // Global WebSocket bağlantısını sonlandırma
    const disconnectWebSocket = () => {
        try {
            disconnect()
            metrics.trackWebSocketEvent('disconnected')
        } catch (error) {
            errorHandler.handleGeneralError(error, 'WebSocket Disconnect')
        }
    }

    const initialize = () => {
        metrics.measureWebVitals()
        metrics.trackPageView('forex_store_initialized')
    }

    initialize()

    return {
        // State
        selectedPairs,
        forexData,
        isConnected,
        error,
        errors: errorHandler.errors,
        hasErrors: errorHandler.hasErrors,
        metrics: metrics.exportMetrics,

        // Actions
        disconnectWebSocket,
        clearErrors: errorHandler.clearErrors,
        clearMetrics: metrics.clearMetrics
    }
}) 