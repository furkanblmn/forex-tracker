import { ref, watch, type Ref } from 'vue'
import type { StorageOptions } from '@/types'

export const useLocalStorage = <T>(key: string, defaultValue?: T, options?: StorageOptions) => {
    const serializer = options?.serializer || {
        read: (v: string) => {
            try {
                return JSON.parse(v)
            } catch {
                return v
            }
        },
        write: (v: any) => JSON.stringify(v)
    }

    const storedValue = localStorage.getItem(key)
    const initialValue = storedValue !== null
        ? serializer.read(storedValue)
        : (defaultValue ?? null)

    const data: Ref<T> = ref(initialValue)

    // Watch for changes and save to localStorage
    watch(data, (newValue) => {
        if (newValue === null || newValue === undefined) {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, serializer.write(newValue))
        }
    }, { deep: true })

    // Listen for storage changes from other tabs
    if (options?.syncAcrossTabs) {
        window.addEventListener('storage', (e) => {
            if (e.key === key && e.newValue !== null) {
                data.value = serializer.read(e.newValue)
            }
        })
    }

    const remove = () => {
        localStorage.removeItem(key)
        data.value = defaultValue ?? null as T
    }

    const clear = () => {
        data.value = defaultValue ?? null as T
    }

    return {
        data,
        remove,
        clear
    }
} 