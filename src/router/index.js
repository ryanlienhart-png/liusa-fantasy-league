import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView       from '../views/HomeView.vue'
import IslandersView  from '../views/IslandersView.vue'
import ManagersView   from '../views/ManagersView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import RulesView      from '../views/RulesView.vue'
import AdminView      from '../views/AdminView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',            component: HomeView        },
    { path: '/islanders',   component: IslandersView   },
    { path: '/managers',    component: ManagersView    },
    { path: '/leaderboard', component: LeaderboardView },
    { path: '/rules',       component: RulesView       },
    { path: '/admin',       component: AdminView       },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
