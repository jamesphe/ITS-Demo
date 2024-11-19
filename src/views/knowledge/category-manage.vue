<template>
  <div class="category-manage">
    <el-card>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddCategory">
          新建分类
        </el-button>
      </div>
      
      <el-table :data="categoryList" style="width: 100%">
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="type" label="分类类型">
          <template #default="{ row }">
            {{ getCategoryTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)" class="danger-text">
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
      width="500px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择分类类型">
            <el-option
              v-for="item in categoryTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/api/knowledge'

export default {
  name: 'CategoryManage',
  data() {
    return {
      categoryList: [],
      dialogVisible: false,
      dialogTitle: '',
      form: {
        name: '',
        type: '',
        description: ''
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
      ]
    }
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      try {
        const { data } = await getCategories()
        this.categoryList = data
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    },
    getCategoryTypeName(type) {
      const found = this.categoryTypes.find(item => item.value === type)
      return found ? found.label : type
    },
    handleAddCategory() {
      this.dialogTitle = '新建分类'
      this.form = {
        name: '',
        type: '',
        description: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑分类'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该分类吗？', '提示', {
          type: 'warning'
        })
        await deleteCategory(row.id)
        this.$message.success('删除成功')
        this.fetchCategories()
      } catch (error) {
        console.error('删除分类失败:', error)
      }
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        if (this.form.id) {
          await updateCategory(this.form)
        } else {
          await addCategory(this.form)
        }
        this.$message.success(this.form.id ? '更新成功' : '创建成功')
        this.dialogVisible = false
        this.fetchCategories()
      } catch (error) {
        console.error('保存分类失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.category-manage {
  padding: 20px;
  
  .header-actions {
    margin-bottom: 20px;
  }
  
  .danger-text {
    color: #F56C6C;
  }
}
</style> 