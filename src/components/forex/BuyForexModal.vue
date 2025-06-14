<template>
    <Dialog :visible="visible" header="Buy" :modal="true" :style="{ width: '50vw' }" :draggable="false"
        @show="initializeBuyVolumes" :closable="false" class="bg-white rounded-lg shadow-xl">
        <div class="px-6">
            <div v-for="pair in selectedPairs" :key="pair.pair" class="pair-volume-item flex items-center mb-4">
                <label :for="pair.pair" class="volume-label block text-sm font-medium text-gray-700 w-44 mr-4">
                    {{ pair.pair }} Volume:
                </label>
                <div class="flex items-center flex-1 gap-2">
                    <InputNumber v-model="buyVolumes[pair.pair]" :id="pair.pair" :min="0" :step="0.01"
                        class="volume-input flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <Button v-show="selectedPairs.length > 1" icon="pi pi-times" severity="danger" size="small"
                        class="p-button-text p-button-sm text-red-600 hover:text-red-800 min-w-[2rem]"
                        @click="removePair(pair)" v-tooltip="'Remove pair'" />
                </div>
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

const emit = defineEmits(['hide', 'buy', 'remove-pair'])
const errorStore = useErrorStore()
const buyVolumes = ref<Record<string, number>>({})

const canBuy = computed(() => {
    return props.selectedPairs.length > 0 && props.selectedPairs.every(pair => {
        const volume = buyVolumes.value[pair.pair] || 0;
        return volume > 0;
    });
})

const handleCancel = () => {
    errorStore.clearErrors();
    emit('hide');
}

const removePair = (pairToRemove: ForexData) => {
    // Remove from buyVolumes
    delete buyVolumes.value[pairToRemove.pair];

    // Emit event to parent to update selectedPairs
    emit('remove-pair', pairToRemove);

    // Clear any existing errors
    errorStore.clearErrors();
}

const buySelectedPairs = () => {
    if (!canBuy.value) {
        errorStore.clearErrors();
        if (props.selectedPairs.length === 0) {
            errorStore.handleValidationError('No pairs selected for purchase');
        } else {
            errorStore.handleValidationError(
                'Please enter valid volume values for all selected pairs'
            );
        }
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
