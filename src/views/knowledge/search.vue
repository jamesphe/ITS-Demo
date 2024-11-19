<template>
  <div class="app-container">
    <div class="search-header">
      <h2 class="page-title">知识搜索</h2>
      <p class="search-subtitle">海量知识库资源，一搜即得</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-autocomplete
        v-model="searchKeyword"
        :fetch-suggestions="querySearch"
        placeholder="请输入关键词搜索"
        :trigger-on-focus="true"
        @select="handleSelect"
        class="search-input"
        :popper-class="'my-autocomplete'"
      >
        <template slot="prepend">
          <el-select v-model="searchType" placeholder="请选择" size="small">
            <el-option label="全部" value="all">
              <i class="el-icon-document" /> 全部
            </el-option>
            <el-option label="文档" value="doc">
              <i class="el-icon-document" /> 文档
            </el-option>
            <el-option label="解决方案" value="solution">
              <i class="el-icon-success" /> 解决方案
            </el-option>
            <el-option label="知识库" value="knowledge">
              <i class="el-icon-collection" /> 知识库
            </el-option>
          </el-select>
        </template>
        <el-button slot="append" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <template slot-scope="{ item }">
          <div class="suggestion-item">
            <i class="el-icon-search" />
            <span class="suggestion-value">{{ item.value }}</span>
          </div>
        </template>
      </el-autocomplete>

      <!-- 高级搜索 -->
      <el-link type="primary" class="advanced-search" @click="showAdvanced = !showAdvanced">
        <i :class="showAdvanced ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        {{ showAdvanced ? '收起高级搜索' : '展开高级搜索' }}
      </el-link>
      
      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-options">
          <el-form :inline="true" :model="advancedForm" class="demo-form-inline">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="advancedForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
              />
            </el-form-item>
            <el-form-item label="分类">
              <el-select v-model="advancedForm.category" placeholder="请选择分类">
                <el-option label="技术文档" value="tech">
                  <i class="el-icon-document" /> 技术文档
                </el-option>
                <el-option label="操作手册" value="manual">
                  <i class="el-icon-notebook-1" /> 操作手册
                </el-option>
                <el-option label="常见问题" value="faq">
                  <i class="el-icon-question" /> 常见问题
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 搜索结果 -->
    <div class="search-result" v-if="searchResults.length > 0">
      <div class="result-summary">找到 {{ searchResults.length }} 条相关结果</div>
      <el-card v-for="item in searchResults" 
               :key="item.id" 
               class="result-item"
               shadow="hover"
               :body-style="{ padding: '20px' }">
        <div class="result-title">
          <h3>{{ item.title }}</h3>
          <div class="result-tags">
            <el-tag size="small" :type="getTagType(item.category)">{{ item.category }}</el-tag>
            <el-tag size="small" type="info" v-if="item.isUpdated">最近更新</el-tag>
          </div>
        </div>
        <p class="result-content">{{ item.content }}</p>
        
        <!-- 文档信息与操作区 -->
        <div class="result-actions">
          <div class="result-meta">
            <el-tooltip content="创建时间" placement="top">
              <span><i class="el-icon-date" /> {{ item.createTime }}</span>
            </el-tooltip>
            <el-tooltip content="浏览次数" placement="top">
              <span><i class="el-icon-view" /> {{ item.views || 0 }}</span>
            </el-tooltip>
            <el-tooltip content="作者" placement="top">
              <span><i class="el-icon-user" /> {{ item.author }}</span>
            </el-tooltip>
            <el-tooltip content="评论数" placement="top">
              <span><i class="el-icon-chat-dot-square" /> {{ item.comments || 0 }}</span>
            </el-tooltip>
          </div>
          
          <div class="action-buttons">
            <el-tooltip content="编辑文档" placement="top" v-if="item.canEdit">
              <el-button type="text" @click="handleEdit(item)" class="action-button">
                <i class="el-icon-edit" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看评论" placement="top">
              <el-button type="text" @click="showComments(item)" class="action-button">
                <i class="el-icon-chat-dot-square" />
              </el-button>
            </el-tooltip>
            <el-dropdown trigger="click" @command="handleMoreAction">
              <el-button type="text" class="action-button">
                <i class="el-icon-more" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="suggest">
                  <i class="el-icon-edit-outline" /> 提出建议
                </el-dropdown-item>
                <el-dropdown-item command="report">
                  <i class="el-icon-warning-outline" /> 报告问题
                </el-dropdown-item>
                <el-dropdown-item command="share">
                  <i class="el-icon-share" /> 分享
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>

        <!-- 评论区域 -->
        <div v-show="item.showComments" class="comments-section">
          <el-divider content-position="left">评论区</el-divider>
          
          <!-- 评论列表 -->
          <div class="comment-list" v-if="item.commentList && item.commentList.length">
            <div v-for="comment in item.commentList" :key="comment.id" class="comment-item">
              <el-avatar :size="32" :src="comment.avatar"></el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 添加评论 -->
          <div class="comment-input">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="2"
              placeholder="写下你的评论..."
            />
            <div class="comment-buttons">
              <el-button size="small" @click="item.showComments = false">取消</el-button>
              <el-button type="primary" size="small" @click="submitComment(item)">发表评论</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 无结果显示 -->
    <el-empty v-else-if="hasSearched" 
              description="暂无搜索结果" 
              :image-size="200">
      <template #description>
        <p>暂无搜索结果</p>
        <p class="empty-tips">建议：</p>
        <ul class="empty-suggestions">
          <li>检查输入的关键词是否正确</li>
          <li>尝试使用其他相关关键词</li>
          <li>适当减少筛选条件</li>
        </ul>
      </template>
    </el-empty>

    <!-- 建议反馈对话框 -->
    <el-dialog
      title="提出建议"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="建议类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择建议类型">
            <el-option label="内容更新" value="update" />
            <el-option label="内容纠错" value="correction" />
            <el-option label="建议补充" value="supplement" />
          </el-select>
        </el-form-item>
        <el-form-item label="建议内容">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的建议"
            v-model="feedbackForm.content">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitFeedback">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeSearch',
  data() {
    return {
      searchKeyword: '',
      searchType: 'all',
      showAdvanced: false,
      hasSearched: false,
      advancedForm: {
        dateRange: '',
        category: ''
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      searchResults: [
        {
          id: 1,
          title: 'Vue.js 开发指南',
          content: '这是一份详细的Vue.js开发指南，包含了Vue.js的基础知识和进阶技巧...',
          category: '技术文档',
          createTime: '2024-03-20',
          views: 156,
          author: '张三',
          comments: 5,
          isUpdated: true,
          canEdit: true,
          showComments: false,
          commentList: [
            {
              id: 1,
              author: '李四',
              avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
              content: '这篇文档非常详细，对我帮助很大！',
              time: '2024-03-21 14:30'
            }
          ]
        }
        // ... 其他搜索结果
      ],
      dialogVisible: false,
      newComment: '',
      feedbackForm: {
        type: '',
        content: ''
      },
      suggestions: [
        { value: 'Vue.js 开发指南' },
        { value: '系统部署文档' },
        { value: '常见问题解答' },
        { value: '网络故障排查' }
      ]
    }
  },
  methods: {
    querySearch(queryString, cb) {
      const results = queryString
        ? this.suggestions.filter(item => {
          return item.value.toLowerCase().includes(queryString.toLowerCase())
        })
        : this.suggestions
      cb(results)
    },
    handleSelect(item) {
      this.searchKeyword = item.value
      this.handleSearch()
    },
    handleSearch() {
      this.hasSearched = true
      this.searchResults = [
        {
          id: 1,
          title: 'Vue.js 开发指南',
          content: '这是一份详细的Vue.js开发指南，包含了Vue.js的基础知识和进阶技巧...',
          category: '技术文档',
          createTime: '2024-03-20',
          views: 156,
          author: '张三',
          comments: 5,
          isUpdated: true,
          canEdit: true,
          showComments: false,
          commentList: [
            {
              id: 1,
              author: '李四',
              avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
              content: '这篇文档非常详细，对我帮助很大！',
              time: '2024-03-21 14:30'
            }
          ]
        },
        {
          id: 2,
          title: '系统部署文档',
          content: '本文档详细介绍了系统部署的步骤和注意事项...',
          category: '操作手册',
          createTime: '2024-03-19',
          views: 89,
          author: '王五',
          comments: 0,
          isUpdated: false,
          canEdit: false,
          showComments: false,
          commentList: []
        }
      ]
    },
    getTagType(category) {
      const types = {
        '技术文档': 'primary',
        '操作手册': 'success',
        '常见问题': 'warning'
      }
      return types[category] || 'info'
    },
    handleEdit(item) {
      this.$message.success('进入编辑模式')
      // 实际项目中跳转到编辑页面
    },
    showComments(item) {
      item.showComments = !item.showComments
    },
    handleMoreAction(command) {
      switch (command) {
        case 'suggest':
          this.dialogVisible = true
          break
        case 'report':
          this.$message.info('问题已记录，我们会尽快处理')
          break
        case 'share':
          this.$message.success('分享链接已复制到剪贴板')
          break
      }
    },
    submitComment(item) {
      if (!this.newComment.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }
      // 模拟添加评论
      item.commentList.unshift({
        id: Date.now(),
        author: '当前用户',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        content: this.newComment,
        time: new Date().toLocaleString()
      })
      this.newComment = ''
      this.$message.success('评论成功')
    },
    submitFeedback() {
      if (!this.feedbackForm.content.trim()) {
        this.$message.warning('请输入建议内容')
        return
      }
      this.$message.success('感谢您的建议，我们会认真考虑')
      this.dialogVisible = false
      this.feedbackForm.content = ''
      this.feedbackForm.type = ''
    }
  }
}
</script>

<style scoped>
/* 整体容器样式优化 */
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 头部区域优化 */
.search-header {
  text-align: center;
  margin: 0 auto 20px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e0f2ff 0%, #f0f7ff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  max-width: 1200px;
}

.page-title {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 600;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.search-subtitle {
  color: #5a6d7e;
  font-size: 16px;
  opacity: 0.8;
}

/* 搜索区域优化 */
.search-container {
  max-width: 800px;
  margin: -30px auto 30px;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

/* 搜索框样式优化 */
.search-input {
  width: 100%;
}

.search-input :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
}

.search-input :deep(.el-input-group__prepend) {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-right: none;
  padding: 0 15px;
  border-radius: 8px 0 0 8px;
}

.search-input :deep(.el-input-group__append) {
  padding: 0;
  border: none;
  background: transparent;
}

.search-input :deep(.el-button) {
  height: 48px;
  padding: 0 25px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #409EFF 0%, #2e88ff 100%);
  color: #ffffff;
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.search-input :deep(.el-button:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
  transform: translateX(2px);
  box-shadow: -2px 0 8px rgba(64, 158, 255, 0.2);
}

.search-input :deep(.el-button:active) {
  background: linear-gradient(135deg, #3a8ee6 0%, #2979e2 100%);
  transform: translateX(0);
}

.search-input :deep(.el-button i) {
  font-size: 18px;
  margin-right: 4px;
}

/* 搜索类型选择框样式优化 */
.search-input :deep(.el-select) {
  width: 120px;
}

.search-input :deep(.el-select .el-input__inner) {
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
}

.search-input :deep(.el-select .el-input.is-focus .el-input__inner) {
  box-shadow: none;
}

/* 高级搜索区域优化 */
.advanced-search {
  display: inline-block;
  padding: 6px 12px;
  margin: 15px 0;
  font-size: 14px;
  color: #409EFF;
  border-radius: 15px;
  background: rgba(64, 158, 255, 0.08);
}

.advanced-options {
  margin-top: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

/* 搜索结果区域优化 */
.search-result {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.result-summary {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  padding: 0 5px;
}

.result-item {
  margin-bottom: 20px;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* 结果标题区域优化 */
.result-title {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.result-title h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

/* 标签样式优化 */
.result-tags :deep(.el-tag) {
  margin-left: 8px;
  border-radius: 4px;
  font-weight: normal;
}

/* 内容区域优化 */
.result-content {
  color: #5a6d7e;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
}

/* 元信息区域优化 */
.result-actions {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.result-meta span {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 操作按钮优化 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px;
  height: 28px;
  width: 28px;
  border-radius: 4px;
}

/* 评论区域优化 */
.comments-section {
  margin-top: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.comment-item {
  padding: 15px;
  margin-bottom: 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .search-header {
    padding: 30px 15px;
    margin-bottom: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .search-container {
    margin: -20px 10px 20px;
    padding: 15px;
  }

  .search-result {
    padding: 0 10px;
  }

  .result-meta {
    gap: 10px;
  }

  .result-meta span {
    font-size: 12px;
  }

  .action-buttons {
    gap: 4px;
  }

  .search-input :deep(.el-button) {
    padding: 0 15px;
    font-size: 14px;
  }

  .search-input :deep(.el-button i) {
    font-size: 16px;
  }

  .search-input :deep(.el-select) {
    width: 90px;
  }
}

/* 空状态优化 */
.el-empty {
  padding: 40px 0;
}

.empty-suggestions {
  max-width: 300px;
  margin: 20px auto;
}

/* 添加过渡动画 */
.result-item {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 