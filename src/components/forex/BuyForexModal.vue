<template>
    <Dialog :visible="visible" header="Buy" :modal="true" :style="{ width: '50vw' }" :draggable="false"
        @show="initializeBuyVolumes" :closable="false" class="bg-white rounded-lg shadow-xl">
        <div class="p-6">
            <div v-for="pair in selectedPairs" :key="pair.pair" class="pair-volume-item flex items-center mb-4">
                <label :for="pair.pair" class="volume-label block text-sm font-medium text-gray-700 w-44 mr-4">
                    {{ pair.pair }} Volume:
                </label>
                <InputNumber v-model="buyVolumes[pair.pair]" :id="pair.pair" :min="0" :step="0.01"
                    class="volume-input mt-1 block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
            </div>
        </div>
        <template #footer>
            <div class="px-6 py-4 text-right">
                <Button label="Cancel" icon="pi pi-times" severity="info" @click="handleCancel"
                    class="p-button-text text-gray-700 hover:text-gray-900 mr-2" />
                <Button label="Buy" icon="pi pi-check" @click="buySelectedPairs" :disabled="!canBuy"
                    class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { ForexData } from '@/types'
import { useErrorStore } from '@/stores'

const props = defineProps({
    visible: { type: Boolean, required: true },
    selectedPairs: { type: Array as () => ForexData[], required: true }
})

const emit = defineEmits(['hide', 'buy'])
const errorStore = useErrorStore()
const buyVolumes = ref<Record<string, number>>({})

const canBuy = computed(() => {
    return props.selectedPairs.every(pair => {
        const volume = buyVolumes.value[pair.pair] || 0;
        return volume > 0;
    });
})

const handleCancel = () => {
    errorStore.clearErrors();
    emit('hide');
}

const buySelectedPairs = () => {
    if (!canBuy.value) {
        errorStore.clearErrors();
        errorStore.handleValidationError(
            'Please enter valid volume values for all selected pairs'
        );
        return;
    }

    const validVolumes = Object.entries(buyVolumes.value).reduce((acc, [pair, volume]) => {
        if (volume > 0) {
            acc[pair] = volume;
        }
        return acc;
    }, {} as Record<string, number>);

    errorStore.clearErrors();
    emit('buy', validVolumes);
    emit('hide');
    buyVolumes.value = {};
}

const initializeBuyVolumes = () => {
    errorStore.clearErrors();
    buyVolumes.value = {};
    props.selectedPairs.forEach(pair => {
        buyVolumes.value[pair.pair] = 0;
    });
}

watch(() => props.selectedPairs, (newPairs) => {
    const newBuyVolumes: Record<string, number> = {};
    newPairs.forEach(pair => {
        newBuyVolumes[pair.pair] = buyVolumes.value[pair.pair] || 0;
    });
    buyVolumes.value = newBuyVolumes;
}, { deep: true });

onUnmounted(() => {
    errorStore.clearErrors();
})
</script>
