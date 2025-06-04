export interface StorageOptions {
    serializer?: {
        read: (value: string) => any
        write: (value: any) => string
    }
    defaultValue?: any
    syncAcrossTabs?: boolean
} 