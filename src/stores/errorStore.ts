import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'

export const useErrorStore = defineStore('error', () => {
    const errorHandler = useErrorHandler()

    // Reactive computed properties for errors
    const errors = computed(() => errorHandler.errors)
    const hasErrors = computed(() => errorHandler.hasErrors)

    const removeError = (errorId: string) => {
        errorHandler.removeError(errorId)
    }

    const clearErrors = () => {
        errorHandler.clearErrors()
    }

    const handleValidationError = (message: string, details?: string) => {
        errorHandler.handleValidationError(message, details)
    }

    const handleRateLimitError = (message: string, details?: string) => {
        errorHandler.handleRateLimitError(message, details)
    }

    const handleNetworkError = (error: any, source?: string) => {
        errorHandler.handleNetworkError(error, source)
    }

    const handleWebSocketError = (error: any, source?: string) => {
        errorHandler.handleWebSocketError(error, source)
    }

    const handleGeneralError = (error: any, source?: string) => {
        errorHandler.handleGeneralError(error, source)
    }

    return {
        errors,
        hasErrors,
        removeError,
        clearErrors,
        handleValidationError,
        handleRateLimitError,
        handleNetworkError,
        handleWebSocketError,
        handleGeneralError
    }
}) 