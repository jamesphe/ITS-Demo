<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>SLA详情</span>
        <el-button-group style="float: right;">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="$router.push('/ops-service/sla')"
          >
            返回列表
          </el-button>
        </el-button-group>
      </div>
      
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item label="SLA名称">
          {{ slaInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="slaInfo.status === 'active' ? 'success' : 'info'">
            {{ slaInfo.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="响应时间">
          {{ slaInfo.responseTime }}小时
        </el-descriptions-item>
        <el-descriptions-item label="解决时间">
          {{ slaInfo.resolutionTime }}小时
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ slaInfo.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">关联服务</el-divider>
      
      <div class="table-operations">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAddService"
        >
          添加关联服务
        </el-button>
      </div>

      <el-table
        v-loading="servicesLoading"
        :data="relatedServices"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="服务名称" align="center">
          <template slot-scope="{row}">
            <router-link 
              :to="'/ops-service/service-catalog/detail/' + row.id"
              class="link-type"
            >
              <span>{{ row.name }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="服务类别" align="center" />
        <el-table-column prop="priority" label="优先级" align="center">
          <template slot-scope="{row}">
            <el-tag :type="priorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template slot-scope="{row}">
            <el-button
              type="danger"
              size="mini"
              @click="handleRemoveService(row)"
            >
              解除关联
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">SLA执行情况</el-divider>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>响应时间达标率</span>
              <el-tooltip content="最近30天内工单响应时间符合SLA要求的比例" placement="top">
                <i class="el-icon-question" style="margin-left: 5px"></i>
              </el-tooltip>
            </div>
            <div class="stat-content">
              <span class="stat-number">95%</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>解决时间达标率</span>
              <el-tooltip content="最近30天内工单解决时间符合SLA要求的比例" placement="top">
                <i class="el-icon-question" style="margin-left: 5px"></i>
              </el-tooltip>
            </div>
            <div class="stat-content">
              <span class="stat-number">88%</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>客户满意度</span>
              <el-tooltip content="最近30天内关联服务的客户评分平均值" placement="top">
                <i class="el-icon-question" style="margin-left: 5px"></i>
              </el-tooltip>
            </div>
            <div class="stat-content">
              <span class="stat-number">4.5</span>
              <span class="stat-unit">/5</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider content-position="left">违规记录</el-divider>
      <el-table
        :data="violationRecords"
        border
        style="width: 100%"
      >
        <el-table-column prop="ticketId" label="工单编号" align="center" width="120" />
        <el-table-column prop="type" label="违规类型" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.type === '响应超时' ? 'warning' : 'danger'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="发生时间" align="center" width="180" />
        <el-table-column prop="description" label="说明" align="center" />
      </el-table>
    </el-card>

    <!-- 添加关联服务的对话框 -->
    <el-dialog title="添加关联服务" :visible.sync="dialogVisible">
      <el-transfer
        v-model="selectedServices"
        :data="allServices"
        :titles="['可选服务', '已选服务']"
        :props="{
          key: 'id',
          label: 'name'
        }"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddServices">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchSLA, fetchSLAServices } from '@/api/sla'

export default {
  name: 'SLADetail',
  data() {
    return {
      slaInfo: {},
      relatedServices: [],
      servicesLoading: false,
      dialogVisible: false,
      selectedServices: [],
      allServices: [],
      violationRecords: [
        {
          ticketId: 'T2024030001',
          type: '响应超时',
          time: '2024-03-01 14:30:00',
          description: '超出响应时间30分钟'
        },
        {
          ticketId: 'T2024030002',
          type: '解决超时',
          time: '2024-03-02 16:45:00',
          description: '超出解决时间2小时'
        }
      ]
    }
  },
  created() {
    this.getSLADetail()
  },
  methods: {
    getSLADetail() {
      const id = this.$route.params.id
      fetchSLA(id).then(response => {
        this.slaInfo = response.data
        this.relatedServices = response.data.services || []
      })
    },
    priorityType(priority) {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return types[priority] || 'info'
    },
    handleEdit() {
      // 跳转到编辑页面或打开编辑对话框
      this.$message('编辑功能开发中')
    },
    handleAddService() {
      this.dialogVisible = true
      // 这里应该调用API获取所有可选服务
      this.allServices = [
        { id: 1, name: '密码重置' },
        { id: 2, name: '软件安装' },
        { id: 3, name: '系统故障' }
      ]
    },
    handleRemoveService(service) {
      this.$confirm('确认解除与该服务的关联关系？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '解除关联成功!'
        })
      })
    },
    handleConfirmAddServices() {
      this.dialogVisible = false
      this.$message({
        type: 'success',
        message: '添加关联服务成功!'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin: 20px;
}
.margin-top {
  margin-top: 20px;
}
.stat-content {
  text-align: center;
  padding: 20px 0;
  .stat-number {
    font-size: 36px;
    font-weight: bold;
    color: #409EFF;
  }
  .stat-unit {
    font-size: 16px;
    color: #909399;
    margin-left: 5px;
  }
}
.el-divider {
  margin: 24px 0;
}
.table-operations {
  margin-bottom: 16px;
}
</style> 