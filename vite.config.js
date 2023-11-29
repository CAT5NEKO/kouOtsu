import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import {viteStaticCopy} from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins : [
    vue(), viteStaticCopy({
      targets : [ {src : "./node_modules/pdfjs-dist/cmaps/", dest : "assets"} ]
    })
  ],
  resolve : {alias : {'@' : fileURLToPath(new URL('./src', import.meta.url))}}
})
