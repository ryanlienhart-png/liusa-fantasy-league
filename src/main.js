import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { initStore } from './store/game.js'

const app = createApp(App)
app.use(router)

initStore().then(() => app.mount('#app'))
