<template>
    <DataTable :value="data" :class="tableClass || 'p-datatable-sm w-full'" :tableClass="dynamicTableClass"
        :scrollable="shouldBeScrollable" :scrollHeight="scrollHeight" :virtualScrollerOptions="virtualScrollOptions"
        :responsiveLayout="responsiveLayout || 'scroll'" :stripedRows="stripedRows" :selection="modelValue"
        :selectionMode="selectionMode || undefined" :dataKey="dataKey"
        @update:selection="$emit('update:modelValue', $event)">
        <Column v-if="selectionMode === 'multiple'" selectionMode="multiple" headerStyle="width: 3rem" />

        <!-- Dynamic Columns -->
        <Column v-for="column in columns" :key="column.field || column.header" :field="column.field"
            :header="column.header" :sortable="column.sortable" :headerStyle="column.headerStyle"
            :class="column.bodyClass || defaultColumnClass">
            <template #body="{ data: rowData, index }" v-if="column.type !== 'action'">
                <slot :name="`body-${column.field}`" :data="rowData" :index="index"
                    :value="getColumnValue(rowData, column)">
                    <span v-if="column.type === 'number'" :class="getNumberClass(rowData, column)">
                        {{ formatColumnValue(rowData, column) }}
                    </span>
                    <span v-else>
                        {{ getColumnValue(rowData, column) }}
                    </span>
                </slot>
            </template>
        </Column>

        <!-- Actions Column -->
        <Column v-if="actions && actions.length > 0" header="Actions" :headerStyle="actionsHeaderStyle"
            :class="defaultColumnClass">
            <template #body="{ data: rowData, index }">
                <slot name="actions" :data="rowData" :index="index">
                    <Button v-for="action in actions" :key="action.icon" :icon="action.icon" :severity="action.severity"
                        :class="action.class" :disabled="action.disabled ? action.disabled(rowData) : false"
                        @click="action.onClick(rowData, index)" />
                </slot>
            </template>
        </Column>

        <!-- Empty State -->
        <template #empty>
            <div class="text-center text-gray-500 bg-gray-50 py-6">
                <slot name="empty">
                    {{ getEmptyMessage() }}
                </slot>
            </div>
        </template>
    </DataTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn, TableProps, TableAction, TableEmptyState } from '@/types'

const props = withDefaults(defineProps<TableProps & {
    modelValue?: any[]
    formatNumber?: (value: number, decimals?: number, suffix?: string) => string
    getChangeColorClass?: (value: number) => string
}>(), {
    loading: false,
    selectionMode: null,
    scrollable: false,
    virtualScroll: false,
    stripedRows: false,
    responsiveLayout: 'scroll',
    emptyStates: () => []
})

const emit = defineEmits<{
    'update:modelValue': [value: any[]]
}>()

const defaultColumnClass = 'px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'

const dynamicTableClass = computed(() => {
    return 'min-w-full divide-y divide-gray-200'
})

const shouldBeScrollable = computed(() => {
    return props.scrollable || props.data.length > 8
})

const virtualScrollOptions = computed(() => {
    return props.virtualScroll && props.data.length > 20 ? { itemSize: 30 } : undefined
})

const actionsHeaderStyle = computed(() => {
    return 'width: 10%'
})

const getColumnValue = (rowData: any, column: TableColumn) => {
    if (!column.field) return ''
    return rowData[column.field]
}

const formatColumnValue = (rowData: any, column: TableColumn) => {
    const value = getColumnValue(rowData, column)

    if (column.format && props.formatNumber) {
        const { decimals = 2, suffix = '', isPercentage = false } = column.format
        return props.formatNumber(value, decimals, isPercentage ? '%' : suffix)
    }

    return value
}

const getNumberClass = (rowData: any, column: TableColumn) => {
    if (column.format?.isPercentage && props.getChangeColorClass) {
        const value = getColumnValue(rowData, column)
        return props.getChangeColorClass(value)
    }
    return ''
}

const getEmptyMessage = () => {
    if (props.emptyStates.length > 0) {
        for (const state of props.emptyStates) {
            if (!state.condition || state.condition()) {
                return state.message
            }
        }
    }
    return 'No records found'
}
</script>