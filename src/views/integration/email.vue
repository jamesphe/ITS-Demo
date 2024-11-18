<template>
  <div class="email-integration">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>邮件服务器配置</span>
          </div>
          <el-form :model="emailConfig" label-width="100px">
            <el-form-item label="服务器地址">
              <el-input v-model="emailConfig.server" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input v-model="emailConfig.port" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="emailConfig.username" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存配置</el-button>
              <el-button @click="handleTest">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>邮件文件夹</span>
          </div>
          <el-tree
            :data="folderTree"
            :props="defaultProps"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { emailConfig } from '@/mock'

export default {
  name: 'EmailIntegration',
  data() {
    return {
      emailConfig: emailConfig,
      folderTree: emailConfig.folders.map(folder => ({
        label: folder,
        children: []
      })),
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    handleSave() {
      this.$message.success('保存配置成功')
    },
    handleTest() {
      this.$message.success('连接测试成功')
    },
    handleNodeClick(data) {
      this.$message.info(`选择文件夹：${data.label}`)
    }
  }
}
</script> 