<template>
  <div class="knowledge-collect">
    <el-card>
      <div slot="header">
        <span>知识采集</span>
        <el-button-group style="float: right">
          <el-button type="primary" size="small" @click="handleImportEmail">
            邮件导入
          </el-button>
          <el-button type="primary" size="small" @click="handleCrawlWeb">
            网页抓取
          </el-button>
        </el-button-group>
      </div>

      <el-table :data="collectList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" @click="handleProcess(scope.row)">处理</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { collectData } from '@/mock'

export default {
  name: 'KnowledgeCollect',
  data() {
    return {
      collectList: collectData
    }
  },
  methods: {
    handleImportEmail() {
      this.$message.success('开始导入邮件')
    },
    handleCrawlWeb() {
      this.$message.success('开始抓取网页')
    },
    handleProcess(row) {
      this.$message.success(`处理文档：${row.title}`)
    },
    handleDelete(row) {
      this.$confirm('确认删除该记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success(`删除记录：${row.title}`)
      })
    }
  }
}
</script> 