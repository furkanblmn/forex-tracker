import { ref, computed } from 'vue'

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

export const useMetrics = () => {
    const events = ref<MetricEvent[]>([])
    const performanceMetrics = ref<PerformanceMetric[]>([])
    const sessionId = ref(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

    // Performance tracking
    const trackPerformance = (name: string, value: number, type: 'timing' | 'counter' | 'gauge' = 'timing') => {
        performanceMetrics.value.push({
            name,
            value,
            timestamp: Date.now(),
            type
        })

        // Keep only last 1000 metrics
        if (performanceMetrics.value.length > 1000) {
            performanceMetrics.value.splice(0, performanceMetrics.value.length - 1000)
        }
    }

    // Event tracking
    const trackEvent = (eventData: Omit<MetricEvent, 'id' | 'timestamp' | 'sessionId'>) => {
        const event: MetricEvent = {
            ...eventData,
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            sessionId: sessionId.value
        }

        events.value.push(event)

        // Keep only last 500 events in memory
        if (events.value.length > 500) {
            events.value.splice(0, events.value.length - 500)
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.log('[Metrics]', event)
        }
    }

    // Specific tracking methods
    const trackPageView = (page: string, metadata?: Record<string, any>) => {
        trackEvent({
            type: 'pageview',
            category: 'navigation',
            action: 'page_view',
            label: page,
            metadata
        })
    }

    const trackUserAction = (action: string, category: string = 'user_interaction', label?: string, value?: number) => {
        trackEvent({
            type: 'user_action',
            category,
            action,
            label,
            value
        })
    }

    const trackWebSocketEvent = (action: string, metadata?: Record<string, any>) => {
        trackEvent({
            type: 'websocket',
            category: 'websocket',
            action,
            metadata
        })
    }

    const trackError = (error: Error | string, category: string = 'error', metadata?: Record<string, any>) => {
        trackEvent({
            type: 'error',
            category,
            action: 'error_occurred',
            label: typeof error === 'string' ? error : error.message,
            metadata: {
                ...metadata,
                stack: typeof error === 'object' ? error.stack : undefined
            }
        })
    }

    // Analytics computed properties
    const sessionDuration = computed(() => {
        if (events.value.length === 0) return 0
        const firstEvent = events.value[0]
        const lastEvent = events.value[events.value.length - 1]
        return lastEvent.timestamp - firstEvent.timestamp
    })

    const eventCounts = computed(() => {
        const counts: Record<string, number> = {}
        events.value.forEach(event => {
            const key = `${event.type}_${event.action}`
            counts[key] = (counts[key] || 0) + 1
        })
        return counts
    })

    const averagePerformance = computed(() => {
        const timingMetrics = performanceMetrics.value.filter(m => m.type === 'timing')
        if (timingMetrics.length === 0) return {}

        const grouped: Record<string, number[]> = {}
        timingMetrics.forEach(metric => {
            if (!grouped[metric.name]) grouped[metric.name] = []
            grouped[metric.name].push(metric.value)
        })

        const averages: Record<string, number> = {}
        Object.entries(grouped).forEach(([name, values]) => {
            averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length
        })

        return averages
    })

    // Data export
    const exportMetrics = () => {
        return {
            sessionId: sessionId.value,
            sessionDuration: sessionDuration.value,
            events: events.value,
            performanceMetrics: performanceMetrics.value,
            eventCounts: eventCounts.value,
            averagePerformance: averagePerformance.value,
            exportedAt: Date.now()
        }
    }

    const clearMetrics = () => {
        events.value = []
        performanceMetrics.value = []
    }

    // Browser performance API integration
    const measureWebVitals = () => {
        if ('performance' in window) {
            // Core Web Vitals tracking
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming
                        trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart)
                        trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart)
                    }

                    if (entry.entryType === 'paint') {
                        trackPerformance(entry.name.replace('-', '_'), entry.startTime)
                    }
                })
            })

            try {
                observer.observe({ entryTypes: ['navigation', 'paint'] })
            } catch (e) {
                console.warn('Performance observer not supported')
            }
        }
    }

    return {
        events,
        performanceMetrics,
        sessionId,
        trackEvent,
        trackPageView,
        trackUserAction,
        trackWebSocketEvent,
        trackError,
        trackPerformance,
        sessionDuration,
        eventCounts,
        averagePerformance,
        exportMetrics,
        clearMetrics,
        measureWebVitals
    }
} 