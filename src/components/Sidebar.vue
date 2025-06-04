<template>
    <div class="sidebar-container w-64 lg:w-64 md:w-56 sm:w-48 bg-gray-800 text-white flex flex-col p-4 h-screen">
        <div class="logo mb-8 text-center">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-800">Forex Tracker</h1>
        </div>
        <nav class="flex-grow">
            <ul class="menu-list space-y-2">
                <li>
                    <router-link to="/tracker"
                        class="menu-item flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                        active-class="active bg-gray-700 text-white">
                        <i class="pi pi-chart-line mr-3"></i>
                        <span class="hidden sm:inline">Tracker</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/my-assets"
                        class="menu-item flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200"
                        active-class="active bg-gray-700 text-white">
                        <i class="pi pi-wallet mr-3"></i>
                        <span class="hidden sm:inline">My Assets</span>
                    </router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>
