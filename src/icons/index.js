import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'

// 全局注册 svg-icon 组件
Vue.component('svg-icon', SvgIcon)

// 自动导入所有 svg 图标
const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req) 