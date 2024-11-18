import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss'
import '@/permission'

// 注册 SvgIcon 组件
import SvgIcon from '@/components/SvgIcon'
Vue.component('svg-icon', SvgIcon)

// 自动导入所有 svg 图标
const req = require.context('./icons/svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

Vue.use(ElementUI)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}) 