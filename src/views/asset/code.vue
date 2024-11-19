<template>
  <div class="app-container">
    <div class="page-header">
      <h2>资产编码管理</h2>
      <div class="header-desc">统一管理IT资产编码，提升资产管理效率</div>
    </div>
    
    <!-- 编码规则配置卡片 -->
    <el-card class="box-card mb-20 hover-shadow">
      <div slot="header" class="card-header">
        <span><i class="el-icon-setting"></i> 编码规则配置</span>
      </div>
      <el-form :model="codeRule" label-width="120px" class="rule-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="前缀">
              <el-input v-model="codeRule.prefix" style="width: 200px" placeholder="如：IT">
                <template slot="prepend">固定前缀</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流水号位数">
              <el-input-number v-model="codeRule.serialLength" :min="4" :max="8" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产类型">
              <el-checkbox v-model="codeRule.includeType">包含资产类型代码</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门代码">
              <el-checkbox v-model="codeRule.includeDept">包含部门代码</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" icon="el-icon-check" @click="saveCodeRule">保存规则</el-button>
          <el-button icon="el-icon-view" @click="previewCode">预览编码</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量生成编码 -->
    <el-card class="box-card mb-20 hover-shadow">
      <div slot="header" class="card-header">
        <span><i class="el-icon-plus"></i> 批量生成编码</span>
      </div>
      <el-form :inline="true" :model="generateForm" class="generate-form">
        <el-form-item label="资产类型">
          <el-select v-model="generateForm.assetType" placeholder="请选择">
            <el-option label="台式电脑" value="PC">
              <i class="el-icon-monitor"></i> 台式电脑
            </el-option>
            <el-option label="笔记本" value="NB">
              <i class="el-icon-notebook-1"></i> 笔记本
            </el-option>
            <el-option label="服务器" value="SV">
              <i class="el-icon-cpu"></i> 服务器
            </el-option>
            <el-option label="网络设备" value="NT">
              <i class="el-icon-connection"></i> 网络设备
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用部门">
          <el-select v-model="generateForm.department" placeholder="请选择">
            <el-option label="信息中心" value="IT" />
            <el-option label="教务处" value="ED" />
            <el-option label="图书馆" value="LB" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量">
          <el-input-number v-model="generateForm.count" :min="1" :max="100" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="generateCodes">生成编码</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 编码列表 -->
    <el-card class="box-card hover-shadow">
      <div slot="header" class="card-header">
        <span><i class="el-icon-document"></i> 编码列表</span>
        <div class="header-operations">
          <el-input
            v-model="search"
            style="width: 200px; margin-right: 10px"
            placeholder="请输入编码搜索"
            size="small"
            prefix-icon="el-icon-search"
            clearable
          />
          <el-button type="primary" size="small" icon="el-icon-download" @click="exportCodes">
            导出
          </el-button>
        </div>
      </div>
      <el-table 
        :data="filteredCodes" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        stripe
      >
        <el-table-column prop="code" label="资产编码" width="180">
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assetType" label="资产类型" width="120" />
        <el-table-column prop="department" label="使用部门" width="120" />
        <el-table-column prop="createTime" label="生成时间" width="180" />
        <el-table-column prop="status" label="使用状态" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '未使用' ? 'success' : 'info'"
              effect="dark"
              size="medium"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AssetCode',
  data() {
    return {
      codeRule: {
        prefix: 'IT',
        includeType: true,
        includeDept: true,
        serialLength: 6
      },
      generateForm: {
        assetType: '',
        department: '',
        count: 1
      },
      search: '',
      assetTypeMap: {
        'PC': '台式电脑',
        'NB': '笔记本',
        'SV': '服务器',
        'NT': '网络设备'
      },
      departmentMap: {
        'IT': '信息中心',
        'ED': '教务处',
        'LB': '图书馆'
      },
      codes: [
        {
          code: 'IT-PC-IT-000001',
          assetType: '台式电脑',
          department: '信息中心',
          createTime: '2024-03-20 10:00:00',
          status: '未使用'
        },
        {
          code: 'IT-NB-ED-000002',
          assetType: '笔记本',
          department: '教务处',
          createTime: '2024-03-20 10:00:00',
          status: '已使用'
        }
      ]
    }
  },
  computed: {
    filteredCodes() {
      return this.codes.filter(code =>
        code.code.toLowerCase().includes(this.search.toLowerCase())
      )
    }
  },
  methods: {
    saveCodeRule() {
      this.$message.success('编码规则保存成功')
    },
    previewCode() {
      let preview = this.codeRule.prefix
      if (this.codeRule.includeType) preview += '-XX'
      if (this.codeRule.includeDept) preview += '-YY'
      preview += '-' + '0'.repeat(this.codeRule.serialLength)
      this.$alert(preview, '编码预览', {
        confirmButtonText: '确定'
      })
    },
    generateCodes() {
      const newCodes = []
      for (let i = 0; i < this.generateForm.count; i++) {
        newCodes.push({
          code: `IT-${this.generateForm.assetType}-${this.generateForm.department}-${String(
            this.codes.length + i + 1
          ).padStart(6, '0')}`,
          assetType: this.assetTypeMap[this.generateForm.assetType],
          department: this.departmentMap[this.generateForm.department],
          createTime: new Date().toLocaleString(),
          status: '未使用'
        })
      }
      this.codes.unshift(...newCodes)
      this.$message.success(`成功生成 ${this.generateForm.count} 个编码`)
    },
    exportCodes() {
      this.$message.success('编码导出成功')
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.mb-20 {
  margin-bottom: 20px;
}

.box-card {
  margin-top: 10px;
  border-radius: 8px;
}

.hover-shadow {
  transition: all 0.3s;
}

.hover-shadow:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
}

.card-header i {
  margin-right: 8px;
}

.header-operations {
  display: flex;
  align-items: center;
}

.rule-form {
  padding: 20px 0;
}

.generate-form {
  padding: 10px 0;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-select {
  width: 180px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-tag) {
  border-radius: 4px;
}

.el-input-number {
  width: 180px;
}
</style> 