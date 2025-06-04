import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type { AppError } from '@/types'

export const useErrorStore = defineStore('error', () => {
    const errorHandler = useErrorHandler()

    const removeError = (errorId: string) => {
        const errorIndex = errorHandler.errors.value.findIndex((error: AppError) => error.id === errorId)
        if (errorIndex !== -1) {
            errorHandler.errors.value.splice(errorIndex, 1)
        }
    }

    const handleValidationError = (message: string, details?: string) => {
        errorHandler.handleValidationError(message, details)
    }

    const handleRateLimitError = (message: string, details?: string) => {
        errorHandler.addError({
            type: 'rate_limit',
            message,
            details,
            source: 'Rate Limit'
        })
    }

    return {
        errors: errorHandler.errors,
        hasErrors: errorHandler.hasErrors,
        removeError,
        clearErrors: errorHandler.clearErrors,
        handleValidationError,
        handleRateLimitError
    }
}) 