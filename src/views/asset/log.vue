<template>
  <div class="app-container">
    <div class="log-container">
      <!-- 标题区域 -->
      <div class="page-title">
        <el-row type="flex" align="middle">
          <i class="el-icon-time title-icon"></i>
          <h2>资产管理日志</h2>
        </el-row>
      </div>

      <!-- 搜索条件区域 -->
      <el-card class="filter-container" shadow="hover">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="资产编号">
            <el-input
              v-model="queryParams.assetCode"
              placeholder="请输入资产编号"
              clearable
              size="small"
              prefix-icon="el-icon-document"
            />
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select
              v-model="queryParams.operationType"
              placeholder="请选择操作类型"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in operationTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="queryParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
            />
          </el-form-item>
          <el-form-item class="filter-buttons">
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 日志列表 -->
      <el-card class="table-container" shadow="hover">
        <el-table
          v-loading="loading"
          :data="logList"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa' }"
          stripe
          highlight-current-row
        >
          <el-table-column
            prop="operationTime"
            label="操作时间"
            width="180"
            align="center"
          >
            <template slot-scope="scope">
              <i class="el-icon-time"></i>
              {{ scope.row.operationTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="assetCode"
            label="资产编号"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-link type="primary" :underline="false">{{ scope.row.assetCode }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="assetName"
            label="资产名称"
            width="150"
            align="center"
          />
          <el-table-column
            prop="operationType"
            label="操作类型"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getOperationTypeTag(scope.row.operationType)"
                effect="plain"
                size="medium"
              >
                {{ scope.row.operationType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="operator"
            label="操作人"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.department" placement="top">
                <span class="operator-name">{{ scope.row.operator }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="department"
            label="所属部门"
            width="150"
            align="center"
          />
          <el-table-column
            prop="description"
            label="操作描述"
            align="left"
            show-overflow-tooltip
          />
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetLog',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 日志表格数据
      logList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        assetCode: undefined,
        operationType: undefined,
        dateRange: []
      },
      // 操作类型选项
      operationTypeOptions: [
        { value: '入库', label: '入库' },
        { value: '出库', label: '出库' },
        { value: '借用', label: '借用' },
        { value: '归还', label: '归还' },
        { value: '领用', label: '领用' },
        { value: '更换', label: '更换' },
        { value: '维修', label: '维修' },
        { value: '报废', label: '报废' }
      ],
      // 添加日期选择器快捷配置
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      // 模拟后端数据
      setTimeout(() => {
        this.logList = [
          {
            operationTime: '2024-03-20 14:30:00',
            assetCode: 'IT-PC-001',
            assetName: 'ThinkPad笔记本',
            operationType: '借用',
            operator: '张三',
            department: '信息技术部',
            description: '教师借用笔记本电脑用于教学'
          },
          {
            operationTime: '2024-03-19 10:15:00',
            assetCode: 'IT-PR-002',
            assetName: '激光打印机',
            operationType: '维修',
            operator: '李四',
            department: '行政办公室',
            description: '打印机卡纸维修'
          },
          {
            operationTime: '2024-03-18 16:45:00',
            assetCode: 'IT-SW-003',
            assetName: '交换机',
            operationType: '入库',
            operator: '王五',
            department: '网络中心',
            description: '新购入交换机设备'
          }
        ]
        this.total = 3
        this.loading = false
      }, 300)
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        assetCode: undefined,
        operationType: undefined,
        dateRange: []
      }
      this.handleQuery()
    },
    // 获取操作类型对应的标签类型
    getOperationTypeTag(type) {
      const typeMap = {
        '入库': 'success',
        '出库': 'info',
        '借用': 'warning',
        '归还': 'success',
        '领用': 'warning',
        '更换': 'info',
        '维修': 'danger',
        '报废': 'danger'
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
.log-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.page-title .el-row {
  display: flex;
  align-items: center;
}

.title-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #409EFF;
}

.page-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-container .el-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-buttons {
  margin-left: auto;
}

.table-container {
  margin-bottom: 20px;
}

.operator-name {
  cursor: pointer;
  color: #409EFF;
}

.operator-name:hover {
  text-decoration: underline;
}

.pagination-container {
  padding: 15px 0;
  display: flex;
  justify-content: flex-end;
}

/* 表格hover效果优化 */
.el-table tbody tr:hover > td {
  background-color: #f0f9ff !important;
}

/* 搜索表单项样式优化 */
.el-form-item {
  margin-bottom: 18px;
}

.el-input {
  width: 220px;
}

.el-date-editor {
  width: 360px !important;
}

/* 卡片阴影效果 */
.el-card {
  border-radius: 4px;
  transition: all 0.3s;
}

.el-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 标签样式优化 */
.el-tag {
  padding: 0 10px;
  height: 28px;
  line-height: 26px;
  border-radius: 4px;
}
</style> 