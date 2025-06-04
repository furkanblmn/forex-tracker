import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMetrics } from '@/composables/useMetrics'
import { useValidation } from '@/composables/useValidation'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { ForexData, PortfolioItem, PortfolioHistoryItem } from '@/types'

export const usePortfolioStore = defineStore('portfolio', () => {
    const portfolio = ref<PortfolioItem[]>([])
    const errorHandler = useErrorHandler()
    const validation = useValidation()
    const persistence = useLocalStorage<PortfolioHistoryItem[]>('portfolio_history', [])
    const metrics = useMetrics()

    const loadPersistedData = () => {
        try {
            const history = persistence.data.value
            if (history && history.length > 0) {
                // Reconstruct portfolio from history
                const portfolioMap = new Map<string, PortfolioItem>()
                history.forEach(item => {
                    if (item.type === 'buy') {
                        const existing = portfolioMap.get(item.pair)
                        if (existing) {
                            existing.volume += item.volume
                        } else {
                            portfolioMap.set(item.pair, {
                                pair: item.pair,
                                price: item.price,
                                volume: item.volume
                            })
                        }
                    }
                })
                portfolio.value = Array.from(portfolioMap.values())
            }
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Load Portfolio')
        }
    }

    const savePortfolioHistory = (item: PortfolioHistoryItem) => {
        try {
            const history = persistence.data.value || []
            history.push(item)
            persistence.data.value = history
        } catch (error) {
            errorHandler.handleGeneralError(error, 'Save Portfolio History')
        }
    }

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

            savePortfolioHistory({
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

            savePortfolioHistory({
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