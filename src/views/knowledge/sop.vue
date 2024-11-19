<template>
  <div class="app-container">
    <div v-if="!isEdit">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>标准操作程序(SOP)文档</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="handleAdd">新增SOP</el-button>
        </div>

        <el-table :data="sopList" style="width: 100%">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="scenario" label="适用场景" width="120" />
          <el-table-column prop="tags" label="标签" width="150">
            <template slot-scope="scope">
              <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" style="margin-right: 5px">
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column label="操作" width="200" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 查看对话框 -->
      <el-dialog title="SOP详情" :visible.sync="viewDialogVisible" width="70%" custom-class="sop-dialog">
        <div class="sop-view">
          <div class="sop-header">
            <h2 class="sop-title">{{ currentSop.title }}</h2>
            <div class="sop-meta">
              <span class="update-time">
                <i class="el-icon-time"></i>
                更新时间：{{ currentSop.updateTime }}
              </span>
            </div>
          </div>

          <el-divider></el-divider>

          <div class="sop-info">
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-s-operation"></i>
                适用场景：
              </span>
              <el-tag size="medium" effect="plain" type="success">{{ currentSop.scenario }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="el-icon-collection-tag"></i>
                分类标签：
              </span>
              <el-tag 
                v-for="tag in currentSop.tags" 
                :key="tag" 
                size="small" 
                effect="plain"
                type="info" 
                class="sop-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="sop-content">
            <div class="content-header">
              <i class="el-icon-document-checked"></i>
              操作步骤
            </div>
            <div class="content-body" v-html="currentSop.content"></div>
          </div>

          <div v-if="currentSop.attachments && currentSop.attachments.length" class="sop-attachments">
            <div class="content-header">
              <i class="el-icon-paperclip"></i>
              附件
            </div>
            <el-card shadow="never" class="attachment-list">
              <div v-for="file in currentSop.attachments" :key="file.name" class="attachment-item">
                <i class="el-icon-document"></i>
                <span class="file-name">{{ file.name }}</span>
                <el-button type="text" size="small">下载</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 新增/编辑页面 -->
    <div v-else class="edit-container">
      <el-page-header @back="goBack" :content="isAdd ? '新增SOP文档' : '编辑SOP文档'" />
      
      <el-form :model="sopForm" label-width="100px" :rules="rules" ref="sopForm" class="edit-form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="sopForm.title" placeholder="请输入标题，例如：数据库备份操作指南" />
        </el-form-item>
        
        <el-form-item label="适用场景" prop="scenario">
          <el-select v-model="sopForm.scenario" placeholder="请选择适用场景">
            <el-option label="系统维护" value="系统维护" />
            <el-option label="系统升级" value="系统升级" />
            <el-option label="数据备份" value="数据备份" />
            <el-option label="故障处理" value="故障处理" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="操作步骤" prop="content">
          <editor-wang v-model="sopForm.content" />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="sopForm.attachments"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">可上传文档或图片作为补充说明</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="分类标签">
          <el-tag
            :key="tag"
            v-for="tag in sopForm.tags"
            closable
            :disable-transitions="false"
            @close="handleCloseTag(tag)"
            style="margin-right: 10px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + 新标签
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button @click="handleSaveDraft">保存草稿</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import EditorWang from '@/components/WangEditor'

export default {
  name: 'SopDocs',
  components: {
    EditorWang
  },
  data() {
    return {
      isEdit: false,
      isAdd: true,
      viewDialogVisible: false,
      sopList: [
        {
          id: 1,
          title: '数据库备份操作指南',
          scenario: '数据备份',
          content: '<h4>操作步骤：</h4><ol><li>登录管理平台</li><li>导航到数据库管理模块</li><li>选择需要备份的数据库</li><li>点击"备份"按钮并选择保存路径</li></ol>',
          tags: ['数据库', '备份'],
          attachments: [],
          updateTime: '2024-03-17 10:00:00'
        }
      ],
      currentSop: {},
      sopForm: {
        title: '',
        scenario: '',
        content: '',
        tags: [],
        attachments: []
      },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        scenario: [{ required: true, message: '请选择适用场景', trigger: 'change' }],
        content: [{ required: true, message: '请输入操作步骤', trigger: 'blur' }]
      },
      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    handleAdd() {
      this.isEdit = true
      this.isAdd = true
      this.sopForm = {
        title: '',
        scenario: '',
        content: '',
        tags: [],
        attachments: []
      }
    },
    handleEdit(row) {
      this.isEdit = true
      this.isAdd = false
      this.sopForm = { ...row }
    },
    handleView(row) {
      this.currentSop = { ...row }
      this.viewDialogVisible = true
    },
    goBack() {
      this.isEdit = false
      this.$refs.sopForm?.resetFields()
    },
    handleDelete(row) {
      this.$confirm('确认删除该SOP文档吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.sopList = this.sopList.filter(item => item.id !== row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {})
    },
    handleFileChange(file, fileList) {
      this.sopForm.attachments = fileList
    },
    handleCloseTag(tag) {
      this.sopForm.tags.splice(this.sopForm.tags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      if (this.inputValue && !this.sopForm.tags.includes(this.inputValue)) {
        this.sopForm.tags.push(this.inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    handleSaveDraft() {
      this.$message.success('已保存为草稿')
    },
    handleSubmit() {
      this.$refs.sopForm.validate(valid => {
        if (valid) {
          if (this.isAdd) {
            const newSop = {
              id: this.sopList.length + 1,
              ...this.sopForm,
              updateTime: new Date().toLocaleString()
            }
            this.sopList.unshift(newSop)
          } else {
            const index = this.sopList.findIndex(item => item.id === this.sopForm.id)
            this.sopList[index] = {
              ...this.sopForm,
              updateTime: new Date().toLocaleString()
            }
          }
          this.$message.success(this.isAdd ? '添加成功!' : '更新成功!')
          this.goBack()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin-bottom: 20px;
}
.edit-container {
  padding: 20px;
  background-color: #fff;
}
.edit-form {
  margin-top: 30px;
  max-width: 1000px;
}
.input-new-tag {
  width: 90px;
  margin-right: 10px;
  vertical-align: bottom;
}
.sop-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
  }
}
.sop-view {
  padding: 20px 30px;

  .sop-header {
    .sop-title {
      color: #303133;
      margin: 0 0 15px 0;
      font-size: 22px;
      font-weight: 600;
    }

    .sop-meta {
      color: #909399;
      font-size: 14px;
      
      .update-time {
        i {
          margin-right: 5px;
        }
      }
    }
  }

  .sop-info {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 20px;
    margin: 20px 0;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        color: #606266;
        margin-right: 10px;
        font-weight: 500;
        width: 100px;
        
        i {
          margin-right: 5px;
        }
      }

      .sop-tag {
        margin-right: 8px;
      }
    }
  }

  .sop-content {
    margin: 25px 0;

    .content-header {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .content-body {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      border: 1px solid #EBEEF5;
      
      ::v-deep {
        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          color: #303133;
        }

        ol, ul {
          padding-left: 20px;
          margin: 10px 0;
        }

        li {
          line-height: 1.8;
          margin: 8px 0;
        }
      }
    }
  }

  .sop-attachments {
    margin-top: 25px;

    .content-header {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .attachment-list {
      border-radius: 4px;

      .attachment-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        i {
          color: #909399;
          margin-right: 8px;
        }

        .file-name {
          flex: 1;
          color: #606266;
        }
      }
    }
  }
}
</style> 