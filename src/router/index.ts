import { createRouter, createWebHistory } from 'vue-router'
import TheFirstComponent from '../components/TheFirstComponent.vue'
import TheIfcToFragConverter from '../components/TheIfcToFragConverter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TheFirstComponent
  },
  {
    path: '/ifc-to-frag-converter',
    name: 'IfcToFragConverter',
    component: TheIfcToFragConverter
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router