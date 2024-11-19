<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="请输入标题或内容关键字"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.type" placeholder="知识类型" style="width: 130px" class="filter-item">
        <el-option label="网络问题" value="network" />
        <el-option label="系统问题" value="system" />
        <el-option label="应用问题" value="application" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        收集新知识
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="filterList"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="标题" min-width="200">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleView(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.type | typeFilter">{{ row.type | typeNameFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template slot-scope="{row}">
          <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '收集新知识' : '编辑知识'" :visible.sync="dialogVisible">
      <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px" :rules="rules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择">
            <el-option label="网络问题" value="network" />
            <el-option label="系统问题" value="system" />
            <el-option label="应用问题" value="application" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="problem">
          <el-input type="textarea" v-model="temp.problem" :rows="3" placeholder="请描述遇到的问题" />
        </el-form-item>
        <el-form-item label="解决方案" prop="solution">
          <el-input type="textarea" v-model="temp.solution" :rows="5" placeholder="请详细描述解决方案" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="temp.remark" :rows="2" placeholder="其他补充说明" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="知识详情" :visible.sync="viewDialogVisible" width="60%">
      <div class="knowledge-detail">
        <h3>{{ currentView.title }}</h3>
        <el-divider></el-divider>
        <div class="detail-item">
          <div class="label">类型：</div>
          <div class="content">
            <el-tag :type="currentView.type | typeFilter">{{ currentView.type | typeNameFilter }}</el-tag>
          </div>
        </div>
        <div class="detail-item">
          <div class="label">问题描述：</div>
          <div class="content">{{ currentView.problem }}</div>
        </div>
        <div class="detail-item">
          <div class="label">解决方案：</div>
          <div class="content">{{ currentView.solution }}</div>
        </div>
        <div class="detail-item" v-if="currentView.remark">
          <div class="label">备注：</div>
          <div class="content">{{ currentView.remark }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const defaultTemp = {
  id: undefined,
  title: '',
  type: '',
  problem: '',
  solution: '',
  remark: ''
}

export default {
  name: 'KnowledgeCollectStore',
  filters: {
    typeFilter(type) {
      const typeMap = {
        network: 'primary',
        system: 'success',
        application: 'warning',
        other: 'info'
      }
      return typeMap[type]
    },
    typeNameFilter(type) {
      const typeMap = {
        network: '网络问题',
        system: '系统问题',
        application: '应用问题',
        other: '其他'
      }
      return typeMap[type]
    }
  },
  data() {
    return {
      list: [
        {
          id: 1,
          title: 'MySQL数据库连接超时问题解决',
          type: 'application',
          problem: 'MySQL连接频繁超时断开',
          solution: '1. 检查wait_timeout参数\n2. 调整连接池配置\n3. 添加重连机制',
          createTime: '2024-03-20 10:00:00'
        },
        {
          id: 2,
          title: 'Linux服务器CPU使用率过高排查',
          type: 'system',
          problem: '服务器CPU使用率突然升高到90%以上',
          solution: '使用top命令定位高CPU进程，分析进程行为，优化相关配置',
          createTime: '2024-03-20 11:30:00'
        }
      ],
      listLoading: false,
      listQuery: {
        keyword: '',
        type: ''
      },
      dialogVisible: false,
      viewDialogVisible: false,
      dialogStatus: '',
      temp: Object.assign({}, defaultTemp),
      currentView: {},
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        problem: [{ required: true, message: '问题描述不能为空', trigger: 'blur' }],
        solution: [{ required: true, message: '解决方案不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filterList() {
      const { keyword, type } = this.listQuery
      return this.list.filter(item => {
        const matchKeyword = !keyword || 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.problem.toLowerCase().includes(keyword.toLowerCase())
        const matchType = !type || item.type === type
        return matchKeyword && matchType
      })
    }
  },
  methods: {
    handleFilter() {
      this.listLoading = true
      setTimeout(() => {
        this.listLoading = false
      }, 200)
    },
    resetTemp() {
      this.temp = Object.assign({}, defaultTemp)
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = this.list.length + 1
          this.temp.createTime = new Date().toLocaleString()
          const newRecord = Object.assign({}, this.temp)
          this.list.unshift(newRecord)
          this.dialogVisible = false
          this.$message({
            type: 'success',
            message: '创建成功'
          })
        }
      })
    },
    handleEdit(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const index = this.list.findIndex(v => v.id === this.temp.id)
          const updateRecord = Object.assign({}, this.temp)
          this.list.splice(index, 1, updateRecord)
          this.dialogVisible = false
          this.$message({
            type: 'success',
            message: '更新成功'
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该知识条目?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.list.findIndex(v => v.id === row.id)
        this.list.splice(index, 1)
        this.$message({
          type: 'success',
          message: '删除成功'
        })
      }).catch(() => {})
    },
    handleView(row) {
      this.currentView = Object.assign({}, row)
      this.viewDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    margin-right: 10px;
  }
}

.knowledge-detail {
  padding: 20px;
  
  .detail-item {
    margin-bottom: 20px;
    
    .label {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .content {
      line-height: 1.6;
      color: #606266;
    }
  }
}

.link-type {
  color: #409EFF;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}
</style> 