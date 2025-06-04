export interface TableColumn {
    field?: string
    header: string
    sortable?: boolean
    headerStyle?: string
    bodyClass?: string
    type?: 'text' | 'number' | 'action' | 'selection' | 'custom'
    format?: {
        decimals?: number
        suffix?: string
        isPercentage?: boolean
    }
    width?: string
}

export interface TableEmptyState {
    message: string
    condition?: () => boolean
}

export interface TableAction {
    icon: string
    severity?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
    class?: string
    onClick: (data: any, index: number) => void
    disabled?: (data: any) => boolean
}

export interface TableProps {
    data: any[]
    columns: TableColumn[]
    loading?: boolean
    selectionMode?: 'single' | 'multiple' | null
    selectedItems?: any[]
    dataKey?: string
    scrollable?: boolean
    virtualScroll?: boolean
    scrollHeight?: string
    emptyStates?: TableEmptyState[]
    stripedRows?: boolean
    responsiveLayout?: string
    tableClass?: string
    actions?: TableAction[]
} 