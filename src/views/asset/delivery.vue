<template>
  <div class="app-container">
    <h2>发运及核收</h2>
    
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="发运单号">
        <el-input v-model="searchForm.deliveryNo" placeholder="请输入发运单号"></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="待发运" value="pending"></el-option>
          <el-option label="运输中" value="shipping"></el-option>
          <el-option label="已送达" value="delivered"></el-option>
          <el-option label="已验收" value="accepted"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" @click="handleCreateDelivery">新建发运单</el-button>
      </el-form-item>
    </el-form>

    <!-- 发运单列表 -->
    <el-table :data="deliveryList" border style="width: 100%">
      <el-table-column prop="deliveryNo" label="发运单号" width="180"></el-table-column>
      <el-table-column prop="fromDept" label="发出部门" width="150"></el-table-column>
      <el-table-column prop="toDept" label="接收部门" width="150"></el-table-column>
      <el-table-column prop="assetCount" label="资产数量" width="100"></el-table-column>
      <el-table-column prop="deliveryDate" label="发运日期" width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="success" 
            v-if="scope.row.status === 'delivered'"
            @click="handleAccept(scope.row)">验收</el-button>
          <el-button size="mini" type="primary" 
            v-if="scope.row.status === 'pending'"
            @click="handleShip(scope.row)">发运</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 发运单详情对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false">
      <el-form :model="deliveryForm" :rules="rules" ref="deliveryForm" label-width="120px" class="delivery-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发运单号" prop="deliveryNo">
              <el-input v-model="deliveryForm.deliveryNo" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发运日期" prop="deliveryDate">
              <el-date-picker
                v-model="deliveryForm.deliveryDate"
                type="date"
                placeholder="选择发运日期"
                style="width: 100%"
                value-format="yyyy-MM-dd">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发出部门" prop="fromDept">
              <el-select v-model="deliveryForm.fromDept" placeholder="请选择发出部门" style="width: 100%">
                <el-option label="信息中心" value="信息中心"></el-option>
                <el-option label="教务处" value="教务处"></el-option>
                <el-option label="图书馆" value="图书馆"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收部门" prop="toDept">
              <el-select v-model="deliveryForm.toDept" placeholder="请选择接收部门" style="width: 100%">
                <el-option label="信息中心" value="信息中心"></el-option>
                <el-option label="教务处" value="教务处"></el-option>
                <el-option label="图书馆" value="图书馆"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="发运资产" prop="assets">
          <div class="asset-selection">
            <div class="asset-table">
              <el-table
                :data="deliveryForm.assets"
                border
                style="width: 100%"
                max-height="300">
                <el-table-column prop="assetNo" label="资产编号" width="150"></el-table-column>
                <el-table-column prop="assetName" label="资产名称" width="200"></el-table-column>
                <el-table-column prop="specification" label="规格型号" width="180"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag size="mini" type="success">可发运</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template slot-scope="scope">
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                      circle
                      @click="removeAsset(scope.$index)">
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="asset-actions">
              <el-button type="primary" icon="el-icon-plus" @click="showAssetSelector">添加资产</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="运输方式" prop="transportType">
          <el-radio-group v-model="deliveryForm.transportType">
            <el-radio label="self">自行配送</el-radio>
            <el-radio label="third">第三方物流</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预计到达日期" prop="expectedDate">
          <el-date-picker
            v-model="deliveryForm.expectedDate"
            type="date"
            placeholder="选择预计到达日期"
            :picker-options="dateOptions"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="备注说明" prop="remarks">
          <el-input
            type="textarea"
            v-model="deliveryForm.remarks"
            :rows="3"
            placeholder="请输入发运相关说明">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDeliveryForm('deliveryForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 资产选择器弹窗 -->
    <el-dialog title="选择资产" :visible.sync="assetSelectorVisible" width="65%" append-to-body>
      <div class="asset-selector-container">
        <el-form :inline="true" :model="assetSearchForm" class="asset-search-form">
          <el-form-item label="资产编号">
            <el-input v-model="assetSearchForm.assetNo" placeholder="请输入资产编号"></el-input>
          </el-form-item>
          <el-form-item label="资产名称">
            <el-input v-model="assetSearchForm.assetName" placeholder="请输入资产名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchAssets">搜索</el-button>
          </el-form-item>
        </el-form>
        
        <el-table
          :data="availableAssets"
          border
          @selection-change="handleAssetSelectionChange"
          height="350">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="assetNo" label="资产编号" width="150"></el-table-column>
          <el-table-column prop="assetName" label="资产名称" width="200"></el-table-column>
          <el-table-column prop="specification" label="规格型号" width="180"></el-table-column>
          <el-table-column prop="department" label="所属部门"></el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assetSelectorVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAssetSelection">确认选择</el-button>
      </div>
    </el-dialog>

    <!-- 验收对话框 -->
    <el-dialog title="资产验收" :visible.sync="acceptDialogVisible" width="50%">
      <el-form :model="acceptForm" label-width="120px">
        <el-form-item label="验收结果">
          <el-radio-group v-model="acceptForm.result">
            <el-radio label="pass">验收通过</el-radio>
            <el-radio label="reject">验收不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收说明">
          <el-input type="textarea" v-model="acceptForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="acceptDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAccept">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetDelivery',
  data() {
    return {
      searchForm: {
        deliveryNo: '',
        status: ''
      },
      deliveryList: [
        {
          deliveryNo: 'FY202403150001',
          fromDept: '信息中心',
          toDept: '教务处',
          assetCount: 3,
          deliveryDate: '2024-03-15',
          status: 'pending',
          statusText: '待发运'
        },
        {
          deliveryNo: 'FY202403150002',
          fromDept: '信息中心',
          toDept: '图书馆',
          assetCount: 2,
          deliveryDate: '2024-03-15',
          status: 'shipping',
          statusText: '运输中'
        },
        {
          deliveryNo: 'FY202403150003',
          fromDept: '教务处',
          toDept: '信息中心',
          assetCount: 1,
          deliveryDate: '2024-03-15',
          status: 'delivered',
          statusText: '已送达'
        }
      ],
      dialogVisible: false,
      dialogTitle: '',
      deliveryForm: {
        deliveryNo: '',
        fromDept: '',
        toDept: '',
        assets: [],
        remarks: ''
      },
      acceptDialogVisible: false,
      acceptForm: {
        result: 'pass',
        description: ''
      },
      rules: {
        fromDept: [{ required: true, message: '请选择发出部门', trigger: 'change' }],
        toDept: [{ required: true, message: '请选择接收部门', trigger: 'change' }],
        assets: [{ required: true, message: '请至少选择一个资产', trigger: 'change' }],
        transportType: [{ required: true, message: '请选择运输方式', trigger: 'change' }],
        expectedDate: [{ required: true, message: '请选择预计到达日期', trigger: 'change' }]
      },
      assetSelectorVisible: false,
      assetSearchForm: {
        assetNo: '',
        assetName: ''
      },
      availableAssets: [
        { assetNo: 'ZC2024001', assetName: '联想笔记本', specification: 'ThinkPad T490', department: '信息中心' },
        { assetNo: 'ZC2024002', assetName: '戴尔显示器', specification: 'P2419H', department: '信息中心' },
        { assetNo: 'ZC2024003', assetName: '惠普打印机', specification: 'M1136', department: '教务处' }
      ],
      selectedAssets: [],
      dateOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      }
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        pending: 'info',
        shipping: 'warning',
        delivered: 'success',
        accepted: ''
      }
      return statusMap[status]
    },
    handleSearch() {
      // 模拟搜索功能
      this.$message.success('搜索成功')
    },
    handleCreateDelivery() {
      this.dialogTitle = '新建发运单'
      this.deliveryForm = {
        deliveryNo: 'FY' + new Date().getTime(),
        fromDept: '',
        toDept: '',
        assets: [],
        remarks: ''
      }
      this.dialogVisible = true
    },
    handleView(row) {
      this.dialogTitle = '查看发运单'
      this.deliveryForm = { ...row }
      this.dialogVisible = true
    },
    handleShip(row) {
      this.$confirm('确认开始发运该批资产?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = 'shipping'
        row.statusText = '运输中'
        this.$message.success('发运成功')
      })
    },
    handleAccept(row) {
      this.acceptDialogVisible = true
      this.currentDelivery = row
    },
    handleSubmit() {
      this.$message.success(this.dialogTitle === '新建发运单' ? '创建成功' : '更新成功')
      this.dialogVisible = false
    },
    submitAccept() {
      if (this.acceptForm.result === 'pass') {
        this.currentDelivery.status = 'accepted'
        this.currentDelivery.statusText = '已验收'
        this.$message.success('验收完成')
      } else {
        this.$message.warning('已拒绝验收')
      }
      this.acceptDialogVisible = false
    },
    showAssetSelector() {
      this.assetSelectorVisible = true
    },
    handleAssetSelectionChange(val) {
      this.selectedAssets = val
    },
    confirmAssetSelection() {
      this.deliveryForm.assets = [...this.deliveryForm.assets, ...this.selectedAssets]
      this.assetSelectorVisible = false
    },
    removeAsset(index) {
      this.deliveryForm.assets.splice(index, 1)
    },
    searchAssets() {
      // 模拟资产搜索
      this.$message.success('搜索成功')
    },
    submitDeliveryForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$message.success(this.dialogTitle === '新建发运单' ? '创建成功' : '更新成功')
          this.dialogVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.demo-form-inline {
  margin-bottom: 20px;
}
.delivery-form {
  padding: 20px;
}
.asset-selection {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 10px;
}
.asset-table {
  margin-bottom: 10px;
}
.asset-actions {
  text-align: center;
  margin-top: 10px;
}
.asset-selector-container {
  .asset-search-form {
    margin-bottom: 15px;
  }
}
.el-form-item {
  margin-bottom: 22px;
}
</style> 