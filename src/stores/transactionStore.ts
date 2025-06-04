import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ForexData } from '@/services/websocket-service'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useValidation } from '@/composables/useValidation'
import { useBuyActionRateLimit } from '@/composables/useRateLimit'
import { useMetrics } from '@/composables/useMetrics'
import { usePortfolioStore } from './portfolioStore'

export const useTransactionStore = defineStore('transaction', () => {
    const isBuyModalOpen = ref(false)
    const errorHandler = useErrorHandler()
    const validation = useValidation()
    const buyRateLimit = useBuyActionRateLimit()
    const metrics = useMetrics()
    const portfolioStore = usePortfolioStore()

    const openBuyModal = (selectedPairs: ForexData[]) => {
        const validationResult = validation.validatePairSelection(selectedPairs)
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                errorHandler.handleValidationError(error)
            })
            return false
        }

        isBuyModalOpen.value = true
        metrics.trackUserAction('buy_modal_opened', 'user_interaction', 'modal', selectedPairs.length)
        return true
    }

    const closeBuyModal = () => {
        isBuyModalOpen.value = false
        metrics.trackUserAction('buy_modal_closed', 'user_interaction', 'modal')
    }

    const executeBuy = (forexPair: ForexData, volume: number) => {
        try {
            if (!buyRateLimit.addRequest()) {
                errorHandler.handleValidationError(
                    'Rate limit exceeded',
                    `Please wait ${Math.ceil((buyRateLimit.getResetTime() || 0) / 1000)} seconds before making another purchase`
                )
                return false
            }

            return portfolioStore.addToPortfolio(forexPair, volume)
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Buy Transaction')
            metrics.trackError(error as Error, 'transaction')
            return false
        }
    }

    const initialize = () => {
        metrics.trackPageView('transaction_store_initialized')
    }

    initialize()

    return {
        isBuyModalOpen,
        errors: errorHandler.errors,
        hasErrors: errorHandler.hasErrors,
        validationErrors: validation.validationErrors,
        openBuyModal,
        closeBuyModal,
        executeBuy,
        clearErrors: errorHandler.clearErrors,
        clearValidationErrors: validation.clearValidationErrors
    }
}) 