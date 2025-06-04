import { ref, onMounted, onBeforeUnmount } from 'vue'

const API_KEY = 'YOUR_FINNHUB_API_KEY'
const ws = ref<WebSocket | null>(null)

const useFinnhub = () => {
    const forexData = ref<Record<string, any>>({})

    const connectWebSocket = () => {
        ws.value = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`)

        ws.value.onmessage = (event) => {
            const { data } = JSON.parse(event.data)
            if (data) {
                data.forEach((item: any) => {
                    forexData.value[item.s] = item
                })
            }
        }

        ws.value.onclose = () => {
            setTimeout(connectWebSocket, 3000)
        }
    }

    const subscribeToAllPairs = async () => {
        const res = await fetch(`https://finnhub.io/api/v1/forex/symbol?exchange=oanda&token=${API_KEY}`)
        const symbols = await res.json()

        symbols.slice(0, 50).forEach((pair: any) => {
            const msg = { type: 'subscribe', symbol: pair.symbol }
            ws.value?.send(JSON.stringify(msg))
        })
    }

    onMounted(async () => {
        connectWebSocket()
        await subscribeToAllPairs()
    })

    onBeforeUnmount(() => {
        ws.value?.close()
    })

    return {
        forexData
    }
}

export default useFinnhub
