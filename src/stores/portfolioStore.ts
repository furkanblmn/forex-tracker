import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ForexData } from '@/services/websocket-service'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useValidation } from '@/composables/useValidation'
import { usePortfolioPersistence } from '@/composables/useLocalStorage'
import { useMetrics } from '@/composables/useMetrics'

export const usePortfolioStore = defineStore('portfolio', () => {
    const portfolio = ref<{ pair: string, price: number, volume: number }[]>([])
    const errorHandler = useErrorHandler()
    const validation = useValidation()
    const persistence = usePortfolioPersistence()
    const metrics = useMetrics()

    const loadPersistedData = () => {
        try {
            const savedPortfolio = persistence.loadPortfolio()
            if (Array.isArray(savedPortfolio)) {
                portfolio.value = savedPortfolio
                metrics.trackUserAction('portfolio_loaded', 'persistence', 'success', savedPortfolio.length)
            }
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Portfolio Loading')
            metrics.trackError(error as Error, 'persistence')
        }
    }

    watch(portfolio, (newPortfolio) => {
        try {
            persistence.savePortfolio(newPortfolio)
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Portfolio Saving')
        }
    }, { deep: true })

    const addToPortfolio = (forexPair: ForexData, volume: number) => {
        try {
            const volumeValidation = validation.validateVolume(volume)
            if (!volumeValidation.isValid) {
                volumeValidation.errors.forEach(error => {
                    errorHandler.handleValidationError(error)
                })
                return false
            }

            const forexValidation = validation.validateForexData(forexPair)
            if (!forexValidation.isValid) {
                forexValidation.errors.forEach(error => {
                    errorHandler.handleValidationError(error)
                })
                return false
            }

            const existingIndex = portfolio.value.findIndex(item => item.pair === forexPair.pair)

            if (existingIndex !== -1) {
                portfolio.value[existingIndex].volume += volume
                metrics.trackUserAction('portfolio_item_updated', 'portfolio', forexPair.pair, volume)
            } else {
                portfolio.value.push({
                    pair: forexPair.pair,
                    price: forexPair.price,
                    volume: volume
                })
                metrics.trackUserAction('portfolio_item_added', 'portfolio', forexPair.pair, volume)
            }

            persistence.savePortfolioHistory({
                type: 'buy',
                pair: forexPair.pair,
                price: forexPair.price,
                volume: volume,
                total: forexPair.price * volume
            })

            return true
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Add to Portfolio')
            metrics.trackError(error as Error, 'portfolio')
            return false
        }
    }

    const removeFromPortfolio = (index: number) => {
        try {
            if (index < 0 || index >= portfolio.value.length) {
                errorHandler.handleValidationError('Invalid portfolio item index')
                return false
            }

            const removedItem = portfolio.value[index]
            portfolio.value.splice(index, 1)

            metrics.trackUserAction('portfolio_item_removed', 'portfolio', removedItem.pair)

            persistence.savePortfolioHistory({
                type: 'remove',
                pair: removedItem.pair,
                price: removedItem.price,
                volume: removedItem.volume
            })

            return true
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Remove from Portfolio')
            return false
        }
    }

    const initialize = () => {
        loadPersistedData()
        metrics.trackPageView('portfolio_store_initialized')
    }

    initialize()

    return {
        portfolio,
        errors: errorHandler.errors,
        hasErrors: errorHandler.hasErrors,
        validationErrors: validation.validationErrors,
        addToPortfolio,
        removeFromPortfolio,
        clearErrors: errorHandler.clearErrors,
        clearValidationErrors: validation.clearValidationErrors
    }
}) 