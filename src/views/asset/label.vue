<template>
  <div class="app-container">
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="header-title">资产标签打印</span>
        <div class="header-extra">
          <el-tag type="info">支持条码/二维码/RFID标签打印</el-tag>
        </div>
      </div>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryForm" class="demo-form-inline search-form">
        <el-form-item label="资产编号">
          <el-input 
            v-model="queryForm.assetCode" 
            placeholder="请输入资产编号"
            prefix-icon="el-icon-document"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="资产类型">
          <el-select 
            v-model="queryForm.assetType" 
            placeholder="请选择资产类型"
            clearable>
            <el-option label="台式电脑" value="desktop">
              <i class="el-icon-monitor"></i> 台式电脑
            </el-option>
            <el-option label="笔记本" value="laptop">
              <i class="el-icon-notebook-2"></i> 笔记本
            </el-option>
            <el-option label="显示器" value="monitor">
              <i class="el-icon-monitor"></i> 显示器
            </el-option>
            <el-option label="打印机" value="printer">
              <i class="el-icon-printer"></i> 打印机
            </el-option>
            <el-option label="网络设备" value="network">
              <i class="el-icon-connection"></i> 网络设备
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="assetCode" label="资产编号" width="120">
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.assetCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assetName" label="资产名称" width="150"></el-table-column>
        <el-table-column prop="assetType" label="资产类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getAssetTypeTag(scope.row.assetType)" size="small">
              {{ scope.row.assetType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="所属部门" width="150"></el-table-column>
        <el-table-column prop="location" label="存放位置" width="150">
          <template slot-scope="scope">
            <i class="el-icon-location"></i>
            {{ scope.row.location }}
          </template>
        </el-table-column>
        <el-table-column label="标签预览" width="120">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              icon="el-icon-view"
              @click="previewLabel(scope.row)">
              预览
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部工具栏 -->
      <div class="table-footer">
        <div class="left-tools">
          <el-button 
            type="primary" 
            icon="el-icon-printer" 
            :disabled="!selectedAssets.length" 
            @click="printLabels">
            批量打印标签
          </el-button>
          <el-select 
            v-model="labelType" 
            class="label-type-select">
            <el-option label="条形码标签" value="barcode">
              <i class="el-icon-tickets"></i> 条形码标签
            </el-option>
            <el-option label="二维码标签" value="qrcode">
              <i class="el-icon-picture-outline"></i> 二维码标签
            </el-option>
            <el-option label="RFID标签" value="rfid">
              <i class="el-icon-cpu"></i> RFID标签
            </el-option>
          </el-select>
        </div>
        <div class="right-tools">
          <el-tag type="info">已选择 {{ selectedAssets.length }} 项</el-tag>
        </div>
      </div>

      <!-- 标签预览弹窗 -->
      <el-dialog 
        title="标签预览" 
        :visible.sync="previewVisible" 
        width="500px"
        custom-class="preview-dialog">
        <div class="label-preview">
          <div class="preview-actions">
            <el-radio-group v-model="labelSize" size="small">
              <el-radio-button label="small">小标签</el-radio-button>
              <el-radio-button label="medium">中标签</el-radio-button>
              <el-radio-button label="large">大标签</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="preview-content" :class="labelSize">
            <div class="preview-header">
              <div class="logo-container">
                <img :src="schoolLogo" class="school-logo" alt="校徽">
              </div>
              <div class="title-container">
                <div class="school-name">XX大学</div>
                <div class="dept-name">资产管理处</div>
              </div>
            </div>

            <div class="asset-info">
              <div class="info-row">
                <div class="info-item">
                  <span class="label">资产编号</span>
                  <span class="value">{{ currentAsset.assetCode }}</span>
                </div>
                <div class="info-item">
                  <span class="label">资产类型</span>
                  <span class="value">
                    <el-tag size="mini" :type="getAssetTypeTag(currentAsset.assetType)">
                      {{ currentAsset.assetType }}
                    </el-tag>
                  </span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="label">资产名称</span>
                  <span class="value">{{ currentAsset.assetName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">所属部门</span>
                  <span class="value">{{ currentAsset.department }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="label">存放位置</span>
                  <span class="value">{{ currentAsset.location }}</span>
                </div>
                <div class="info-item">
                  <span class="label">打印日期</span>
                  <span class="value">{{ getCurrentDate() }}</span>
                </div>
              </div>
            </div>

            <div class="code-container">
              <div class="code-area">
                <el-image 
                  :src="getCodeImage()"
                  fit="contain"
                  class="code-image">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="code-type">{{ getLabelTypeText() }}</div>
              </div>
              <div class="code-tips">
                <i class="el-icon-warning-outline"></i>
                扫描二维码可查看详细信息
              </div>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="previewVisible = false" icon="el-icon-close">关闭</el-button>
          <el-button type="success" @click="downloadLabel" icon="el-icon-download">下载</el-button>
          <el-button type="primary" @click="printSingleLabel" icon="el-icon-printer">打印</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'LabelPrint',
  data() {
    return {
      queryForm: {
        assetCode: '',
        assetType: ''
      },
      loading: false,
      tableData: [
        {
          assetCode: 'PC202401001',
          assetName: 'ThinkPad X1',
          assetType: '笔记本',
          department: '信息中心',
          location: '图书馆501'
        },
        {
          assetCode: 'PC202401002',
          assetName: 'Dell OptiPlex',
          assetType: '台式电脑',
          department: '教务处',
          location: '行政楼302'
        }
      ],
      selectedAssets: [],
      labelType: 'qrcode',
      previewVisible: false,
      currentAsset: {},
      labelSize: 'medium',
      schoolLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0iIzQwOUVGRiIgZD0iTTUwIDVMOTAgMjVWNzVMNTAgOTVMMTAgNzVMODIuNjggNjguMzJWMzEuNjhMNTAgMTVaIi8+PHBhdGggZmlsbD0iIzQwOUVGRiIgZD0iTTUwIDI1TDcwIDM1VjY1TDUwIDc1TDMwIDY1VjM1TDUwIDI1Wk01MCAzNUwzNyA0MS42N1Y1OC4zM0w1MCA2NUw2MyA1OC4zM1Y0MS42N0w1MCAzNVoiLz48Y2lyY2xlIGZpbGw9IiM0MDlFRkYiIGN4PSI1MCIgY3k9IjUwIiByPSI1Ii8+PC9zdmc+',
      qrCodeImages: {
        barcode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIyMCIgeT0iMTAiIHdpZHRoPSIyIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMzAiIHk9IjEwIiB3aWR0aD0iNiIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjQwIiB5PSIxMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI1MCIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iNjAiIHk9IjEwIiB3aWR0aD0iNiIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjcwIiB5PSIxMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI4MCIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iOTAiIHk9IjEwIiB3aWR0aD0iNiIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==',
        qrcode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjkwIiB5PSI5MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjAiIHk9IjEyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMzUiIHk9IjM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMzUiIHk9IjM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIzNSIgeT0iMTM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
        rfid: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIGQ9Ik0yMCwyMCBhODAsODAgMCAxLDAgMTYwLDAgYTgwLDgwIDAgMSwwIC0xNjAsMCIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBkPSJNNDAsNDAgYTYwLDYwIDAgMSwwIDEyMCwwIGE2MCw2MCAwIDEsMCAtMTIwLDAiLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgZD0iTTYwLDYwIGE0MCw0MCAwIDEsMCA4MCwwIGE0MCw0MCAwIDEsMCAtODAsMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAiIGZpbGw9IiMwMDAiLz48L3N2Zz4='
      }
    }
  },
  methods: {
    handleSearch() {
      this.loading = true
      // 模拟搜索延迟
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    resetForm() {
      this.queryForm = {
        assetCode: '',
        assetType: ''
      }
    },
    handleSelectionChange(val) {
      this.selectedAssets = val
    },
    previewLabel(row) {
      this.currentAsset = row
      this.previewVisible = true
    },
    printLabels() {
      this.$message.success(`已发送${this.selectedAssets.length}个标签至打印队列`)
    },
    printSingleLabel() {
      this.$message.success('已发送标签至打印队列')
      this.previewVisible = false
    },
    getCodeImage() {
      return this.qrCodeImages[this.labelType]
    },
    getAssetTypeTag(type) {
      const tags = {
        '台式电脑': 'primary',
        '笔记本': 'success',
        '显示器': 'info',
        '打印机': 'warning',
        '网络设备': 'danger'
      }
      return tags[type] || ''
    },
    getCurrentDate() {
      return new Date().toLocaleString()
    },
    getLabelTypeText() {
      const texts = {
        barcode: '条形码',
        qrcode: '二维码',
        rfid: 'RFID'
      }
      return texts[this.labelType]
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-extra {
  display: flex;
  align-items: center;
}

.search-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.table-footer {
  margin-top: 20px;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebeef5;
}

.left-tools {
  display: flex;
  align-items: center;
  gap: 15px;
}

.label-type-select {
  width: 180px;
}

.preview-dialog {
  border-radius: 8px;
}

.label-preview {
  padding: 20px;
}

.preview-content {
  border: 2px dashed #dcdfe6;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
}

.preview-header {
  text-align: center;
  margin-bottom: 20px;
}

.school-logo {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.school-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.asset-info {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  margin: 8px 0;
  line-height: 24px;
}

.info-item .label {
  color: #606266;
  width: 80px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.code-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.code-image {
  width: 150px;
  height: 150px;
  padding: 10px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f5f7fa;
}

.image-slot i {
  font-size: 30px;
  color: #909399;
}

.code-type {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

/* 添加一些动画效果 */
.el-button {
  transition: all 0.3s;
}

.el-card {
  transition: all 0.3s;
}

.preview-content {
  transition: all 0.3s;
}

.preview-content:hover {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style> 