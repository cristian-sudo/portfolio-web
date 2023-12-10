import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

// eslint-disable-next-line no-unused-vars
export default defineConfig(({ command, mode }) => {
    // eslint-disable-next-line no-undef
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            laravel({
                refresh: true,
                input: [
                    'resources/css/site.css',
                    'resources/js/site.js',
                ]
            })
        ],
        server: {
            open: env.APP_URL
        }
    };
});