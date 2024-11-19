<template>
  <div class="app-container">
    <div class="category-container">
      <!-- 左侧树形分类 -->
      <div class="category-tree">
        <div class="tree-header">
          <el-input
            v-model="filterText"
            placeholder="输入关键字过滤"
            size="small"
            clearable
            prefix-icon="el-icon-search"
          />
        </div>
        <el-tree
          ref="tree"
          :data="categoryData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
          class="custom-tree"
          :highlight-current="true"
        />
      </div>

      <!-- 右侧操作区 -->
      <div class="category-content">
        <div class="operation-bar">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增分类</el-button>
          <el-button type="success" size="small" icon="el-icon-edit" @click="handleEdit" :disabled="!currentNode">编辑分类</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" :disabled="!currentNode">删除分类</el-button>
        </div>

        <!-- 分类详情展示区 -->
        <transition name="fade-transform" mode="out-in">
          <div v-if="currentNode" class="category-detail">
            <el-card class="detail-card hover-shadow">
              <div slot="header" class="card-header">
                <span class="detail-title"><i class="el-icon-info"></i> 分类详情</span>
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="分类名称">
                  <span class="detail-value">{{ currentNode.name }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="分类编码">
                  <el-tag size="small">{{ currentNode.code }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  <i class="el-icon-time"></i> {{ currentNode.createTime || '2024-03-20' }}
                </el-descriptions-item>
                <el-descriptions-item label="排序号">
                  <el-tag type="info" size="small">{{ currentNode.sort || 1 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                  {{ currentNode.remark || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 统计信息卡片 -->
            <div class="statistics-cards">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon">
                        <i class="el-icon-monitor"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-title">设备总数</div>
                        <div class="stat-value">{{ getRandomNumber() }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon green">
                        <i class="el-icon-check"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-title">在用设备</div>
                        <div class="stat-value success">{{ getRandomNumber() }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="hover" class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon orange">
                        <i class="el-icon-warning"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-title">闲置设备</div>
                        <div class="stat-value warning">{{ getRandomNumber() }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 子分类列表 -->
            <el-card class="sub-category-card hover-shadow">
              <div slot="header" class="card-header">
                <span class="detail-title"><i class="el-icon-menu"></i> 子分类列表</span>
              </div>
              <el-table
                v-if="currentNode.children && currentNode.children.length"
                :data="currentNode.children"
                border
                stripe
                highlight-current-row
                style="width: 100%">
                <el-table-column prop="name" label="分类名称">
                  <template slot-scope="scope">
                    <el-link type="primary" :underline="false">{{ scope.row.name }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="分类编码">
                  <template slot-scope="scope">
                    <el-tag size="small">{{ scope.row.code }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="设备数量" align="center" width="120">
                  <template slot-scope="scope">
                    <span class="device-count">{{ getRandomNumber() }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" size="small" icon="el-icon-delete" class="danger-text" @click="handleDelete">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div v-else class="empty-text">
                <i class="el-icon-folder-opened"></i>
                暂无子分类
              </div>
            </el-card>
          </div>
          <div v-else class="empty-content">
            <el-empty description="请选择左侧分类查看详情">
              <i class="el-icon-arrow-left hint-icon"></i>
            </el-empty>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetCategory',
  data() {
    return {
      filterText: '',
      currentNode: null,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        name: '',
        parentId: null,
        code: '',
        sort: 1,
        remark: ''
      },
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      // 模拟数据
      categoryData: [{
        id: 1,
        name: '计算机设备',
        code: 'PC',
        children: [{
          id: 4,
          name: '台式电脑',
          code: 'PC-01'
        }, {
          id: 5,
          name: '笔记本电脑',
          code: 'PC-02'
        }]
      }, {
        id: 2,
        name: '网络设备',
        code: 'NET',
        children: [{
          id: 6,
          name: '路由器',
          code: 'NET-01'
        }, {
          id: 7,
          name: '交换机',
          code: 'NET-02'
        }]
      }, {
        id: 3,
        name: '外设设备',
        code: 'PER',
        children: [{
          id: 8,
          name: '打印机',
          code: 'PER-01'
        }, {
          id: 9,
          name: '扫描仪',
          code: 'PER-02'
        }]
      }]
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleNodeClick(data) {
      this.currentNode = data
    },
    handleAdd() {
      this.dialogTitle = '新增分类'
      this.form = {
        id: null,
        name: '',
        parentId: this.currentNode ? [this.currentNode.id] : null,
        code: '',
        sort: 1,
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit() {
      this.dialogTitle = '编辑分类'
      this.form = {
        id: this.currentNode.id,
        name: this.currentNode.name,
        parentId: null, // 实际应用中需要获取父节点路径
        code: this.currentNode.code,
        sort: this.currentNode.sort || 1,
        remark: this.currentNode.remark || ''
      }
      this.dialogVisible = true
    },
    handleDelete() {
      this.$confirm('确认删除该分类吗？', '提示', {
        type: 'warning'
      }).then(() => {
        // 这里应该调用删除API
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 这里应该调用保存API
          this.$message.success(this.dialogTitle + '成功')
          this.dialogVisible = false
        }
      })
    },
    getRandomNumber() {
      return Math.floor(Math.random() * 100)
    }
  }
}
</script>

<style scoped>
.category-container {
  display: flex;
  height: calc(100vh - 130px);
  background-color: #fff;
  margin: 10px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.category-tree {
  width: 300px;
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
  transition: all 0.3s;
}

.tree-header {
  margin-bottom: 15px;
}

.custom-tree {
  background: transparent;
  transition: all 0.3s;
}

.custom-tree ::v-deep .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

.custom-tree ::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ecf5ff;
  color: #409EFF;
}

.category-content {
  flex: 1;
  padding-left: 20px;
  overflow-y: auto;
}

.operation-bar {
  margin-bottom: 20px;
  padding: 10px;
  background: #f9fafc;
  border-radius: 4px;
}

.operation-bar .el-button {
  margin-right: 10px;
  transition: all 0.3s;
}

.category-detail {
  padding: 10px 0;
}

.hover-shadow {
  transition: all 0.3s;
}

.hover-shadow:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

.detail-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.detail-title i {
  margin-right: 5px;
  color: #409EFF;
}

.detail-value {
  color: #606266;
}

.statistics-cards {
  margin: 20px 0;
}

.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: #409EFF;
}

.stat-icon.green {
  background: #f0f9eb;
}

.stat-icon.green i {
  color: #67c23a;
}

.stat-icon.orange {
  background: #fdf6ec;
}

.stat-icon.orange i {
  color: #e6a23c;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.device-count {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.danger-text {
  color: #f56c6c;
}

.danger-text:hover {
  color: #f78989;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

.empty-text i {
  font-size: 20px;
  margin-right: 5px;
}

.empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  position: relative;
}

.hint-icon {
  font-size: 24px;
  color: #909399;
  position: absolute;
  left: -40px;
  animation: bounce 1s infinite;
}

/* 动画效果 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-10px);
  }
}
</style> 