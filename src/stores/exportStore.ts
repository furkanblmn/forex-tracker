import { defineStore } from 'pinia'
import { useErrorStore } from '@/stores'
import { useExportRateLimit } from '@/composables/useRateLimit'
import { useMetrics } from '@/composables/useMetrics'
import { usePortfolioStore } from './portfolioStore'

export const useExportStore = defineStore('export', () => {
    const errorStore = useErrorStore()
    const exportRateLimit = useExportRateLimit()
    const metrics = useMetrics()
    const portfolioStore = usePortfolioStore()

    const exportToCSV = () => {
        try {
            if (!exportRateLimit.addRequest()) {
                errorStore.handleRateLimitError(
                    'Export rate limit exceeded',
                    `Please wait ${Math.ceil((exportRateLimit.getResetTime() || 0) / 1000)} seconds before exporting again`
                )
                return false
            }

            if (portfolioStore.portfolio.length === 0) {
                errorStore.handleValidationError('No data to export')
                return false
            }

            const headers = ['Pair', 'Price', 'Volume', 'Total Value']
            const rows = portfolioStore.portfolio.map(item => [
                item.pair,
                item.price.toFixed(5),
                item.volume.toString(),
                (item.price * item.volume).toFixed(2)
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', 'my_assets.csv')
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            metrics.trackUserAction('csv_exported', 'export', 'portfolio', portfolioStore.portfolio.length)
            return true
        } catch (error) {
            errorStore.handleValidationError('Export failed', 'There was an error while exporting your portfolio data')
            metrics.trackError(error as Error, 'export')
            return false
        }
    }

    const initialize = () => {
        metrics.trackPageView('export_store_initialized')
    }

    initialize()

    return {
        exportToCSV
    }
}) 