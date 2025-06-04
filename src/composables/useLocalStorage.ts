import { ref, watch, type Ref } from 'vue'

export interface StorageOptions {
    serializer?: {
        read: (value: string) => any
        write: (value: any) => string
    }
    defaultValue?: any
    syncAcrossTabs?: boolean
}

export const useLocalStorage = <T>(key: string, defaultValue?: T, options?: StorageOptions) => {
    const serializer = options?.serializer || {
        read: (v: string) => {
            try {
                return JSON.parse(v)
            } catch {
                return v
            }
        },
        write: (v: any) => JSON.stringify(v)
    }

    const storedValue = localStorage.getItem(key)
    const initialValue = storedValue !== null
        ? serializer.read(storedValue)
        : (defaultValue ?? null)

    const data: Ref<T> = ref(initialValue)

    // Watch for changes and save to localStorage
    watch(data, (newValue) => {
        if (newValue === null || newValue === undefined) {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, serializer.write(newValue))
        }
    }, { deep: true })

    // Listen for storage changes from other tabs
    if (options?.syncAcrossTabs) {
        window.addEventListener('storage', (e) => {
            if (e.key === key && e.newValue !== null) {
                data.value = serializer.read(e.newValue)
            }
        })
    }

    const remove = () => {
        localStorage.removeItem(key)
        data.value = defaultValue ?? null as T
    }

    const clear = () => {
        data.value = defaultValue ?? null as T
    }

    return {
        data,
        remove,
        clear
    }
}

// Portfolio persistence
export const usePortfolioPersistence = () => {
    const PORTFOLIO_KEY = 'forex_portfolio'
    const SETTINGS_KEY = 'forex_settings'

    const { data: portfolioData, remove: removePortfolio } = useLocalStorage<any[]>(
        PORTFOLIO_KEY,
        [],
        { syncAcrossTabs: true }
    )

    const { data: settingsData, remove: removeSettings } = useLocalStorage<any>(
        SETTINGS_KEY,
        {
            autoSave: true,
            exportFormat: 'csv',
            maxPortfolioItems: 50
        },
        { syncAcrossTabs: true }
    )

    const savePortfolio = (portfolio: any[]) => {
        portfolioData.value = portfolio
    }

    const loadPortfolio = () => {
        return portfolioData.value || []
    }

    const saveSettings = (settings: any) => {
        settingsData.value = { ...settingsData.value, ...settings }
    }

    const loadSettings = () => {
        return settingsData.value
    }

    const clearAllData = () => {
        removePortfolio()
        removeSettings()
    }

    const exportPortfolioHistory = () => {
        const history = localStorage.getItem('forex_portfolio_history')
        return history ? JSON.parse(history) : []
    }

    const savePortfolioHistory = (transaction: any) => {
        const history = exportPortfolioHistory()
        history.push({
            ...transaction,
            timestamp: Date.now(),
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })

        // Keep only last 100 transactions
        if (history.length > 100) {
            history.splice(0, history.length - 100)
        }

        localStorage.setItem('forex_portfolio_history', JSON.stringify(history))
    }

    return {
        portfolioData,
        settingsData,
        savePortfolio,
        loadPortfolio,
        saveSettings,
        loadSettings,
        clearAllData,
        exportPortfolioHistory,
        savePortfolioHistory
    }
} 