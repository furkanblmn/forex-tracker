import { ref } from 'vue'

export interface AppError {
    id: string
    type: 'network' | 'validation' | 'websocket' | 'general'
    message: string
    details?: string
    timestamp: number
    source?: string
}

export const useErrorHandler = () => {
    const errors = ref<AppError[]>([])
    const hasErrors = ref(false)

    const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
        const newError: AppError = {
            ...error,
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        }

        errors.value.push(newError)
        hasErrors.value = true

        // Log error for monitoring
        console.error('[Error Handler]', newError)

        // Auto remove error after 10 seconds for non-critical errors
        if (error.type !== 'websocket') {
            setTimeout(() => removeError(newError.id), 10000)
        }
    }

    const removeError = (errorId: string) => {
        const index = errors.value.findIndex(error => error.id === errorId)
        if (index !== -1) {
            errors.value.splice(index, 1)
            hasErrors.value = errors.value.length > 0
        }
    }

    const clearErrors = () => {
        errors.value = []
        hasErrors.value = false
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

    const handleGeneralError = (error: any, source: string = 'Application') => {
        addError({
            type: 'general',
            message: error.message || 'An unexpected error occurred',
            details: error.stack,
            source
        })
    }

    return {
        errors,
        hasErrors,
        addError,
        removeError,
        clearErrors,
        handleWebSocketError,
        handleNetworkError,
        handleValidationError,
        handleGeneralError
    }
} 