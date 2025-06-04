import { createRouter, createWebHistory } from 'vue-router'
import TrackerView from '@/views/TrackerView.vue'
import MyAssetsView from '@/views/MyAssetsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/tracker'
        },
        {
            path: '/tracker',
            name: 'tracker',
            component: TrackerView
        },
        {
            path: '/my-assets',
            name: 'my-assets',
            component: MyAssetsView
        }
    ]
})

export default router 