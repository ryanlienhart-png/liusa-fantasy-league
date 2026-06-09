import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { initAuth, currentUser } from './store/auth.js'
import { initGlobalData } from './store/globalData.js'
import { initLeaguesForUser } from './store/leagues.js'
import { initStore } from './store/game.js'
import { ensureMainLeaguesSeeded } from './utils/bootstrap.js'
import { isFirebaseConfigured } from './firebase.js'

const app = createApp(App)
app.use(router)

let stopLeagues = () => {}

async function bootstrap() {
  await Promise.all([initAuth(), initGlobalData(), initStore()])
  if (isFirebaseConfigured) await ensureMainLeaguesSeeded()
  app.mount('#app')

  watch(currentUser, (user) => {
    stopLeagues()
    stopLeagues = user ? initLeaguesForUser(user.uid) : () => {}
  }, { immediate: true })
}

bootstrap()
