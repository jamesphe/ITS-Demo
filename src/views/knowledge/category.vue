<template>
  <div class="category-container">
    <el-card class="category-card">
      <div class="header-actions">
        <div class="left">
          <h2 class="page-title">知识库分类管理</h2>
        </div>
        <div class="right">
          <el-button type="primary" icon="el-icon-plus" @click="handleAddCategory">
            新建分类
          </el-button>
        </div>
      </div>
      
      <el-table 
        :data="categoryList" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        stripe
        highlight-current-row
      >
        <el-table-column prop="name" label="分类名称" min-width="120">
          <template #default="{ row }">
            <span class="category-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="分类类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="medium">
              {{ getCategoryTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              effect="plain"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键词" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="keyword in row.keywords"
              :key="keyword"
              size="small"
              type="info"
              effect="plain"
              class="keyword-item"
            >
              {{ keyword }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <el-tooltip 
              :content="row.description" 
              placement="top" 
              :disabled="!row.description || row.description.length < 20"
            >
              <span class="description-text">{{ row.description }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="text" 
              icon="el-icon-edit"
              class="action-button"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="text" 
              icon="el-icon-delete"
              class="action-button danger-text"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑分类弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      custom-class="category-dialog"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入分类名称"
            class="custom-input"
          />
        </el-form-item>
        <el-form-item label="分类类型" prop="type">
          <el-select 
            v-model="form.type" 
            placeholder="请选择分类类型"
            class="custom-select"
          >
            <el-option
              v-for="item in categoryTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入或选择标签"
            class="custom-select"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-select
            v-model="form.keywords"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入或选择关键词"
            class="custom-select"
          >
            <el-option
              v-for="keyword in commonKeywords"
              :key="keyword"
              :label="keyword"
              :value="keyword"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述"
            class="custom-textarea"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeCategory',
  data() {
    return {
      categoryList: [
        {
          id: 1,
          name: '网络设备故障',
          type: 'topic',
          description: '常见网络设备故障及解决方案',
          createTime: '2024-03-15 10:00:00',
          tags: ['网络', '故障处理'],
          keywords: ['路由器', '交换机', '网络中断']
        },
        {
          id: 2,
          name: '路由器',
          type: 'device',
          description: '路由器相关知识库',
          createTime: '2024-03-15 11:00:00',
          tags: ['网络', '路由器'],
          keywords: ['路由器', '交换机', '网络中断']
        },
        {
          id: 3,
          name: 'ERP系统',
          type: 'application',
          description: 'ERP系统使用指南和故障处理',
          createTime: '2024-03-15 12:00:00',
          tags: ['ERP', '系统'],
          keywords: ['路由器', '交换机', '服务器', 'ERP', '网络中断', '系统升级']
        }
      ],
      dialogVisible: false,
      dialogTitle: '',
      form: {
        name: '',
        type: '',
        description: '',
        tags: [],
        keywords: []
      },
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择分类类型', trigger: 'change' }]
      },
      categoryTypes: [
        { label: '主题', value: 'topic' },
        { label: '设备类型', value: 'device' },
        { label: '应用系统', value: 'application' },
        { label: '服务', value: 'service' }
      ],
      commonTags: ['网络', '故障处理', '运维', '安全', '系统配置'],
      commonKeywords: ['路由器', '交换机', '服务器', 'ERP', '网络中断', '系统升级']
    }
  },
  methods: {
    getCategoryTypeName(type) {
      const found = this.categoryTypes.find(item => item.value === type)
      return found ? found.label : type
    },
    handleAddCategory() {
      this.dialogTitle = '新建分类'
      this.form = {
        name: '',
        type: '',
        description: '',
        tags: [],
        keywords: []
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑分类'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(id) {
      this.$confirm('确认删除该分类吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.categoryList = this.categoryList.filter(item => item.id !== id)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const formData = {
            ...this.form,
            tags: this.form.tags || [],
            keywords: this.form.keywords || []
          }
          
          if (this.form.id) {
            // 编辑现有分类
            const index = this.categoryList.findIndex(item => item.id === this.form.id)
            this.categoryList.splice(index, 1, {
              ...formData,
              createTime: this.categoryList[index].createTime
            })
          } else {
            // 新增分类
            this.categoryList.push({
              ...formData,
              id: Date.now(),
              createTime: new Date().toLocaleString()
            })
          }
          this.dialogVisible = false
          this.$message.success(this.form.id ? '更新成功' : '创建成功')
        }
      })
    },
    getTypeTagType(type) {
      const typeMap = {
        topic: 'success',
        device: 'warning',
        application: 'primary',
        service: 'info'
      }
      return typeMap[type] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.category-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);

  .category-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .page-title {
        margin: 0;
        font-size: 20px;
        color: #303133;
      }
    }
  }

  .category-name {
    font-weight: 500;
    color: #303133;
  }

  .tag-item {
    margin: 2px 4px;
    border-radius: 4px;
  }

  .keyword-item {
    margin: 2px 4px;
    border-radius: 4px;
  }

  .description-text {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-button {
    padding: 0 8px;
    font-size: 14px;

    &:hover {
      opacity: 0.8;
    }

    &.danger-text {
      color: #F56C6C;
    }
  }
}

// 弹窗样式
.category-dialog {
  .custom-input,
  .custom-select,
  .custom-textarea {
    width: 100%;
  }

  .el-select {
    width: 100%;
  }

  .dialog-footer {
    text-align: right;
    padding-top: 20px;
  }

  .el-form-item {
    margin-bottom: 22px;
  }
}

// 表格hover效果
:deep(.el-table__row) {
  &:hover {
    td {
      background-color: #f5f7fa !important;
    }
  }
}

// 标签和关键词的hover效果
.el-tag {
  transition: all 0.3s;
  cursor: default;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
</style> 