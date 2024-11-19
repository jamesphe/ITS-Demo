<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>设备借用申请单</span>
      </div>

      <el-form ref="applyForm" :model="formData" :rules="rules" label-width="120px">
        <!-- 申请人信息 -->
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="formData.applicant" style="width: 300px" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" style="width: 300px" />
        </el-form-item>

        <!-- 设备选择 -->
        <el-form-item label="借用设备" prop="equipment">
          <el-select v-model="formData.equipment" style="width: 300px">
            <el-option
              v-for="item in equipmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 借用时间 -->
        <el-form-item label="借用时间" required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

        <!-- 借用原因 -->
        <el-form-item label="借用原因" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="4"
            style="width: 500px"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交申请</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EquipmentApply',
  data() {
    return {
      formData: {
        applicant: '',
        phone: '',
        equipment: '',
        startTime: '',
        endTime: '',
        reason: ''
      },
      // 模拟设备列表数据
      equipmentList: [
        { id: 1, name: '示波器 TDS2024C' },
        { id: 2, name: '信号发生器 DG4162' },
        { id: 3, name: '电源 DP832A' },
        { id: 4, name: '万用表 34461A' }
      ],
      rules: {
        applicant: [
          { required: true, message: '请输入申请人姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        equipment: [
          { required: true, message: '请选择借用设备', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入借用原因', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          // 模拟提交成功
          this.$message({
            type: 'success',
            message: '申请提交成功！'
          })
          this.resetForm()
        }
      })
    },
    resetForm() {
      this.$refs.applyForm.resetFields()
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
  line-height: 40px;
}
</style> 