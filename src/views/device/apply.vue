<template>
  <div class="app-container">
    <el-card class="apply-card">
      <div slot="header" class="card-header">
        <h3><i class="el-icon-document-add"></i> 教学设备借用申请</h3>
      </div>

      <el-form 
        ref="applyForm" 
        :model="formData" 
        :rules="rules" 
        label-width="120px"
        class="apply-form"
      >
        <!-- 申请人信息 -->
        <el-form-item label="申请人" prop="applicant">
          <el-input
            v-model="formData.applicant"
            style="width: 180px"
            placeholder="姓名"
          />
          <el-select
            v-model="formData.userType"
            style="width: 120px; margin-left: 10px"
            placeholder="身份类型"
          >
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
            <el-option label="教务人员" value="staff" />
          </el-select>
          <el-input
            v-model="formData.userCode"
            style="width: 180px; margin-left: 10px"
            :placeholder="formData.userType === 'student' ? '学号' : '工号'"
          />
        </el-form-item>

        <!-- 院系信息 -->
        <el-form-item label="所属院系" prop="department">
          <el-cascader
            v-model="formData.department"
            :options="departmentOptions"
            style="width: 400px"
            placeholder="请选择院系/专业"
          />
        </el-form-item>

        <!-- 设备选择 -->
        <el-form-item label="借用设备" prop="equipment">
          <el-select 
            v-model="formData.equipment" 
            placeholder="请选择需要借用的设备"
            style="width: 400px"
            filterable
          >
            <el-option-group
              v-for="group in equipmentGroups"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                :disabled="item.status === 'borrowed'"
              >
                <span class="equipment-icon"><i :class="item.icon"></i></span>
                <span class="equipment-name">{{ item.name }}</span>
                <span class="equipment-status" :class="item.status">{{ item.statusText }}</span>
              </el-option>
            </el-option-group>
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
                style="width: 190px"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2" style="text-align: center">至</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 190px"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

        <!-- 使用地点 -->
        <el-form-item label="使用地点" prop="location">
          <el-input
            v-model="formData.location"
            style="width: 400px"
            placeholder="请输入具体使用地点（教室/实验室编号）"
          />
        </el-form-item>

        <!-- 借用用途 -->
        <el-form-item label="借用用途" prop="purpose">
          <el-select
            v-model="formData.purpose"
            style="width: 400px"
            placeholder="请选择借用用途"
          >
            <el-option label="课堂教学" value="teaching" />
            <el-option label="实验教学" value="experiment" />
            <el-option label="学术报告" value="academic" />
            <el-option label="学生活动" value="activity" />
            <el-option label="其他用途" value="other" />
          </el-select>
        </el-form-item>

        <!-- 借用说明 -->
        <el-form-item label="借用说明" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明借用用途，如课程名称、活动名称等..."
            style="width: 400px"
            class="reason-input"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item class="form-buttons">
          <el-button type="primary" icon="el-icon-check" @click="submitForm">提交申请</el-button>
          <el-button icon="el-icon-close" @click="resetForm">取消</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加说明信息 -->
      <div class="apply-tips">
        <h4><i class="el-icon-info"></i> 借用须知</h4>
        <ul>
          <li>教学设备仅限用于教学、学术等校内活动使用</li>
          <li>设备借用期限：教师最长30天，学生最长7天</li>
          <li>贵重设备需要院系负责人审批</li>
          <li>请在借用结束时间前及时归还设备</li>
          <li>如需延长借用时间，请提前3天申请续借</li>
          <li>设备如有损坏，需照价赔偿</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceApply',
  data() {
    return {
      formData: {
        applicant: '',
        userType: '',
        userCode: '',
        department: [],
        equipment: '',
        startTime: '',
        endTime: '',
        location: '',
        purpose: '',
        reason: ''
      },
      // 院系选项
      departmentOptions: [
        {
          value: 'cs',
          label: '计算机科学与技术学院',
          children: [
            { value: 'cs-se', label: '软件工程' },
            { value: 'cs-is', label: '信息安全' },
            { value: 'cs-ai', label: '人工智能' }
          ]
        },
        {
          value: 'ee',
          label: '电子工程学院',
          children: [
            { value: 'ee-ce', label: '通信工程' },
            { value: 'ee-ae', label: '自动化' }
          ]
        }
      ],
      // 设备分组列表
      equipmentGroups: [
        {
          label: '教学设备',
          options: [
            { 
              id: 1, 
              name: '多媒体投影仪 EP-01', 
              icon: 'el-icon-video-camera',
              status: 'available',
              statusText: '可借用'
            },
            { 
              id: 2, 
              name: '教学一体机 TC-01', 
              icon: 'el-icon-monitor',
              status: 'available',
              statusText: '可借用'
            }
          ]
        },
        {
          label: '实验设备',
          options: [
            { 
              id: 3, 
              name: '示波器 OS-01', 
              icon: 'el-icon-data-line',
              status: 'available',
              statusText: '可借用'
            },
            { 
              id: 4, 
              name: '信号���生器 SG-01', 
              icon: 'el-icon-data-analysis',
              status: 'borrowed',
              statusText: '已借出'
            }
          ]
        },
        {
          label: '办公设备',
          options: [
            { 
              id: 5, 
              name: '便携式笔记本 LT-01', 
              icon: 'el-icon-notebook-2',
              status: 'available',
              statusText: '可借用'
            },
            { 
              id: 6, 
              name: '激光打印机 PT-01', 
              icon: 'el-icon-printer',
              status: 'maintenance',
              statusText: '维修中'
            }
          ]
        }
      ],
      // 时间选择器配置
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      rules: {
        applicant: [
          { required: true, message: '请输入申请人姓名', trigger: 'blur' }
        ],
        userType: [
          { required: true, message: '请选择身份类型', trigger: 'change' }
        ],
        userCode: [
          { required: true, message: '请输入学号/工号', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择所属院系', trigger: 'change' }
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
        location: [
          { required: true, message: '请输入使用地点', trigger: 'blur' }
        ],
        purpose: [
          { required: true, message: '请选择借用用途', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入借用说明', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          this.$message({
            type: 'success',
            message: '申请提交成功！等待审核',
            duration: 2000
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
.apply-card {
  max-width: 800px;
  margin: 20px auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  background-color: #f5f7fa;
  padding: 15px 0;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.card-header i {
  margin-right: 8px;
  color: #409EFF;
}

.apply-form {
  padding: 30px 20px;
}

.equipment-icon {
  margin-right: 8px;
  font-size: 16px;
}

.equipment-name {
  font-size: 14px;
}

.equipment-status {
  float: right;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.available {
  color: #67C23A;
  background-color: #f0f9eb;
}

.borrowed {
  color: #F56C6C;
  background-color: #fef0f0;
}

.date-separator {
  margin: 0 10px;
  color: #909399;
}

.date-picker {
  width: 190px;
}

.reason-input {
  border-radius: 4px;
}

.form-buttons {
  margin-top: 30px;
  text-align: center;
}

.apply-tips {
  margin: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.apply-tips h4 {
  color: #606266;
  margin: 0 0 10px 0;
}

.apply-tips i {
  color: #409EFF;
  margin-right: 5px;
}

.apply-tips ul {
  margin: 0;
  padding-left: 25px;
  color: #606266;
  font-size: 14px;
}

.apply-tips li {
  line-height: 24px;
}

/* 添加输入框hover效果 */
.el-input:hover .el-input__inner,
.el-textarea:hover .el-textarea__inner {
  border-color: #409EFF;
}

/* 添加表单项hover效果 */
.el-form-item:hover {
  background-color: #fafafa;
  border-radius: 4px;
  transition: all 0.3s;
}

.equipment-status.maintenance {
  color: #E6A23C;
  background-color: #fdf6ec;
}

.apply-form .el-select {
  vertical-align: middle;
}

.apply-form .el-cascader {
  vertical-align: middle;
}

.apply-tips {
  border-left: 4px solid #409EFF;
}

.apply-tips li {
  margin-bottom: 8px;
}

/* 添加响应式布局 */
@media screen and (max-width: 768px) {
  .apply-card {
    margin: 10px;
  }
  
  .el-form-item {
    margin-bottom: 22px;
  }
}
</style> 