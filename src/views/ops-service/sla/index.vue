<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="请输入SLA名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        新建
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="SLA名称" prop="name" align="center">
        <template slot-scope="{row}">
          <router-link :to="'/ops-service/sla/detail/'+row.id" class="link-type">
            <span>{{ row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="响应时间" prop="responseTime" align="center">
        <template slot-scope="{row}">
          <span>{{ row.responseTime }}小时</span>
        </template>
      </el-table-column>
      <el-table-column label="解决时间" prop="resolutionTime" align="center">
        <template slot-scope="{row}">
          <span>{{ row.resolutionTime }}小时</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!=='active'" size="mini" type="success" @click="handleModifyStatus(row,'active')">
            启用
          </el-button>
          <el-button v-if="row.status==='active'" size="mini" type="danger" @click="handleModifyStatus(row,'inactive')">
            禁用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="SLA名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="响应时间" prop="responseTime">
          <el-input-number v-model="temp.responseTime" :min="1" label="小时" />
        </el-form-item>
        <el-form-item label="解决时间" prop="resolutionTime">
          <el-input-number v-model="temp.resolutionTime" :min="1" label="小时" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="temp.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchSLAList, createSLA, updateSLA } from '@/api/sla'
import Pagination from '@/components/Pagination'

export default {
  name: 'SLAManagement',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      temp: {
        id: undefined,
        name: '',
        responseTime: 1,
        resolutionTime: 24,
        description: '',
        status: 'active'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        name: [{ required: true, message: '请输入SLA名称', trigger: 'blur' }],
        responseTime: [{ required: true, message: '请输入响应时间', trigger: 'blur' }],
        resolutionTime: [{ required: true, message: '请输入解决时间', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSLAList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        responseTime: 1,
        resolutionTime: 24,
        description: '',
        status: 'active'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogTitle = '创建SLA'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createSLA(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑SLA'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateSLA(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleModifyStatus(row, status) {
      this.$confirm('确认要修改该SLA状态吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateSLA({
          id: row.id,
          status: status
        }).then(() => {
          this.$notify({
            title: '成功',
            message: '状态更新成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    }
  }
}
</script>

<style>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
}
</style> 