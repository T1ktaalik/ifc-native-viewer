import { createRouter, createWebHistory } from 'vue-router'
import TheViewer from '../components/TheViewer.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TheViewer
  },
  // Redirect any unknown routes to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router