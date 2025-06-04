
import PrimeVue from 'primevue/config';
// Eğer @primeuix/themes paketini kullanıyorsanız bu satır doğrudur.
// PrimeVue'nun resmi tema paket adı genellikle @primevue/themes olur.
// package.json dosyanızdan kontrol etmeniz iyi olur. Şimdilik sizin belirttiğiniz gibi bırakıyorum:
import Aura from '@primeuix/themes/aura'; // Bu satır Aura objesini import eder

import 'primeicons/primeicons.css'; // PrimeIcons CSS'i

// Bileşen importlarınız doğru
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
                preset: Aura, // Hata burada idi: Aura bir obje olduğu için () ile çağrılmaz.
                options: {
                    // prefix: 'p', // İsteğe bağlı: CSS değişkenleri için önek (varsayılan 'p')
                    // cssLayer: false, // İsteğe bağlı: CSS katmanları

                    // AÇIK TEMAYI ZORLAMAK İÇİN:
                    // darkModeSelector varsayılan olarak 'system'dir (işletim sistemi tercihini kullanır).
                    // Eğer işletim sisteminiz koyu modda ise tema da koyu olur.
                    // Açık temayı garantilemek için, <html> etiketinizde olmayan bir sınıf adı verin.
                    // Böylece PrimeVue koyu mod koşulunun karşılanmadığını anlar ve açık temayı kullanır.
                    darkModeSelector: '.never-gonna-be-dark-mode' // Örneğin, bu sınıfı <html> etiketine eklemediğiniz sürece açık tema çalışır.
                    // Ya da sisteminiz zaten açık moddaysa, bu satırı silebilirsiniz (varsayılan 'system' kullanılır).
                }
            },
            ripple: true // Ripple efekti
        });

        // Bileşenlerin global kaydı doğru
        app.component('DataTable', DataTable);
        app.component('Column', Column);
        app.component('Button', Button);
        app.component('Dialog', Dialog);
        app.component('InputNumber', InputNumber);
        app.component('Menubar', Menubar);
    }
};

export default PrimeVuePlugin; 