import { defineConfig } from 'vite';
import webcomsPlugin from 'vite-webcom-plugin';

export default defineConfig({
    plugins: [webcomsPlugin()] // 添加插件
});