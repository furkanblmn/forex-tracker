import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { ForexData, WebSocketTrade } from '@/types'

// API anahtarını buradan okuyun
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY

if (!API_KEY) {
    console.error('Finnhub API anahtarı bulunamadı. Lütfen .env dosyasında VITE_FINNHUB_API_KEY değişkenini ayarlayın.')
}

const WS_URL = `wss://ws.finnhub.io?token=${API_KEY}`
const REST_URL = `https://finnhub.io/api/v1`

export const useWebSocketService = () => {
    const forexDataMap = ref<Record<string, ForexData>>({})
    const ws = ref<WebSocket | null>(null)
    const isConnected = ref(false)
    const error = ref<string | null>(null)

    const symbolDisplayMap = ref<Record<string, string>>({})

    const connectWebSocket = () => {
        if (!API_KEY) {
            error.value = 'API anahtarı bulunamadı. Lütfen .env dosyasında VITE_FINNHUB_API_KEY değişkenini ayarlayın.'
            return
        }

        console.log('WebSocket bağlantısı başlatılıyor...', WS_URL)

        try {
            ws.value = new WebSocket(WS_URL)

            ws.value.onopen = () => {
                console.log('WebSocket bağlantısı kuruldu')
                isConnected.value = true
                error.value = null
                // Bağlantı kurulunca sembollere abone ol
                subscribeToAllPairs()
            }

            ws.value.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.type === 'trade' && data.data && Array.isArray(data.data)) {
                    data.data.forEach((trade: any) => {
                        const pair = trade.s
                        const price = trade.p
                        const volume = trade.v
                        const timestamp = new Date().toLocaleTimeString()

                        // Pair olarak görünen ismi (displaySymbol) kullan
                        const displayPair = symbolDisplayMap.value[pair] || pair; // Eşleşme bulunamazsa symbol kullan

                        // Mevcut pair varsa update et, yoksa ekle (displayPair kullanarak)
                        if (forexDataMap.value[displayPair]) {
                            const existing = forexDataMap.value[displayPair]
                            // Change hesaplama: (yeni fiyat - eski fiyat) / eski fiyat * 100
                            const change = ((price - existing.price) / existing.price) * 100
                            forexDataMap.value[displayPair] = {
                                ...existing,
                                price,
                                change: isNaN(change) ? 0 : change, // NaN gelirse 0 yap
                                volume,
                                lastUpdate: timestamp
                            }
                        } else {
                            forexDataMap.value[displayPair] = {
                                pair: displayPair, // Burada displayPair kullanılıyor
                                price,
                                change: 0, // İlk veri geldiğinde değişim 0
                                volume,
                                lastUpdate: timestamp
                            }
                        }
                    })
                } else if (data.type === 'ping') {
                    // console.log('Ping mesajı alındı'); // Debug için açılabilir
                } else if (data.type === 'error') {
                    console.error('Finnhub API hatası:', data.msg);
                    error.value = `API Hatası: ${data.msg}`
                }
                // Diğer bilinmeyen mesaj tiplerini veya format hatalarını logla
                else if (data.type !== 'ping') {
                    console.log('Bilinmeyen mesaj tipi veya formatı:', data);
                }
            }

            ws.value.onerror = (event) => {
                console.error('WebSocket bağlantısında bir hata oluştu:', event)
                isConnected.value = false
                error.value = 'WebSocket bağlantısında bir hata oluştu.'
                setTimeout(connectWebSocket, 5000) // 5 saniye sonra yeniden dene
            }

            ws.value.onclose = (event) => {
                console.log('WebSocket bağlantısı kapandı:', event.code, event.reason)
                isConnected.value = false
                error.value = `WebSocket bağlantısı kapandı. Kod: ${event.code}`
                // Beklenmedik kapanmalarda yeniden bağlanmayı dene (kod 1000 normal kapanma)
                if (event.code !== 1000) {
                    console.log('WebSocket beklenmedik şekilde kapandı, yeniden bağlanılıyor...');
                    setTimeout(connectWebSocket, 5000)
                }
            }
        } catch (err) {
            console.error('Bağlantı hatası yakalandı:', err)
            error.value = 'Bağlantı kurulurken bir hata oluştu.'
            // Hata sonrası yeniden bağlanmayı dene
            setTimeout(connectWebSocket, 5000) // 5 saniye sonra yeniden dene
        }
    }

    const subscribeToAllPairs = async () => {
        if (!API_KEY) return

        try {
            // Oanda exchange'deki tüm forex sembollerini alalım
            const res = await fetch(`${REST_URL}/forex/symbol?exchange=oanda&token=${API_KEY}`)

            if (!res.ok) {
                const errorText = await res.text()
                console.error('Finnhub /forex/symbol REST API hatası:', res.status, errorText);
                error.value = `Sembol listesi alınamadı: ${res.status} ${errorText}`
                return
            }

            const symbolsData = await res.json()

            if (symbolsData && Array.isArray(symbolsData)) {
                const symbolsToSubscribe = symbolsData.map((item: any) => item.symbol)

                symbolsData.forEach((item: any) => {
                    symbolDisplayMap.value[item.symbol] = item.displaySymbol;
                });

                if (ws.value && ws.value.readyState === WebSocket.OPEN) {
                    symbolsToSubscribe.slice(0, 50).forEach((symbol: string) => {
                        const msg = { type: 'subscribe', symbol: symbol }
                        ws.value?.send(JSON.stringify(msg))
                    })
                } else {
                    console.log('WebSocket bağlantısı henüz açık değil, sembollere abone olunamadı.');
                }
            } else {
                console.log('Finnhub /forex/symbol REST API\'den geçersiz veri formatı alındı:', symbolsData);
                error.value = 'Finnhub API\'den geçersiz sembol listesi alındı.'
            }

        } catch (err) {
            console.error('Forex sembol listesi alınırken hata oluştu:', err)
            error.value = 'Forex sembol listesi alınırken bir hata oluştu.'
        }
    }

    const disconnect = () => {
        if (ws.value) {
            console.log('WebSocket bağlantısı kapatılıyor...');
            ws.value.close(1000, 'Kullanıcı tarafından kapatıldı')
            ws.value = null
        }
    }

    onMounted(() => {
        connectWebSocket()
    })

    onUnmounted(() => {
        disconnect()
    })

    const forexDataArray = computed<ForexData[]>(() => {
        return Object.values(forexDataMap.value);
    });


    return {
        forexData: forexDataArray,
        isConnected,
        error,
        disconnect
    }
} 