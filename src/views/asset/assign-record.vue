<template>
  <div class="app-container">
    <h2>配发记录</h2>
    
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.deviceName" placeholder="请输入设备名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="使用单位">
          <el-input v-model="searchForm.department" placeholder="请输入使用单位" clearable></el-input>
        </el-form-item>
        <el-form-item label="配发时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="deviceName" label="设备名称" min-width="150"></el-table-column>
        <el-table-column prop="deviceType" label="设备类型" width="120"></el-table-column>
        <el-table-column prop="serialNumber" label="序列号" width="150"></el-table-column>
        <el-table-column prop="department" label="使用单位" min-width="150"></el-table-column>
        <el-table-column prop="assignTime" label="配发时间" width="180"></el-table-column>
        <el-table-column prop="handler" label="经办人" width="120"></el-table-column>
        <el-table-column prop="status" label="使用状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '使用中' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AssignRecord',
  data() {
    return {
      searchForm: {
        deviceName: '',
        department: '',
        dateRange: []
      },
      tableData: [
        {
          deviceName: '联想ThinkPad E14',
          deviceType: '笔记本电脑',
          serialNumber: 'LP2023001',
          department: '计算机学院',
          assignTime: '2024-03-15 14:30:00',
          handler: '张三',
          status: '使用中',
          remark: '教师办公用机'
        },
        {
          deviceName: '惠普打印机M254dw',
          deviceType: '打印机',
          serialNumber: 'HP2023002',
          department: '图书馆',
          assignTime: '2024-03-10 09:15:00',
          handler: '李四',
          status: '使用中',
          remark: '图书馆前台打印机'
        }
        // 这里可以添加更多演示数据
      ],
      currentPage: 1,
      pageSize: 10,
      total: 2
    }
  },
  methods: {
    handleSearch() {
      // 演示用，实际需要调用后端API
      console.log('搜索条件：', this.searchForm)
    },
    resetSearch() {
      this.searchForm = {
        deviceName: '',
        department: '',
        dateRange: []
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      // 重新加载数据
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // 重新加载数据
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.table-card {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 