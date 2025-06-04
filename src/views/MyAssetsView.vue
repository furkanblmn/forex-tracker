<template>
    <div class="assets-container p-4 md:p-6 bg-white rounded-lg shadow">
        <ErrorDisplay />
        <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center mb-6 w-full gap-4">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-800">My Assets</h1>
            <Button severity="info" label="Export CSV" icon="pi pi-download" @click="exportStore.exportToCSV"
                :disabled="!portfolioStore.portfolio.length"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center" />
        </div>

        <DynamicDataTable :data="portfolioStore.portfolio" :columns="tableColumns" :actions="tableActions"
            :scrollHeight="dynamicScrollHeight" :virtualScroll="true" :formatNumber="formatNumber">
            <template #body-price="{ value }">
                {{ formatNumber(value, 5) }}
            </template>

            <template #body-total_value="{ data }">
                {{ formatNumber(data.price * data.volume, 2) }}
            </template>
        </DynamicDataTable>

        <div class="mt-6 p-4 bg-gray-100 rounded-lg" v-if="portfolioStore.portfolio.length">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">Portfolio Summary</h2>
            <p class="text-lg text-gray-700">
                Total Portfolio Value: <span class="font-bold">{{ formatNumber(totalValue, 2) }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore, useExportStore } from '@/stores'
import { useCommon } from '@/composables/useCommon'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import DynamicDataTable from '@/components/tables/DynamicDataTable.vue'
import type { TableColumn, TableAction } from '@/types'

const portfolioStore = usePortfolioStore()
const exportStore = useExportStore()
const { useDynamicScrollHeight, formatNumber, calculateTotalValue } = useCommon()

const dynamicScrollHeight = useDynamicScrollHeight(() => portfolioStore.portfolio.length)

const totalValue = computed(() => {
    return calculateTotalValue(portfolioStore.portfolio)
})

const tableColumns = computed<TableColumn[]>(() => [
    {
        field: 'pair',
        header: 'Pair',
        sortable: true,
        headerStyle: 'width: 25%',
        type: 'text'
    },
    {
        field: 'price',
        header: 'Price',
        sortable: true,
        headerStyle: 'width: 25%',
        type: 'number'
    },
    {
        field: 'volume',
        header: 'Volume',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'text'
    },
    {
        field: 'total_value',
        header: 'Total Value',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'custom'
    }
])

const tableActions = computed<TableAction[]>(() => [
    {
        icon: 'pi pi-trash',
        severity: 'danger',
        class: 'p-button-danger p-button-text text-red-600 hover:text-red-800',
        onClick: (data: any, index: number) => {
            portfolioStore.removeFromPortfolio(index)
        }
    }
])
</script>