import type { ForexData } from './websocket.types'

export interface PortfolioItem {
    pair: string
    price: number
    volume: number
}

export interface PortfolioHistoryItem {
    type: 'buy' | 'remove'
    pair: string
    price: number
    volume: number
    total?: number
} 