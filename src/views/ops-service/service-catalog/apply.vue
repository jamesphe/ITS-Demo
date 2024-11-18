<template>
  <div class="app-container">
    <el-card class="service-apply">
      <div class="title">服务申请表单</div>
      
      <el-form 
        ref="applyForm"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="apply-form">
        
        <!-- 服务名称 -->
        <el-form-item label="服务名称" prop="serviceName">
          <el-input v-model="formData.serviceName" disabled></el-input>
        </el-form-item>
        
        <!-- 申请人 -->
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="formData.applicant" disabled></el-input>
        </el-form-item>
        
        <!-- 联系方式 -->
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="formData.contact" disabled></el-input>
        </el-form-item>
        
        <!-- 服务时间 -->
        <el-form-item label="服务时间" prop="serviceTime">
          <el-date-picker
            v-model="formData.serviceTime"
            type="datetime"
            placeholder="选择服务时间"
            value-format="yyyy-MM-dd HH:mm"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        
        <!-- 备注说明 -->
        <el-form-item label="备注说明" prop="remarks">
          <el-input
            type="textarea"
            v-model="formData.remarks"
            :rows="4"
            placeholder="请输入补充说明">
          </el-input>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-buttons">
          <el-button type="primary" @click="submitForm">提交申请</el-button>
          <el-button @click="cancelApply">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ServiceApply',
  data() {
    return {
      // 模拟当前用户信息
      currentUser: {
        name: '张三',
        department: '技术部',
        phone: '13800138000',
        email: 'zhangsan@company.com'
      },
      formData: {
        serviceName: '',
        applicant: '',
        contact: '',
        serviceTime: '',
        remarks: ''
      },
      rules: {
        serviceTime: [
          { required: true, message: '请选择服务时间', trigger: 'change' }
        ],
        remarks: [
          { max: 500, message: '备注说明不能超过500字', trigger: 'blur' }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 // 不能选择过去的日期
        }
      }
    }
  },
  created() {
    // 从路由参数获取服务信息
    const serviceId = this.$route.params.id
    this.formData.serviceName = this.$route.query.serviceName || '系统维护'
    
    // 自动填充用户信息
    this.formData.applicant = `${this.currentUser.name} (${this.currentUser.department})`
    this.formData.contact = `电话：${this.currentUser.phone}\n邮箱：${this.currentUser.email}`
  },
  methods: {
    submitForm() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          // 这里添加提交逻辑
          const submitData = {
            ...this.formData,
            userId: 'USER123', // 模拟用户ID
            submitTime: new Date().toISOString()
          }
          console.log('提交的申请数据：', submitData)
          this.$message.success('申请提交成功')
          this.$router.push('/ops-service/service-catalog')
        }
      })
    },
    cancelApply() {
      this.$confirm('确认放弃当前申请？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push('/ops-service/service-catalog')
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.service-apply {
  max-width: 800px;
  margin: 0 auto;

  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 30px;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
  }

  .apply-form {
    padding: 20px;

    .el-date-picker {
      width: 100%;
    }

    .form-buttons {
      text-align: center;
      margin-top: 30px;
      
      .el-button {
        min-width: 120px;
        margin: 0 10px;
      }
    }

    // 调整联系方式文本框样式
    :deep(.el-input.is-disabled .el-input__inner) {
      color: #606266; // 让禁用状态的文本颜色更清晰
    }
  }
}
</style> 