import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ForexData } from '@/types'
import { useErrorStore } from './errorStore'
import { useValidation } from '@/composables/useValidation'
import { useBuyActionRateLimit } from '@/composables/useRateLimit'
import { useMetrics } from '@/composables/useMetrics'
import { usePortfolioStore } from './portfolioStore'

export const useTransactionStore = defineStore('transaction', () => {
    const isBuyModalOpen = ref(false)
    const errorStore = useErrorStore()
    const validation = useValidation()
    const buyRateLimit = useBuyActionRateLimit()
    const metrics = useMetrics()
    const portfolioStore = usePortfolioStore()

    const openBuyModal = (selectedPairs: ForexData[]) => {
        const validationResult = validation.validatePairSelection(selectedPairs)
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                errorStore.handleValidationError(error)
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
                errorStore.handleRateLimitError(
                    'Rate limit exceeded',
                    `Please wait ${Math.ceil((buyRateLimit.getResetTime() || 0) / 1000)} seconds before making another purchase`
                )
                return false
            }

            return portfolioStore.addToPortfolio(forexPair, volume)
        } catch (error) {
            errorStore.handleGeneralError(error, 'Buy Transaction')
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
        errors: errorStore.errors,
        hasErrors: errorStore.hasErrors,
        validationErrors: validation.validationErrors,
        openBuyModal,
        closeBuyModal,
        executeBuy,
        clearErrors: errorStore.clearErrors,
        clearValidationErrors: validation.clearValidationErrors
    }
}) 