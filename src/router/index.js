import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/abCompartmentViewers'),
      meta: { title: 'abViewers', icon: 'dashboard' }
    }]
  },
  {
    path: '/tadViewers',
    component: Layout,
    redirect: '/tadViewers',
    children: [{
      path: 'tadViewers',
      name: 'tadViewers',
      component: () => import('@/views/tadViewers'),
      meta: { title: 'tadViewers', icon: 'dashboard' }
    }]
  },
  {
    path: '/compositionViewers',
    component: Layout,
    redirect: '/compositionViewers',
    children: [{
      path: 'compositionViewers',
      name: 'compositionViewers',
      component: () => import('@/views/compositionViewers'),
      meta: { title: 'compositionViewers', icon: 'dashboard' }
    }]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
