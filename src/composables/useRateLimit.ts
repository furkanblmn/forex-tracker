import { ref } from 'vue'

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
    identifier?: string
}

export interface RateLimitState {
    requests: number[]
    isBlocked: boolean
    resetTime: number | null
}

export const useRateLimit = (config: RateLimitConfig) => {
    const { maxRequests, windowMs, identifier = 'default' } = config

    const state = ref<RateLimitState>({
        requests: [],
        isBlocked: false,
        resetTime: null
    })

    const cleanOldRequests = () => {
        const now = Date.now()
        state.value.requests = state.value.requests.filter(
            timestamp => now - timestamp < windowMs
        )
    }

    const checkLimit = (): boolean => {
        cleanOldRequests()

        if (state.value.requests.length >= maxRequests) {
            state.value.isBlocked = true
            state.value.resetTime = Date.now() + windowMs
            return false
        }

        state.value.isBlocked = false
        state.value.resetTime = null
        return true
    }

    const addRequest = (): boolean => {
        if (!checkLimit()) {
            return false
        }

        state.value.requests.push(Date.now())
        return true
    }

    const getRemainingRequests = (): number => {
        cleanOldRequests()
        return Math.max(0, maxRequests - state.value.requests.length)
    }

    const getResetTime = (): number | null => {
        if (!state.value.isBlocked) return null

        const now = Date.now()
        if (state.value.resetTime && state.value.resetTime > now) {
            return state.value.resetTime - now
        }

        // Reset if time has passed
        state.value.isBlocked = false
        state.value.resetTime = null
        return null
    }

    const reset = () => {
        state.value.requests = []
        state.value.isBlocked = false
        state.value.resetTime = null
    }

    return {
        state,
        checkLimit,
        addRequest,
        getRemainingRequests,
        getResetTime,
        reset
    }
}

export const useWebSocketRateLimit = () => {
    return useRateLimit({
        maxRequests: 60,
        windowMs: 60 * 1000,
        identifier: 'websocket'
    })
}

export const useBuyActionRateLimit = () => {
    return useRateLimit({
        maxRequests: 5,
        windowMs: 60 * 1000,
        identifier: 'buy_action'
    })
}

export const useExportRateLimit = () => {
    return useRateLimit({
        maxRequests: 2,
        windowMs: 60 * 1000,
        identifier: 'export'
    })
} 