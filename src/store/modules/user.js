const state = {
  userInfo: {
    id: '', // 用户ID
    name: '', // 用户姓名
    phone: '', // 电话
    email: '', // 邮箱
    department: '', // 部门
    role: '' // 角色
  }
}

const mutations = {
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  // 获取用户信息
  getUserInfo({ commit }) {
    return new Promise((resolve, reject) => {
      // 这里调用获取用户信息的API
      // 示例：
      const mockUserInfo = {
        id: 'U001',
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        department: 'IT部',
        role: 'user'
      }
      commit('SET_USER_INFO', mockUserInfo)
      resolve(mockUserInfo)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 