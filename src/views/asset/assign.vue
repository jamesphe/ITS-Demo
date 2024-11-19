<template>
  <div class="app-container">
    <h2>资产配发及归还</h2>
    
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="资产编号">
        <el-input v-model="searchForm.assetNo" placeholder="请输入资产编号"></el-input>
      </el-form-item>
      <el-form-item label="资产名称">
        <el-input v-model="searchForm.assetName" placeholder="请输入资产名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="operation-buttons">
      <el-button type="primary" @click="handleBatchAssign">批量配发</el-button>
      <el-button type="success" @click="handleReturn">资产归还</el-button>
    </div>

    <!-- 资产列表 -->
    <el-table 
      :data="assetList" 
      border 
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="assetNo" label="资产编号" width="120"></el-table-column>
      <el-table-column prop="assetName" label="资产名称" width="150"></el-table-column>
      <el-table-column prop="category" label="资产类别" width="120"></el-table-column>
      <el-table-column prop="status" label="使用状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '在用' ? 'success' : 'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="使用部门" width="150"></el-table-column>
      <el-table-column prop="user" label="使用人" width="120"></el-table-column>
      <el-table-column prop="assignDate" label="配发日期" width="120"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button 
            size="mini" 
            type="primary" 
            @click="handleAssignDetail(scope.row)"
            :disabled="scope.row.status === '在用'">配发</el-button>
          <el-button 
            size="mini" 
            type="success" 
            @click="handleReturnDetail(scope.row)"
            :disabled="scope.row.status === '闲置'">归还</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 配发对话框 -->
    <el-dialog title="资产配发" :visible.sync="assignDialogVisible" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="资产编号">
          <span>{{ assignForm.assetNo }}</span>
        </el-form-item>
        <el-form-item label="资产名称">
          <span>{{ assignForm.assetName }}</span>
        </el-form-item>
        <el-form-item label="使用部门">
          <el-select v-model="assignForm.department" placeholder="请选择部门">
            <el-option label="信息中心" value="信息中心"></el-option>
            <el-option label="教务处" value="教务处"></el-option>
            <el-option label="图书馆" value="图书馆"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用人">
          <el-input v-model="assignForm.user" placeholder="请输入使用人"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="assignForm.remarks"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAssign">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 归还对话框 -->
    <el-dialog title="资产归还" :visible.sync="returnDialogVisible" width="500px">
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="资产编号">
          <span>{{ returnForm.assetNo }}</span>
        </el-form-item>
        <el-form-item label="资产名称">
          <span>{{ returnForm.assetName }}</span>
        </el-form-item>
        <el-form-item label="归还状态">
          <el-select v-model="returnForm.condition" placeholder="请选择归还状态">
            <el-option label="完好" value="完好"></el-option>
            <el-option label="损坏" value="损坏"></el-option>
            <el-option label="需维修" value="需维修"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="returnForm.remarks"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="returnDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitReturn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 批量配发对话框 -->
    <el-dialog 
      title="批量资产配发" 
      :visible.sync="batchAssignDialogVisible" 
      width="650px"
      :close-on-click-modal="false"
      custom-class="assign-dialog">
      <el-form :model="batchAssignForm" label-width="100px" class="assign-form">
        <el-form-item label="选中资产">
          <div class="selected-assets-info">
            <div class="selected-count">
              <i class="el-icon-document"></i>
              <span>已选择 {{ selectedAssets.length }} 个资产</span>
            </div>
            <el-table 
              :data="selectedAssets" 
              size="small" 
              border 
              class="selected-table"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
              <el-table-column prop="assetNo" label="资产编号" width="120"></el-table-column>
              <el-table-column prop="assetName" label="资产名称" width="150"></el-table-column>
              <el-table-column prop="category" label="资产类别" min-width="120"></el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="使用部门" required>
          <el-select 
            v-model="batchAssignForm.department" 
            placeholder="请选择部门" 
            style="width: 100%"
            class="custom-select">
            <el-option label="信息中心" value="信息中心"></el-option>
            <el-option label="教务处" value="教务处"></el-option>
            <el-option label="图书馆" value="图书馆"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用人" required>
          <el-input 
            v-model="batchAssignForm.user" 
            placeholder="请输入使用人"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            type="textarea" 
            v-model="batchAssignForm.remarks" 
            rows="3"
            placeholder="请输入备注信息"
            class="custom-textarea">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchAssignDialogVisible = false" plain>取 消</el-button>
        <el-button type="primary" @click="submitBatchAssign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetAssign',
  data() {
    return {
      // 搜索表单
      searchForm: {
        assetNo: '',
        assetName: ''
      },
      // 资产列表数据
      assetList: [
        {
          assetNo: 'ZC2024001',
          assetName: 'ThinkPad笔记本',
          category: '计算机设备',
          status: '在用',
          department: '信息中心',
          user: '张三',
          assignDate: '2024-03-15'
        },
        {
          assetNo: 'ZC2024002',
          assetName: '激光打印机',
          category: '办公设备',
          status: '闲置',
          department: '-',
          user: '-',
          assignDate: '-'
        }
      ],
      // 配发对话框
      assignDialogVisible: false,
      assignForm: {
        assetNo: '',
        assetName: '',
        department: '',
        user: '',
        remarks: ''
      },
      // 归还对话框
      returnDialogVisible: false,
      returnForm: {
        assetNo: '',
        assetName: '',
        condition: '',
        remarks: ''
      },
      // 添加选中的资产列表
      selectedAssets: [],
      // 添加批量配发相关数据
      batchAssignDialogVisible: false,
      batchAssignForm: {
        department: '',
        user: '',
        remarks: ''
      }
    }
  },
  methods: {
    // 搜索
    handleSearch() {
      // 演示用，实际需要调用API
      this.$message.success('搜索成功')
    },
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        assetNo: '',
        assetName: ''
      }
    },
    // 添加选择框相关方法
    handleSelectionChange(val) {
      this.selectedAssets = val
    },
    // 修改批量配发方法
    handleBatchAssign() {
      if (this.selectedAssets.length === 0) {
        this.$message.warning('请选择要配发的资产')
        return
      }

      // 检查选中资产状态
      const invalidAssets = this.selectedAssets.filter(asset => asset.status === '在用')
      if (invalidAssets.length > 0) {
        this.$message.warning('选中的资产中包含已在使用的资产，请重新选择')
        return
      }

      // 重置表单
      this.batchAssignForm = {
        department: '',
        user: '',
        remarks: ''
      }
      
      // 显示批量配发对话框
      this.batchAssignDialogVisible = true
    },
    // 修改批量归还方法
    handleReturn() {
      if (this.selectedAssets.length === 0) {
        this.$message.warning('请选择要归还的资产')
        return
      }
      // 检查选中的资产是否都是可归还状态
      const invalidAssets = this.selectedAssets.filter(asset => asset.status === '闲置')
      if (invalidAssets.length > 0) {
        this.$message.warning('选中的资产中包含未使用的资产，请重新选择')
        return
      }
      this.$message.info('请逐个处理选中资产的归还操作')
    },
    // 配发详情
    handleAssignDetail(row) {
      this.assignForm = {
        assetNo: row.assetNo,
        assetName: row.assetName,
        department: '',
        user: '',
        remarks: ''
      }
      this.assignDialogVisible = true
    },
    // 归还详情
    handleReturnDetail(row) {
      this.returnForm = {
        assetNo: row.assetNo,
        assetName: row.assetName,
        condition: '',
        remarks: ''
      }
      this.returnDialogVisible = true
    },
    // 提交配发
    submitAssign() {
      if (!this.assignForm.department || !this.assignForm.user) {
        this.$message.warning('请填写完整信息')
        return
      }
      // 演示用，实际需要调用API
      this.$message.success('配发成功')
      this.assignDialogVisible = false
      // 更新列表数据
      this.updateAssetStatus('assign')
    },
    // 提交归还
    submitReturn() {
      if (!this.returnForm.condition) {
        this.$message.warning('请选择归还状态')
        return
      }
      // 演示用，实际需要调用API
      this.$message.success('归还成功')
      this.returnDialogVisible = false
      // 更新列表数据
      this.updateAssetStatus('return')
    },
    // 提交批量配发
    submitBatchAssign() {
      // 表单验证
      if (!this.batchAssignForm.department || !this.batchAssignForm.user) {
        this.$message.warning('请填写完整信息')
        return
      }

      // 更新所有选中资产的状态
      this.selectedAssets.forEach(asset => {
        const targetAsset = this.assetList.find(item => item.assetNo === asset.assetNo)
        if (targetAsset) {
          targetAsset.status = '在用'
          targetAsset.department = this.batchAssignForm.department
          targetAsset.user = this.batchAssignForm.user
          targetAsset.assignDate = new Date().toLocaleDateString()
        }
      })

      this.$message.success(`成功配发 ${this.selectedAssets.length} 个资产`)
      this.batchAssignDialogVisible = false
      
      // 清空选择
      this.$refs.table.clearSelection()
    },
    // 更新资产状态（演示用）
    updateAssetStatus(type) {
      const assetNo = type === 'assign' ? this.assignForm.assetNo : this.returnForm.assetNo
      const asset = this.assetList.find(item => item.assetNo === assetNo)
      if (asset) {
        if (type === 'assign') {
          asset.status = '在用'
          asset.department = this.assignForm.department
          asset.user = this.assignForm.user
          asset.assignDate = new Date().toLocaleDateString()
        } else {
          asset.status = '闲置'
          asset.department = '-'
          asset.user = '-'
          asset.assignDate = '-'
        }
      }
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
.operation-buttons {
  margin-bottom: 20px;
}
.selected-assets-info {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.selected-assets-info p {
  margin: 0;
  color: #606266;
}

.assign-dialog {
  border-radius: 8px;
}

.assign-dialog /deep/ .el-dialog__header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.assign-dialog /deep/ .el-dialog__title {
  font-size: 18px;
  font-weight: 500;
}

.assign-dialog /deep/ .el-dialog__body {
  padding: 25px 20px;
}

.assign-form .selected-assets-info {
  background-color: #f8f9fb;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.selected-count {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.selected-count i {
  margin-right: 5px;
  color: #409EFF;
}

.selected-table {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.custom-select /deep/ .el-input__inner,
.custom-input /deep/ .el-input__inner {
  border-radius: 4px;
  height: 36px;
  line-height: 36px;
}

.custom-textarea /deep/ .el-textarea__inner {
  border-radius: 4px;
  padding: 8px 12px;
}

.custom-select /deep/ .el-input__inner:hover,
.custom-input /deep/ .el-input__inner:hover,
.custom-textarea /deep/ .el-textarea__inner:hover {
  border-color: #c0c4cc;
}

.custom-select /deep/ .el-input__inner:focus,
.custom-input /deep/ .el-input__inner:focus,
.custom-textarea /deep/ .el-textarea__inner:focus {
  border-color: #409EFF;
}

.dialog-footer {
  padding: 15px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

.dialog-footer .el-button {
  padding: 9px 20px;
}

.assign-form /deep/ .el-form-item__label {
  font-weight: 500;
}

.assign-form /deep/ .el-form-item__label::before {
  margin-right: 4px;
}

.assign-form /deep/ .el-form-item {
  margin-bottom: 22px;
}

.assign-form /deep/ .el-form-item:last-child {
  margin-bottom: 0;
}
</style> 