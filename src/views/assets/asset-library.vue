<template>
  <div class="asset-library">
    <el-card>
      <div slot="header">
        <span>资源库</span>
        <el-button style="float: right" type="primary" size="small" @click="handleUpload">
          上传资源
        </el-button>
      </div>

      <el-table :data="assetList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'image' ? 'success' : 'primary'">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handlePreview(scope.row)">预览</el-button>
            <el-button type="text" @click="handleDownload(scope.row)">下载</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { assetData } from '@/mock'

export default {
  name: 'AssetLibrary',
  data() {
    return {
      assetList: assetData
    }
  },
  methods: {
    handleUpload() {
      this.$message.success('触发上传功能')
    },
    handlePreview(row) {
      this.$message.success(`预览文件：${row.name}`)
    },
    handleDownload(row) {
      this.$message.success(`下载文件：${row.name}`)
    },
    handleDelete(row) {
      this.$confirm('确认删除该资源吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success(`删除资源：${row.name}`)
      })
    }
  }
}
</script> 