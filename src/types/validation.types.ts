export interface ValidationRule {
    validator: (value: any) => boolean
    message: string
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
} 