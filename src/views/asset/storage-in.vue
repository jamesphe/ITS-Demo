<template>
  <div class="app-container">
    <div class="page-header">
      <h2><i class="el-icon-box"></i> 资产入库</h2>
    </div>
    
    <!-- 扫描输入区 -->
    <el-card class="scan-area" shadow="hover">
      <div slot="header" class="card-header">
        <span><i class="el-icon-position"></i> 资产扫描录入</span>
        <el-tooltip content="支持扫码枪扫描或手动输入资产标签" placement="right">
          <i class="el-icon-question help-icon"></i>
        </el-tooltip>
      </div>
      <el-input
        v-model="scanCode"
        placeholder="请扫描或输入资产标签..."
        @keyup.enter.native="handleScan"
        clearable
        class="scan-input"
      >
        <el-button slot="append" type="primary" icon="el-icon-position" @click="handleScan">扫描</el-button>
      </el-input>
    </el-card>

    <!-- 入库表单 -->
    <el-card class="form-area" shadow="hover">
      <div slot="header" class="card-header">
        <span><i class="el-icon-document"></i> 入库信息</span>
        <el-button type="primary" icon="el-icon-check" @click="handleSubmit">
          确认入库
        </el-button>
      </div>
      
      <el-form ref="form" :model="form" label-width="100px" class="storage-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产编号">
              <el-input v-model="form.assetNo" placeholder="系统自动生成"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产类别">
              <el-select v-model="form.category" placeholder="请选择">
                <el-option label="计算机设备" value="computer"></el-option>
                <el-option label="网络设备" value="network"></el-option>
                <el-option label="外部设备" value="peripheral"></el-option>
                <el-option label="办公设备" value="office"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产名称">
              <el-input v-model="form.name" placeholder="请输入资产名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="form.model" placeholder="请输入规格型号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产厂商">
              <el-input v-model="form.manufacturer" placeholder="请输入生产厂商"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购日期">
              <el-date-picker
                v-model="form.purchaseDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价格">
              <el-input v-model="form.price" type="number" placeholder="请输入采购价格">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保修期限">
              <el-input v-model="form.warranty" type="number" placeholder="请输入保修期限">
                <template slot="append">年</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="存放位置">
          <el-cascader
            v-model="form.location"
            :options="locationOptions"
            placeholder="请选择存放位置"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            type="textarea"
            v-model="form.remarks"
            placeholder="请输入备注信息"
            :rows="2"
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'StorageIn',
  data() {
    return {
      scanCode: '',
      form: {
        assetNo: 'IT' + new Date().getTime(),
        category: '',
        name: '',
        model: '',
        manufacturer: '',
        purchaseDate: '',
        price: '',
        warranty: '',
        location: [],
        remarks: ''
      },
      locationOptions: [{
        value: 'jxl',
        label: '教学楼',
        children: [{
          value: 'jxl-1',
          label: '第一教学楼',
          children: [{
            value: '101',
            label: '101机房'
          }, {
            value: '102',
            label: '102机房'
          }]
        }]
      }, {
        value: 'xzl',
        label: '行政楼',
        children: [{
          value: 'xzl-1',
          label: '一楼',
          children: [{
            value: 'office1',
            label: '办公室1'
          }]
        }]
      }]
    }
  },
  methods: {
    handleScan() {
      if (!this.scanCode) {
        this.$message.warning('请输入或扫描资产标签')
        return
      }
      // 模拟扫描后的处理
      this.$message.success('扫描成功：' + this.scanCode)
      // 这里可以添加扫描后的业务逻辑
      this.scanCode = ''
    },
    handleSubmit() {
      // 模拟提交
      this.$message.success('资产入库成功！')
      this.form = {
        assetNo: 'IT' + new Date().getTime(),
        category: '',
        name: '',
        model: '',
        manufacturer: '',
        purchaseDate: '',
        price: '',
        warranty: '',
        location: [],
        remarks: ''
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ebeef5;
}

.page-header h2 {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.page-header h2 i {
  margin-right: 8px;
  font-size: 24px;
  color: #409EFF;
}

.scan-area {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.form-area {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 500;
}

.card-header span {
  display: flex;
  align-items: center;
}

.card-header i {
  margin-right: 5px;
}

.help-icon {
  color: #909399;
  font-size: 16px;
  margin-left: 8px;
  cursor: pointer;
}

.help-icon:hover {
  color: #409EFF;
}

.scan-input {
  width: 100%;
}

.scan-input :deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
}

.scan-input :deep(.el-input-group__append) {
  background-color: #409EFF;
  border-color: #409EFF;
  color: white;
}

.scan-input :deep(.el-input-group__append:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.storage-form {
  padding: 20px 20px 0;
}

.storage-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.storage-form :deep(.el-input__inner),
.storage-form :deep(.el-textarea__inner) {
  transition: all 0.3s;
}

.storage-form :deep(.el-input__inner:hover),
.storage-form :deep(.el-textarea__inner:hover) {
  border-color: #409EFF;
}

.storage-form :deep(.el-select),
.storage-form :deep(.el-cascader) {
  width: 100%;
}

.storage-form :deep(.el-date-editor) {
  width: 100% !important;
}

/* 添加响应式布局支持 */
@media screen and (max-width: 768px) {
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .el-col {
    width: 100% !important;
  }
}

/* 添加卡片悬停效果 */
.el-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

/* 添加表单项动画效果 */
.el-form-item {
  transition: all 0.3s ease;
}

.el-form-item:hover {
  transform: translateX(5px);
}
</style> 