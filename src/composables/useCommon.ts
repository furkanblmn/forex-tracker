import { computed, type Ref } from 'vue'

export const useCommon = () => {
    const formatNumber = (value: number, decimals: number = 2, suffix: string = ''): string => {
        return value.toFixed(decimals) + suffix
    }

    const calculateTotalValue = (items: Array<{ price: number; volume: number }>): number => {
        return items.reduce((total, item) => total + (item.price * item.volume), 0)
    }

    const getDynamicScrollHeight = (dataLength: number): string | undefined => {
        if (dataLength <= 8) {
            return undefined
        } else if (dataLength <= 15) {
            return 'calc(70vh - 150px)'
        } else {
            return 'calc(85vh - 150px)'
        }
    }

    const useDynamicScrollHeight = (dataSource: Ref<any[]> | (() => number)) => {
        return computed(() => {
            const length = typeof dataSource === 'function'
                ? dataSource()
                : dataSource.value.length
            return getDynamicScrollHeight(length)
        })
    }

    const getChangeColorClass = (change: number): string => {
        if (change > 0) return 'text-green-600'
        if (change < 0) return 'text-red-600'
        return ''
    }

    return {
        formatNumber,
        calculateTotalValue,
        getDynamicScrollHeight,
        useDynamicScrollHeight,
        getChangeColorClass
    }
} 