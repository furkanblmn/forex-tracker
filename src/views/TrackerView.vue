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

        <DynamicDataTable v-model="forexStore.selectedPairs" :data="forexStore.forexData" :columns="tableColumns"
            :scrollHeight="dynamicScrollHeight" :virtualScroll="true" :stripedRows="true" selectionMode="multiple"
            dataKey="pair" :emptyStates="emptyStates" :formatNumber="formatNumber"
            :getChangeColorClass="getChangeColorClass">
            <template #body-change="{ value, data }">
                <span :class="getChangeColorClass(data.change)">
                    {{ formatNumber(value, 3, '%') }}
                </span>
            </template>
        </DynamicDataTable>

        <BuyForexModal :visible="transactionStore.isBuyModalOpen" :selectedPairs="forexStore.selectedPairs"
            @hide="transactionStore.closeBuyModal()" @buy="handleBuyPairs" @remove-pair="handleRemovePair" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForexStore, useTransactionStore } from '@/stores'
import { useCommon } from '@/composables/useCommon'
import type { ForexData } from '@/types'
import type { TableColumn, TableEmptyState } from '@/types'
import BuyForexModal from '@/components/forex/BuyForexModal.vue'
import DynamicDataTable from '@/components/tables/DynamicDataTable.vue'

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

const handleRemovePair = (pair: ForexData) => {
    forexStore.selectedPairs = forexStore.selectedPairs.filter((p: ForexData) => p.pair !== pair.pair);
}

const tableColumns = computed<TableColumn[]>(() => [
    {
        field: 'pair',
        header: 'Pair',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'text'
    },
    {
        field: 'price',
        header: 'Price',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'number',
        format: {
            decimals: 5
        }
    },
    {
        field: 'change',
        header: 'Change',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'number',
        format: {
            decimals: 3,
            isPercentage: true
        }
    },
    {
        field: 'volume',
        header: 'Volume',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'text'
    },
    {
        field: 'lastUpdate',
        header: 'Last Update',
        sortable: true,
        headerStyle: 'width: 20%',
        type: 'text'
    }
])

const emptyStates = computed<TableEmptyState[]>(() => [
    {
        message: 'Connecting...',
        condition: () => !forexStore.isConnected
    },
    {
        message: 'Loading data...',
        condition: () => forexStore.isConnected && forexStore.forexData.length === 0
    },
    {
        message: 'No records found',
        condition: () => forexStore.isConnected && forexStore.forexData.length > 0
    }
])
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