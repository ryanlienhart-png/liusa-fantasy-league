import { createRouter, createWebHashHistory } from 'vue-router'
import { authReady, currentUser, isGlobalAdmin, isSignedIn } from '../store/auth.js'

import HomeView from '../views/HomeView.vue'
import IslandersView from '../views/IslandersView.vue'
import RulesView from '../views/RulesView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import MyLeaguesView from '../views/MyLeaguesView.vue'
import CreateLeagueView from '../views/CreateLeagueView.vue'
import JoinLeagueView from '../views/JoinLeagueView.vue'
import LeagueView from '../views/LeagueView.vue'
import LeagueDashboardView from '../views/LeagueDashboardView.vue'
import LeaguePicksView from '../views/LeaguePicksView.vue'
import LeagueLeaderboardView from '../views/LeagueLeaderboardView.vue'
import LeagueSettingsView from '../views/LeagueSettingsView.vue'
import GlobalAdminView from '../views/GlobalAdminView.vue'
import AdminView from '../views/AdminView.vue'
import ManagersView from '../views/ManagersView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/islanders', component: IslandersView },
    { path: '/managers', component: ManagersView },
    { path: '/leaderboard', component: LeaderboardView },
    { path: '/rules', component: RulesView },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/signup', component: SignUpView, meta: { guest: true } },
    {
      path: '/leagues',
      component: MyLeaguesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/leagues/create',
      component: CreateLeagueView,
      meta: { requiresAuth: true },
    },
    {
      path: '/leagues/join',
      component: JoinLeagueView,
      meta: { requiresAuth: true },
    },
    {
      path: '/leagues/:leagueId',
      component: LeagueView,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: LeagueDashboardView },
        { path: 'picks', component: LeaguePicksView },
        { path: 'leaderboard', component: LeagueLeaderboardView },
      ],
    },
    {
      path: '/leagues/:leagueId/settings',
      component: LeagueSettingsView,
      meta: { requiresAuth: true, requiresHost: true },
    },
    {
      path: '/admin',
      component: GlobalAdminView,
      meta: { requiresAuth: true, requiresGlobalAdmin: true },
    },
    {
      path: '/admin/commissioner',
      component: AdminView,
      meta: { requiresAuth: true, requiresGlobalAdmin: true },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  if (!authReady.value) {
    await new Promise((resolve) => {
      const stop = setInterval(() => {
        if (authReady.value) { clearInterval(stop); resolve() }
      }, 50)
    })
  }

  if (to.meta.requiresAuth && !isSignedIn.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && isSignedIn.value) {
    return { path: '/leagues' }
  }

  if (to.meta.requiresGlobalAdmin && !isGlobalAdmin.value) {
    return { path: '/' }
  }

  if (to.meta.requiresHost) {
    // Host check happens in view; league may not be loaded yet
  }

  return true
})

export default router
