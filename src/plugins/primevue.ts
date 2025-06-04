import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Menubar from 'primevue/menubar';

const PrimeVuePlugin = {
    install: (app: any) => {
        app.use(PrimeVue, {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.never-gonna-be-dark-mode'
                }
            },
            ripple: true
        });

        app.component('DataTable', DataTable);
        app.component('Column', Column);
        app.component('Button', Button);
        app.component('Dialog', Dialog);
        app.component('InputNumber', InputNumber);
        app.component('Menubar', Menubar);
    }
};

export default PrimeVuePlugin; 