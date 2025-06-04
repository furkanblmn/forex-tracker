import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ForexData } from '@/types'
import { useWebSocketService } from '@/services/websocket-service'
import { useErrorStore } from './errorStore'
import { useMetrics } from '@/composables/useMetrics'

export const useForexStore = defineStore('forex', () => {
    const selectedPairs = ref<ForexData[]>([])
    const errorStore = useErrorStore()
    const metrics = useMetrics()

    // Global WebSocket bağlantısı
    const { forexData, isConnected, error, disconnect } = useWebSocketService()

    watch(error, (newError) => {
        if (newError) {
            errorStore.handleWebSocketError(newError)
            metrics.trackWebSocketEvent('connection_error', { error: newError })
        }
    })

    // Global WebSocket bağlantısını sonlandırma
    const disconnectWebSocket = () => {
        try {
            disconnect()
            metrics.trackWebSocketEvent('disconnected')
        } catch (error) {
            errorStore.handleGeneralError(error, 'WebSocket Disconnect')
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
        errors: errorStore.errors,
        hasErrors: errorStore.hasErrors,
        metrics: metrics.exportMetrics,

        // Actions
        disconnectWebSocket,
        clearErrors: errorStore.clearErrors,
        clearMetrics: metrics.clearMetrics
    }
}) 