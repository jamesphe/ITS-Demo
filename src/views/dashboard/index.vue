<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎使用 IT 运维管理系统</div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>待处理工单</span>
          </div>
          <div class="card-body">
            <h2>{{ pendingTickets }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>处理中工单</span>
          </div>
          <div class="card-body">
            <h2>{{ processingTickets }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>今日完成</span>
          </div>
          <div class="card-body">
            <h2>{{ completedToday }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>本月完成</span>
          </div>
          <div class="card-body">
            <h2>{{ completedThisMonth }}</h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>工单类型分布</span>
          </div>
          <div ref="pieChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>工单趋势</span>
          </div>
          <div ref="lineChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      pendingTickets: 5,
      processingTickets: 8,
      completedToday: 3,
      completedThisMonth: 45
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    padding: 20px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
    text-align: center;
    margin-bottom: 20px;
  }
}
.card-body {
  text-align: center;
  h2 {
    font-size: 36px;
    color: #409EFF;
    margin: 10px 0;
  }
}
</style> 