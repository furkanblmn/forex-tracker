<template>
    <div class="tracker-container p-4 md:p-6 bg-white rounded-lg shadow">
        <div class="header-row flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-800">Forex Pairs Tracker</h1>
            <Button label="Buy" icon="pi pi-shopping-cart"
                @click="transactionStore.openBuyModal(forexStore.selectedPairs)"
                :disabled="forexStore.selectedPairs.length === 0"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center" />
        </div>

        <div v-if="forexStore.error" class="error-message mb-4 bg-red-500 text-white p-4 rounded">
            {{ forexStore.error }}
        </div>

        <DataTable v-model:selection="forexStore.selectedPairs" :value="forexStore.forexData" stripedRows
            selectionMode="multiple" dataKey="pair" class="p-datatable-sm w-full"
            tableClass="min-w-full divide-y divide-gray-200" :scrollable="forexStore.forexData.length > 8"
            :scrollHeight="dynamicScrollHeight"
            :virtualScrollerOptions="forexStore.forexData.length > 20 ? { itemSize: 46 } : undefined"
            responsiveLayout="scroll">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="pair" header="Pair" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></Column>
            <Column field="price" header="Price" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data }">
                    {{ formatNumber(data.price, 5) }}
                </template>
            </Column>
            <Column field="change" header="Change" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data }">
                    <span :class="getChangeColorClass(data.change)">
                        {{ formatNumber(data.change, 3, '%') }}
                    </span>
                </template>
            </Column>
            <Column field="volume" header="Volume" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></Column>
            <Column field="lastUpdate" header="Last Update" sortable headerStyle="width: 20%"
                class="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <template #body="{ data }">
                    {{ data.lastUpdate }}
                </template>
            </Column>
            <template #empty>
                <div class="text-center text-gray-500" style="padding: 48px 0;">
                    <span v-if="!forexStore.isConnected">Connecting...</span>
                    <span v-else-if="forexStore.forexData.length === 0">Loading data...</span>
                    <span v-else>No records found</span>
                </div>
            </template>
        </DataTable>

        <BuyForexModal :visible="transactionStore.isBuyModalOpen" :selectedPairs="forexStore.selectedPairs"
            @hide="transactionStore.closeBuyModal()" @buy="handleBuyPairs" />
    </div>
</template>

<script setup lang="ts">
import { useForexStore, useTransactionStore } from '@/stores'
import { useCommon } from '@/composables/useCommon'
import type { ForexData } from '@/services/websocket-service'
import BuyForexModal from '@/components/forex/BuyForexModal.vue'

const forexStore = useForexStore()
const transactionStore = useTransactionStore()
const { useDynamicScrollHeight, formatNumber, getChangeColorClass } = useCommon()

const dynamicScrollHeight = useDynamicScrollHeight(() => forexStore.forexData.length)

const handleBuyPairs = (volumes: Record<string, number>) => {
    forexStore.selectedPairs.forEach((pair: ForexData) => {
        const volume = volumes[pair.pair] || 0;
        if (volume > 0) {
            transactionStore.executeBuy(pair, volume);
        }
    });
    forexStore.selectedPairs = [];
}
</script>

<style scoped>
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.text-success {
    color: var(--success-color);
}

.text-danger {
    color: var(--danger-color);
}
</style>