export interface MetricEvent {
    id: string
    type: 'pageview' | 'user_action' | 'performance' | 'error' | 'websocket'
    category: string
    action: string
    label?: string
    value?: number
    timestamp: number
    sessionId: string
    userId?: string
    metadata?: Record<string, any>
}

export interface PerformanceMetric {
    name: string
    value: number
    timestamp: number
    type: 'timing' | 'counter' | 'gauge'
} 