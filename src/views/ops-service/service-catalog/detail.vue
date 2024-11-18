<template>
  <div class="app-container">
    <el-card class="service-detail">
      <div class="title">服务详细信息</div>
      
      <!-- 服务信息 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item label="服务名称">
          {{ serviceDetail.serviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="服务描述">
          {{ serviceDetail.description }}
        </el-descriptions-item>
        <el-descriptions-item label="交付时间">
          {{ serviceDetail.deliveryTime }}
        </el-descriptions-item>
        <el-descriptions-item label="申请流程">
          <div class="process-list">
            <div class="process-item">1. 点击"申请服务"按钮</div>
            <div class="process-item">2. 填写申请表单，包含服务时间、联系人信息等</div>
            <div class="process-item">3. 提交申请，系统自动分派运维人员进行处理</div>
            <div class="process-item">4. 用户收到处理完成的通知</div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="费用说明">
          {{ serviceDetail.costDescription }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="handleApply">申请服务</el-button>
        <el-button @click="handleBack">返回服务目录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ServiceDetail',
  data() {
    return {
      serviceDetail: {
        serviceName: '系统维护',
        description: '定期系统巡检和维护，确保系统正常运行',
        deliveryTime: '每月安排固定巡检时间',
        costDescription: '无费用 / 费用由相关部门承担'
      }
    }
  },
  methods: {
    handleApply() {
      // 跳转到申请服务页面，并传递服务信息
      this.$router.push({
        path: `/ops-service/service-catalog/apply/${this.$route.params.id}`,
        query: { serviceName: this.serviceDetail.serviceName }
      })
    },
    handleBack() {
      this.$router.push('/ops-service/service-catalog')
    }
  }
}
</script>

<style lang="scss" scoped>
.service-detail {
  .title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
  }

  .process-list {
    .process-item {
      line-height: 24px;
      margin: 5px 0;
    }
  }

  .operation-buttons {
    margin-top: 20px;
    text-align: center;
    
    .el-button {
      margin: 0 10px;
      min-width: 120px;
    }
  }

  :deep(.el-descriptions-item__label) {
    width: 120px;
    text-align: right;
    font-weight: bold;
  }
}
</style> 