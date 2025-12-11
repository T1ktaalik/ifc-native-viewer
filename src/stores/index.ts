import { createPinia } from 'pinia'
import type { App } from 'vue'

export const store = createPinia()

export function setupStore(app: App) {
  app.use(store)
}

export * from './models'
export * from './settings'
export * from './components'