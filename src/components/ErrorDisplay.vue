<template>
    <div v-if="hasErrors" class="error-container fixed top-4 right-4 z-50 max-w-md space-y-2">
        <div v-for="error in errors" :key="error.id" :class="getErrorClasses(error.type)"
            class="p-4 rounded-lg shadow-lg border-l-4 relative">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i :class="getErrorIcon(error.type)" class="text-lg"></i>
                </div>
                <div class="ml-3 flex-1">
                    <h4 class="text-sm font-medium">
                        {{ getErrorTitle(error.type) }}
                    </h4>
                    <p class="text-sm mt-1">
                        {{ error.message }}
                    </p>
                    <p v-if="error.details" class="text-xs mt-1 opacity-75">
                        {{ error.details }}
                    </p>
                    <p v-if="error.source" class="text-xs mt-1 opacity-60">
                        Source: {{ error.source }}
                    </p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button @click="removeError(error.id)"
                        class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useErrorStore } from '@/stores'

const errorStore = useErrorStore()

const errors = computed(() => errorStore.errors)
const hasErrors = computed(() => errorStore.hasErrors)

const removeError = (errorId: string) => {
    errorStore.removeError(errorId)
}

const getErrorClasses = (type: string) => {
    const baseClasses = 'bg-white border-solid'
    switch (type) {
        case 'network':
            return `${baseClasses} border-orange-500 text-orange-800`
        case 'validation':
            return `${baseClasses} border-yellow-500 text-yellow-800`
        case 'websocket':
            return `${baseClasses} border-red-500 text-red-800`
        case 'rate_limit':
            return `${baseClasses} border-purple-500 text-purple-800`
        case 'general':
        default:
            return `${baseClasses} border-red-500 text-red-800`
    }
}

const getErrorIcon = (type: string) => {
    switch (type) {
        case 'network':
            return 'pi pi-wifi text-orange-500'
        case 'validation':
            return 'pi pi-exclamation-triangle text-yellow-500'
        case 'websocket':
            return 'pi pi-times-circle text-red-500'
        case 'rate_limit':
            return 'pi pi-clock text-purple-500'
        case 'general':
        default:
            return 'pi pi-exclamation-circle text-red-500'
    }
}

const getErrorTitle = (type: string) => {
    switch (type) {
        case 'network':
            return 'Network Error'
        case 'validation':
            return 'Validation Error'
        case 'websocket':
            return 'Connection Error'
        case 'rate_limit':
            return 'Rate Limit Error'
        case 'general':
        default:
            return 'System Error'
    }
}
</script>

<style scoped>
.error-container {
    animation: slideIn 0.3s ease-out;
    z-index: 10100;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.error-container>div {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>