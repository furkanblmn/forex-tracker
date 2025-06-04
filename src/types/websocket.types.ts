export interface ForexData {
    pair: string
    price: number
    change: number
    volume: number
    lastUpdate: string
}

export interface WebSocketTrade {
    s: string // symbol
    p: number // price
    v: number // volume
} 