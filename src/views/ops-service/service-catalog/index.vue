<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>服务目录管理</span>
      </div>
      
      <!-- 筛选条件 -->
      <el-form :inline="true" :model="filterForm" class="filter-container">
        <el-form-item label="服务名称">
          <el-input v-model="filterForm.serviceName" placeholder="请输入服务名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="交付时间">
          <el-select v-model="filterForm.deliveryTime" placeholder="请选择交付时间" clearable>
            <el-option label="2小时内" value="2h"></el-option>
            <el-option label="1个工作日内" value="1d"></el-option>
            <el-option label="固定排期" value="scheduled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="filterForm.serviceType" placeholder="请选择服务类型" clearable>
            <el-option label="网络支持" value="network"></el-option>
            <el-option label="系统维护" value="system"></el-option>
            <el-option label="软件安装" value="software"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作 -->
      <div class="batch-operation" v-if="selection.length > 0">
        <el-button type="primary" @click="handleBatchApply">批量申请</el-button>
      </div>

      <!-- 服务列表 -->
      <el-table
        v-loading="loading"
        :data="filteredServiceList"
        @selection-change="handleSelectionChange"
        border
        style="width: 100%; margin-top: 20px;">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="serviceName" label="服务名称" min-width="150"></el-table-column>
        <el-table-column prop="description" label="服务描述" min-width="250"></el-table-column>
        <el-table-column prop="deliveryTime" label="交付时间" min-width="150"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="{row}">
            <div class="operation-buttons">
              <el-button
                size="mini"
                type="primary"
                plain
                @click="handleViewDetails(row)">
                查看详细信息
              </el-button>
              <el-button
                size="mini"
                type="success"
                plain
                @click="handleDirectApply(row)">
                直接申请
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 批量申请对话框 -->
    <el-dialog
      title="批量申请服务"
      :visible.sync="batchDialogVisible"
      width="600px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="申请说明">
          <el-input
            type="textarea"
            v-model="batchForm.description"
            :rows="4"
            placeholder="请输入申请说明">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchApply">确认申请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ServiceCatalog',
  data() {
    return {
      loading: false,
      filterForm: {
        serviceName: '',
        deliveryTime: '',
        serviceType: ''
      },
      // 模拟数据
      serviceList: [
        {
          id: 1,
          serviceName: '网络支持',
          description: '提供网络连接、调试服务',
          deliveryTime: '2小时内完成申请处理',
          type: 'network'
        },
        {
          id: 2,
          serviceName: '系统维护',
          description: '定期系统巡检和维护',
          deliveryTime: '每月安排固定巡检时间',
          type: 'system'
        },
        {
          id: 3,
          serviceName: '软件安装',
          description: '办公软件安装与配置',
          deliveryTime: '1个工作日内完成',
          type: 'software'
        }
      ],
      selection: [],
      batchDialogVisible: false,
      batchForm: {
        description: ''
      }
    }
  },
  computed: {
    filteredServiceList() {
      return this.serviceList.filter(item => {
        const nameMatch = !this.filterForm.serviceName || 
          item.serviceName.includes(this.filterForm.serviceName)
        const typeMatch = !this.filterForm.serviceType || 
          item.type === this.filterForm.serviceType
        const timeMatch = !this.filterForm.deliveryTime || 
          item.deliveryTime.includes(this.filterForm.deliveryTime === '2h' ? '2小时' : 
            this.filterForm.deliveryTime === '1d' ? '1个工作日' : '固定')
        return nameMatch && typeMatch && timeMatch
      })
    }
  },
  methods: {
    handleFilter() {
      // 使用计算属性自动过滤
    },
    resetFilter() {
      this.filterForm = {
        serviceName: '',
        deliveryTime: '',
        serviceType: ''
      }
    },
    handleSelectionChange(val) {
      this.selection = val
    },
    handleViewDetails(row) {
      this.$router.push(`/ops-service/service-catalog/detail/${row.id}`)
    },
    handleDirectApply(row) {
      this.$router.push({
        path: `/ops-service/service-catalog/apply/${row.id}`,
        query: { serviceName: row.serviceName }
      })
    },
    handleBatchApply() {
      this.batchDialogVisible = true
    },
    submitBatchApply() {
      const serviceNames = this.selection.map(item => item.serviceName).join('、')
      this.$message.success(`批量申请服务：${serviceNames}`)
      this.batchDialogVisible = false
      this.batchForm.description = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 20px;
}
.batch-operation {
  margin: 10px 0;
}
.operation-buttons {
  display: flex;
  gap: 8px; // 按钮之间的间距
  justify-content: center; // 按钮居中对齐
  
  .el-button {
    margin-left: 0; // 覆盖 element-ui 默认的按钮左边距
    padding: 7px 15px; // 调整按钮内边距
  }
}
</style> 