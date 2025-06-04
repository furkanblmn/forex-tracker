<template>
    <div class="assets-container p-4 md:p-6 bg-white rounded-lg shadow">
        <ErrorDisplay />
        <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center mb-6 w-full gap-4">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-800">My Assets</h1>
            <Button severity="info" label="Export CSV" icon="pi pi-download" @click="exportStore.exportToCSV"
                :disabled="!portfolioStore.portfolio.length"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center" />
        </div>

        <DataTable :value="portfolioStore.portfolio" class="p-datatable-sm w-full"
            tableClass="min-w-full divide-y divide-gray-200" :scrollable="portfolioStore.portfolio.length > 8"
            :scrollHeight="dynamicScrollHeight"
            :virtualScrollerOptions="portfolioStore.portfolio.length > 20 ? { itemSize: 46 } : undefined"
            responsiveLayout="scroll">
            <Column field="pair" header="Pair" sortable headerStyle="width: 25%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></Column>
            <Column field="price" header="Price" sortable headerStyle="width: 25%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data }">
                    {{ formatNumber(data.price, 5) }}
                </template>
            </Column>
            <Column field="volume" header="Volume" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></Column>
            <Column header="Total Value" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data }">
                    {{ formatNumber(data.price * data.volume, 2) }}
                </template>
            </Column>
            <Column header="Actions" headerStyle="width: 10%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data, index }">
                    <Button icon="pi pi-trash" class="p-button-danger p-button-text text-red-600 hover:text-red-800"
                        severity="danger" @click="portfolioStore.removeFromPortfolio(index)" />
                </template>
            </Column>
            <template #empty>
                <div class="text-center text-gray-500 bg-gray-50 py-6">
                    No records found
                </div>
            </template>
        </DataTable>

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

const portfolioStore = usePortfolioStore()
const exportStore = useExportStore()
const { useDynamicScrollHeight, formatNumber, calculateTotalValue } = useCommon()

const dynamicScrollHeight = useDynamicScrollHeight(() => portfolioStore.portfolio.length)

const totalValue = computed(() => {
    return calculateTotalValue(portfolioStore.portfolio)
})
</script>