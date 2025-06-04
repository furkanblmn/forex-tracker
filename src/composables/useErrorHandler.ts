import { reactive } from 'vue'
import type { AppError } from '@/types'
import { logger } from '@/utils/logger'

// Global reactive error state
const globalErrorState = reactive<{
    errors: AppError[]
    hasErrors: boolean
}>({
    errors: [],
    hasErrors: false
})

export const useErrorHandler = () => {
    const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
        const newError: AppError = {
            ...error,
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        }

        globalErrorState.errors.push(newError)
        globalErrorState.hasErrors = true

        logger.error('[Error Handler]', newError, {
            component: 'ErrorHandler',
            action: 'addError'
        })

        // Auto remove error after 10 seconds for non-critical errors
        if (error.type !== 'websocket') {
            setTimeout(() => removeError(newError.id), 10000)
        }
    }

    const removeError = (errorId: string) => {
        const index = globalErrorState.errors.findIndex(error => error.id === errorId)
        if (index !== -1) {
            globalErrorState.errors.splice(index, 1)
            globalErrorState.hasErrors = globalErrorState.errors.length > 0
        }
    }

    const clearErrors = () => {
        globalErrorState.errors.length = 0
        globalErrorState.hasErrors = false
    }

    const handleWebSocketError = (error: any, source: string = 'WebSocket') => {
        addError({
            type: 'websocket',
            message: 'WebSocket connection error',
            details: error.message || 'Connection failed',
            source
        })
    }

    const handleNetworkError = (error: any, source: string = 'Network') => {
        addError({
            type: 'network',
            message: 'Network error occurred',
            details: error.message || 'Request failed',
            source
        })
    }

    const handleValidationError = (message: string, details?: string) => {
        addError({
            type: 'validation',
            message,
            details,
            source: 'Validation'
        })
    }

    const handleRateLimitError = (message: string, details?: string) => {
        addError({
            type: 'rate_limit',
            message,
            details,
            source: 'Rate Limit'
        })
    }

    const handleGeneralError = (error: any, source: string = 'Application') => {
        addError({
            type: 'general',
            message: error.message || 'An unexpected error occurred',
            details: error.stack,
            source
        })
    }

    return {
        get errors() { return globalErrorState.errors },
        get hasErrors() { return globalErrorState.hasErrors },
        addError,
        removeError,
        clearErrors,
        handleWebSocketError,
        handleNetworkError,
        handleValidationError,
        handleRateLimitError,
        handleGeneralError
    }
} 