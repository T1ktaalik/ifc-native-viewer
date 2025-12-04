import { createRouter, createWebHistory } from 'vue-router'
import TheFirstComponent from '../components/TheFirstComponent.vue'
import TheFragmentViewer from '../components/TheFragmentViewer.vue'
import TheIfcViewer from '../components/TheIfcViewer.vue'
import TheIfcToFragConverter from '../components/TheIfcToFragConverter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TheFirstComponent
  },
  {
    path: '/fragment-viewer',
    name: 'FragmentViewer',
    component: TheFragmentViewer
  },
  {
    path: '/ifc-viewer',
    name: 'IfcViewer',
    component: TheIfcViewer
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