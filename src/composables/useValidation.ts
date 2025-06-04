import { ref } from 'vue'
import type { ForexData } from '@/services/websocket-service'

export interface ValidationRule {
    validator: (value: any) => boolean
    message: string
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export const useValidation = () => {
    const validationErrors = ref<Record<string, string[]>>({})

    // Volume validation rules
    const volumeRules: ValidationRule[] = [
        {
            validator: (value: number) => value !== null && value !== undefined,
            message: 'Volume is required'
        },
        {
            validator: (value: number) => !isNaN(value),
            message: 'Volume must be a valid number'
        },
        {
            validator: (value: number) => value > 0,
            message: 'Volume must be greater than 0'
        },
        {
            validator: (value: number) => value <= 1000000,
            message: 'Volume cannot exceed 1,000,000'
        },
        {
            validator: (value: number) => Number(value.toFixed(2)) === value || value.toString().split('.')[1]?.length <= 2,
            message: 'Volume can have maximum 2 decimal places'
        }
    ]

    // Forex data validation rules
    const forexDataRules: ValidationRule[] = [
        {
            validator: (data: ForexData) => !!(data.pair && typeof data.pair === 'string'),
            message: 'Invalid forex pair'
        },
        {
            validator: (data: ForexData) => typeof data.price === 'number' && data.price > 0,
            message: 'Invalid price'
        },
        {
            validator: (data: ForexData) => typeof data.change === 'number',
            message: 'Invalid change value'
        },
        {
            validator: (data: ForexData) => typeof data.volume === 'number' && data.volume >= 0,
            message: 'Invalid volume'
        }
    ]

    const validateField = (value: any, rules: ValidationRule[], fieldName: string): ValidationResult => {
        const errors: string[] = []

        for (const rule of rules) {
            if (!rule.validator(value)) {
                errors.push(rule.message)
            }
        }

        // Update validation errors state
        if (errors.length > 0) {
            validationErrors.value[fieldName] = errors
        } else {
            delete validationErrors.value[fieldName]
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    const validateVolume = (volume: number, fieldName: string = 'volume'): ValidationResult => {
        return validateField(volume, volumeRules, fieldName)
    }

    const validateForexData = (data: ForexData, fieldName: string = 'forexData'): ValidationResult => {
        return validateField(data, forexDataRules, fieldName)
    }

    const validateBuyVolumes = (volumes: Record<string, number>): ValidationResult => {
        const allErrors: string[] = []

        // Clear previous volume validation errors
        Object.keys(validationErrors.value).forEach(key => {
            if (key.startsWith('volume_')) {
                delete validationErrors.value[key]
            }
        })

        Object.entries(volumes).forEach(([pair, volume]) => {
            const result = validateVolume(volume, `volume_${pair}`)
            if (!result.isValid) {
                allErrors.push(`${pair}: ${result.errors.join(', ')}`)
            }
        })

        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        }
    }

    const validatePairSelection = (selectedPairs: ForexData[]): ValidationResult => {
        const errors: string[] = []

        if (!selectedPairs || selectedPairs.length === 0) {
            errors.push('Please select at least one forex pair')
        }

        if (selectedPairs.length > 10) {
            errors.push('Maximum 10 pairs can be selected at once')
        }

        // Validate each selected pair
        selectedPairs.forEach((pair, index) => {
            const result = validateForexData(pair, `selectedPair_${index}`)
            if (!result.isValid) {
                errors.push(`Invalid data for ${pair.pair || 'unknown pair'}`)
            }
        })

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    const clearValidationErrors = (fieldName?: string) => {
        if (fieldName) {
            delete validationErrors.value[fieldName]
        } else {
            validationErrors.value = {}
        }
    }

    const hasValidationErrors = (): boolean => {
        return Object.keys(validationErrors.value).length > 0
    }

    const getValidationErrors = (fieldName?: string): string[] => {
        if (fieldName) {
            return validationErrors.value[fieldName] || []
        }

        // Return all errors flattened
        return Object.values(validationErrors.value).flat()
    }

    return {
        validationErrors,
        validateVolume,
        validateForexData,
        validateBuyVolumes,
        validatePairSelection,
        clearValidationErrors,
        hasValidationErrors,
        getValidationErrors
    }
} 