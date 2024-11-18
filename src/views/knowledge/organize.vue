<template>
  <div class="knowledge-organize">
    <el-card>
      <div slot="header">
        <span>知识库管理</span>
        <el-button style="float: right" type="primary" size="small" @click="handleAdd">
          新建文档
        </el-button>
      </div>
      
      <el-table :data="knowledgeList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { knowledgeData } from '@/mock'

export default {
  name: 'KnowledgeOrganize',
  data() {
    return {
      knowledgeList: knowledgeData
    }
  },
  methods: {
    handleAdd() {
      this.$message.success('点击了新建文档')
    },
    handleEdit(row) {
      this.$message.success(`编辑文档：${row.title}`)
    },
    handleDelete(row) {
      this.$confirm('确认删除该文档吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success(`删除文档：${row.title}`)
      })
    }
  }
}
</script> 