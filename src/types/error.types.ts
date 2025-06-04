export interface AppError {
    id: string
    type: 'network' | 'validation' | 'websocket' | 'general' | 'rate_limit'
    message: string
    details?: string
    timestamp: number
    source?: string
} 