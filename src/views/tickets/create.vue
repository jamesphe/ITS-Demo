<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>创建工单</span>
      </div>
      
      <el-form ref="ticketForm" :model="ticketForm" :rules="rules" label-width="120px">
        <el-form-item label="工单来源" prop="source">
          <el-select v-model="ticketForm.source" placeholder="请选择来源系统">
            <el-option label="电话系统" value="phone"/>
            <el-option label="邮件系统" value="email"/>
            <el-option label="企业微信" value="wechat"/>
            <el-option label="手动创建" value="manual"/>
          </el-select>
        </el-form-item>

        <el-form-item label="服务目录" prop="serviceCategory">
          <el-cascader
            v-model="ticketForm.serviceCategory"
            :options="serviceCatalog"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="请选择服务目录"
          />
        </el-form-item>

        <el-form-item label="工单类型" prop="type">
          <el-select v-model="ticketForm.type" placeholder="请选择工单类型">
            <el-option label="网络故障" value="network"/>
            <el-option label="系统维护" value="system"/>
            <el-option label="软件安装" value="software"/>
            <el-option label="其他" value="other"/>
          </el-select>
        </el-form-item>

        <el-form-item label="工单标题" prop="title">
          <el-input v-model="ticketForm.title" placeholder="请输入工单标题"/>
        </el-form-item>

        <el-form-item label="提交人" prop="submitter">
          <el-input v-model="ticketForm.submitter" placeholder="系统自动获取" :disabled="true"/>
        </el-form-item>

        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="ticketForm.contact" placeholder="系统自动获取" :disabled="true"/>
        </el-form-item>

        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="ticketForm.description"
            type="textarea"
            :rows="5"
            placeholder="请输入问题描述"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交工单</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TicketCreate',
  data() {
    return {
      ticketForm: {
        source: 'manual',
        serviceCategory: [],
        type: '',
        title: '',
        submitter: '张三', // 模拟自动获取的用户信息
        contact: '13800138000', // 模拟自动获取的联系方式
        description: ''
      },
      rules: {
        source: [{ required: true, message: '请选择工单来源', trigger: 'change' }],
        serviceCategory: [{ required: true, message: '请选择服务目录', trigger: 'change' }],
        type: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
        description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
      },
      // 模拟服务目录数据
      serviceCatalog: [
        {
          value: 'network',
          label: '网络服务',
          children: [
            { value: 'network-repair', label: '网络报修' },
            { value: 'network-config', label: '网络配置' }
          ]
        },
        {
          value: 'system',
          label: '系统服务',
          children: [
            { value: 'system-maintain', label: '系统维护' },
            { value: 'system-upgrade', label: '系统升级' }
          ]
        },
        {
          value: 'software',
          label: '软件服务',
          children: [
            { value: 'software-install', label: '软件安装' },
            { value: 'software-update', label: '软件更新' }
          ]
        }
      ]
    }
  },
  created() {
    // 模拟从URL参数获取自动创建的来源
    const source = this.$route.query.source
    if (source) {
      this.ticketForm.source = source
      // 这里可以根据来源系统获取相关信息
      this.getSourceInfo(source)
    }
  },
  methods: {
    getSourceInfo(source) {
      // 模拟从不同来源系统获取信息
      const sourceInfo = {
        phone: { submitter: '李四', contact: '10086', title: '电��工单' },
        email: { submitter: '王五', contact: 'wangwu@example.com', title: '邮件工单' },
        wechat: { submitter: '赵六', contact: 'zhaoliu', title: '微信工单' }
      }
      if (sourceInfo[source]) {
        const info = sourceInfo[source]
        this.ticketForm.submitter = info.submitter
        this.ticketForm.contact = info.contact
        this.ticketForm.title = info.title
      }
    },
    submitForm() {
      this.$refs.ticketForm.validate(valid => {
        if (valid) {
          this.$message.success('工单创建成功')
          this.$router.push('/tickets/list')
        }
      })
    },
    resetForm() {
      this.$refs.ticketForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin: 20px;
  .el-cascader {
    width: 100%;
  }
}
</style> 