import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Jika Controller mengirim 'Auth/...' ubah paksa jadi 'auth/...' 
        // karena Anda ingin folder tetap bernama 'auth' (kecil)
        const adjustedName = name.replace(/^Auth\//, 'auth/');

        return resolvePageComponent(
            `./Pages/${adjustedName}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});