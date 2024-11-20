<template>
  <div class="troubleshooting-container">
    <!-- 顶部搜索和筛选区 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索故障类型或关键词"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <i slot="prefix" class="el-icon-search"></i>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="已解决" value="已解决" />
        <el-option label="处理中" value="处理中" />
        <el-option label="待处理" value="待处理" />
      </el-select>
    </div>

    <div class="main-content">
      <!-- 左侧故障类别树 -->
      <div class="category-tree">
        <div class="tree-header">
          <h3>故障类别</h3>
          <div class="tree-actions">
            <el-button type="primary" size="small" @click="expandAll">
              {{ isExpanded ? '收起' : '展开' }}
            </el-button>
            <el-button type="success" size="small" @click="addCategory">
              添加类别
            </el-button>
          </div>
        </div>
        <el-tree
          ref="treeRef"
          :data="troubleCategories"
          :props="defaultProps"
          :expand-on-click-node="false"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="node-actions">
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="editCategory(data)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="removeCategory(node, data)"
                >
                  删除
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="content-area">
        <!-- 决策树诊断 -->
        <div v-if="selectedTrouble && selectedTrouble.decisionTree" class="decision-tree">
          <div class="tree-header">
            <h3>故障诊断向导</h3>
            <el-button type="primary" size="small" @click="restartDiagnosis">
              重新诊断
            </el-button>
          </div>
          
          <div class="diagnosis-content">
            <template v-if="!diagnosisResult">
              <div class="question-box">
                <p class="question">{{ currentQuestion.question }}</p>
                <div class="options">
                  <el-button
                    v-for="option in currentQuestion.options"
                    :key="option.answer"
                    type="primary"
                    plain
                    @click="selectAnswer(option)"
                  >
                    {{ option.answer }}
                  </el-button>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="result-box">
                <el-alert
                  :title="diagnosisResult.result"
                  type="success"
                  :closable="false"
                  show-icon
                >
                  <template #description>
                    <div class="result-steps">
                      <p>建议采取以下步骤：</p>
                      <ol>
                        <li v-for="(step, index) in diagnosisResult.steps" :key="index">
                          {{ step }}
                        </li>
                      </ol>
                    </div>
                  </template>
                </el-alert>
              </div>
            </template>
          </div>
        </div>

        <!-- 故障排流程图 -->
        <div v-if="selectedTrouble" class="flow-chart">
          <div class="trouble-header">
            <h3>{{ selectedTrouble.name }} - 排查流程</h3>
            <el-tag :type="selectedTrouble.severity === 'high' ? 'danger' : 'warning'">
              {{ selectedTrouble.severity === 'high' ? '高危故障' : '一般故障' }}
            </el-tag>
          </div>
          
          <div class="trouble-info">
            <p><strong>故障描述：</strong>{{ selectedTrouble.description }}</p>
            <p><strong>可能影响：</strong>{{ selectedTrouble.impact }}</p>
          </div>

          <el-steps :active="activeStep" direction="vertical" @change="handleStepChange">
            <el-step 
              v-for="(step, index) in selectedTrouble.steps" 
              :key="index"
              :title="step.title"
              :status="stepStatus[index]"
            >
              <template #description>
                <div class="step-content">
                  <p>{{ step.description }}</p>
                  <div class="step-actions">
                    <el-button 
                      v-if="step.solution" 
                      type="primary" 
                      size="small"
                      @click="showSolution(step.solution)"
                    >
                      查看解决方案
                    </el-button>
                    <el-button 
                      type="success" 
                      size="small"
                      :disabled="index !== activeStep"
                      @click="completeStep(index)"
                    >
                      完成此步骤
                    </el-button>
                  </div>
                  <div v-if="step.tips" class="step-tips">
                    <el-alert
                      :title="step.tips"
                      type="info"
                      :closable="false"
                      show-icon
                    />
                  </div>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>

        <!-- 历史案例列表 -->
        <div class="history-cases">
          <div class="section-header">
            <h3>相关历史案例</h3>
            <el-radio-group v-model="timeRange" size="small" @change="filterCases">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          
          <el-table :data="filteredCases" style="width: 100%">
            <el-table-column prop="date" label="发生时间" width="180" sortable />
            <el-table-column prop="title" label="故障标题" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="解决时长" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="text" @click="viewCaseDetail(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 案例详情对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="故障案例详情"
      width="60%"
    >
      <div v-if="selectedCase" class="case-detail">
        <h4>{{ selectedCase.title }}</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发生时间">{{ selectedCase.date }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedCase.status)">{{ selectedCase.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ selectedCase.handler }}</el-descriptions-item>
          <el-descriptions-item label="解决时长">{{ selectedCase.duration }}</el-descriptions-item>
          <el-descriptions-item label="故障描述" :span="2">{{ selectedCase.description }}</el-descriptions-item>
          <el-descriptions-item label="解决方案" :span="2">{{ selectedCase.solution }}</el-descriptions-item>
          <el-descriptions-item label="预防措施" :span="2">{{ selectedCase.prevention }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 添加类别对话框 -->
    <el-dialog
      :visible.sync="categoryDialogVisible"
      :title="categoryDialogType === 'add' ? '添加故障类别' : '编辑故障类别'"
      width="65%"
      custom-class="category-dialog"
    >
      <el-form
        ref="categoryForm"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
        class="category-form"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="类别名称" prop="label">
                  <el-input v-model="categoryForm.label" placeholder="请输入类别名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="严重程度" prop="severity">
                  <el-select v-model="categoryForm.severity" placeholder="请选择严重程度" class="full-width">
                    <el-option label="高危故障" value="high" />
                    <el-option label="一般故障" value="normal" />
                    <el-option label="低危故障" value="low" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="故障描述" prop="description">
              <el-input
                v-model="categoryForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入故障描述"
              />
            </el-form-item>
            
            <el-form-item label="影响范围" prop="impact">
              <el-input
                v-model="categoryForm.impact"
                type="textarea"
                :rows="3"
                placeholder="请输入影响范围"
              />
            </el-form-item>
            
            <el-form-item label="上级类别" prop="parentId">
              <el-cascader
                v-model="categoryForm.parentId"
                :options="categoryOptions"
                :props="{ 
                  checkStrictly: true,
                  value: 'id',
                  label: 'label'
                }"
                clearable
                placeholder="请选择上级类别"
                class="full-width"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 排查步骤部分 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-s-operation"></i>
            <span>排查步骤</span>
            <el-button 
              type="text"
              icon="el-icon-plus"
              @click="addStep"
              class="add-step-btn"
            >
              添加步骤
            </el-button>
          </div>
          
          <div class="section-content">
            <div 
              v-for="(step, index) in categoryForm.steps" 
              :key="index"
              class="step-item"
            >
              <div class="step-header">
                <span class="step-index">步骤 {{index + 1}}</span>
                <el-button 
                  type="text" 
                  icon="el-icon-delete"
                  @click="removeStep(index)"
                  v-if="categoryForm.steps.length > 1"
                  class="delete-step-btn"
                >
                  删除
                </el-button>
              </div>
              
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item 
                    :prop="'steps.' + index + '.title'"
                    :rules="categoryRules['steps.0.title']"
                    label="步骤标题"
                  >
                    <el-input v-model="step.title" placeholder="请输入步骤标题" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item 
                    :prop="'steps.' + index + '.description'"
                    :rules="categoryRules['steps.0.description']"
                    label="步骤描述"
                  >
                    <el-input
                      v-model="step.description"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入步骤描述"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="解决方案">
                    <el-input
                      v-model="step.solution"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入解决方案"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="操作提示">
                    <el-input
                      v-model="step.tips"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入操作提示"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCategory">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Troubleshooting',
  data() {
    return {
      searchKeyword: '',
      statusFilter: '',
      timeRange: 'all',
      isExpanded: false,
      activeStep: 0,
      stepStatus: [],
      dialogVisible: false,
      selectedCase: null,
      selectedTrouble: null,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      troubleCategories: [
        {
          label: '网络故障',
          children: [
            { 
              label: '网络连接中断',
              name: '网络连接中断',
              severity: 'high',
              description: '网络完全无法访问或连接不稳定',
              impact: '影响所有网络服务的正常运行，可能导致业务中断',
              decisionTree: {
                question: '是否能ping通网关？',
                options: [
                  {
                    answer: '是',
                    next: {
                      question: '是否能ping通外网地址？',
                      options: [
                        {
                          answer: '是',
                          result: '可能是DNS解析问题',
                          steps: ['检查DNS服务器配置', '清除DNS缓存', '尝试使用备用DNS']
                        },
                        {
                          answer: '否',
                          result: '可能是外网链路问题',
                          steps: ['检查外网链路状态', '联系运营商', '切换备用链路']
                        }
                      ]
                    }
                  },
                  {
                    answer: '否',
                    next: {
                      question: '网卡指示灯是否正常？',
                      options: [
                        {
                          answer: '是',
                          result: '可能是网络配置问题',
                          steps: ['检查IP配置', '检查网关配置', '检查路由表']
                        },
                        {
                          answer: '否',
                          result: '可能是物理连接问题',
                          steps: ['检查网线连接', '更换网线', '检查网卡状态']
                        }
                      ]
                    }
                  }
                ]
              },
              steps: [
                {
                  title: '检查物理连接',
                  description: '确认网线是否正确连接，网口指示灯是否正常',
                  solution: '1. 检查网线两端是否牢固连接\n2. 更换网线测试\n3. 更换网口测试',
                  tips: '注意检查网线是否有物理损坏'
                },
                {
                  title: '检查网络配置',
                  description: '验证IP地址、子网掩码、网关配置是否正确',
                  solution: '1. 使用ipconfig/ifconfig查看配置\n2. 确认DHCP服务是否正常\n3. 手动配置静态IP试',
                  tips: '建议记录原有配置以便复'
                },
                {
                  title: '检查DNS设置',
                  description: '确认DNS服务器配置是否正确',
                  solution: '1. 检查DNS服务器地址\n2. 尝试使用公共DNS\n3. 清除DNS缓存',
                  tips: '可以尝试使用8.8.8.8作为备用DNS'
                }
              ]
            },
            { 
              label: '网络延迟高',
              name: '网络延高',
              severity: 'normal',
              description: '网络响应缓慢，延迟明显高于正常水平',
              impact: '影响用户体验，可能导致部分服务响应超时',
              steps: [
                {
                  title: '网络性能测试',
                  description: '使用ping和traceroute工具检测网络延迟',
                  solution: '1. 执行ping测试\n2. 执行traceroute跟踪路由\n3. 分析网络瓶颈',
                  tips: '建议测试多个目标地址'
                }
              ]
            }
          ]
        },
        {
          label: '服务器故障',
          children: [
            { 
              label: 'CPU使用率过高',
              name: 'CPU使用率过高',
              severity: 'high',
              description: 'CPU使用率持续超过90%',
              impact: '服务器性能下降，响应缓慢，可能影响关键业务运行',
              steps: [
                {
                  title: '进程分析',
                  description: '使用top命令查看占用CPU较高的进程',
                  solution: '1. 使用top命令分析\n2. 定位异常进程\n3. 必要时重启服务',
                  tips: '注意记录异常进程信息'
                }
              ]
            },
            {
              label: '内存溢出',
              name: '内存溢出',
              severity: 'high',
              description: '应用程序发生内存溢出错误',
              impact: '服务不稳定，可能导致应用崩溃',
              steps: [
                {
                  title: '内存使用分析',
                  description: '收集内存转储文件并分析',
                  solution: '1. 导出内存转储\n2. 使用分析工具查看\n3. 定位内存泄漏点',
                  tips: '建议在非高峰期执行分析'
                }
              ]
            }
          ]
        }
      ],
      historyCases: [
        {
          date: '2024-03-15',
          title: '生产环境数据库连接中断',
          status: '已解决',
          duration: '2小时',
          description: '数据库主从同步异常导致连接中断',
          solution: '重置主从同步状态，恢复数据一致性',
          prevention: '加强主从同步监控，设置告警阈值',
          handler: '张工'
        },
        {
          date: '2024-03-14',
          title: '应用服务响应缓慢',
          status: '已解决',
          duration: '1.5小时',
          description: '内存泄漏导致服务响应变慢',
          solution: '修复内存泄漏代码，重启服务',
          prevention: '增加内存使用监控，定期检查内存使用趋势',
          handler: '李工'
        },
        {
          date: '2024-03-13',
          title: '网络访问异常',
          status: '处理中',
          duration: '进行中',
          description: '核心交换机故障导致部分网段无法访问',
          solution: '正在更换备用交换机',
          prevention: '待定',
          handler: '王工'
        }
      ],
      currentQuestion: null,
      diagnosisResult: null,
      diagnosisHistory: [],
      categoryDialogVisible: false,
      categoryDialogType: 'add',
      categoryForm: {
        id: '',
        label: '',
        description: '',
        severity: '',
        impact: '',
        parentId: null,
        steps: [{
          title: '',
          description: '',
          solution: '',
          tips: ''
        }]
      },
      categoryRules: {
        label: [
          { required: true, message: '请输入类别名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入故障描述', trigger: 'blur' }
        ],
        severity: [
          { required: true, message: '请选择严重程度', trigger: 'change' }
        ],
        'steps.0.title': [
          { required: true, message: '请输入步骤标题', trigger: 'blur' }
        ],
        'steps.0.description': [
          { required: true, message: '请输入步骤描述', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    filteredCases() {
      let cases = [...this.historyCases]
      
      // 状态筛选
      if (this.statusFilter) {
        cases = cases.filter(item => item.status === this.statusFilter)
      }
      
      // 时间范围筛选
      const now = new Date()
      if (this.timeRange === 'week') {
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
        cases = cases.filter(item => new Date(item.date) >= weekAgo)
      } else if (this.timeRange === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        cases = cases.filter(item => new Date(item.date) >= monthAgo)
      }
      
      // 关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        cases = cases.filter(item => 
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword)
        )
      }
      
      return cases
    },
    categoryOptions() {
      // 将树形数据转换为级联选择器所需的格式
      const convertToOptions = (categories) => {
        return categories.map(item => ({
          id: item.id,
          label: item.label,
          children: item.children ? convertToOptions(item.children) : null
        }))
      }
      return convertToOptions(this.troubleCategories)
    }
  },
  methods: {
    handleSearch() {
      // 搜索逻辑通过计算属性实现
    },
    handleFilter() {
      // 筛选逻辑已通过计算属性实现
    },
    expandAll() {
      this.isExpanded = !this.isExpanded
      this.$refs.treeRef[this.isExpanded ? 'expandAll' : 'collapseAll']()
    },
    handleNodeClick(data) {
      if (data.steps) {
        this.selectedTrouble = data
        this.activeStep = 0
        this.stepStatus = new Array(data.steps.length).fill('wait')
        this.stepStatus[0] = 'process'
        
        // 初始化决策树诊断
        if (data.decisionTree) {
          this.startDiagnosis(data.decisionTree)
        }
      }
    },
    startDiagnosis(decisionTree) {
      this.currentQuestion = decisionTree
      this.diagnosisResult = null
      this.diagnosisHistory = []
    },
    selectAnswer(option) {
      this.diagnosisHistory.push({
        question: this.currentQuestion.question,
        answer: option.answer
      })
      
      if (option.next) {
        this.currentQuestion = option.next
      } else {
        this.diagnosisResult = {
          result: option.result,
          steps: option.steps
        }
      }
    },
    restartDiagnosis() {
      if (this.selectedTrouble && this.selectedTrouble.decisionTree) {
        this.startDiagnosis(this.selectedTrouble.decisionTree)
      }
    },
    handleStepChange(step) {
      this.activeStep = step
    },
    completeStep(index) {
      this.stepStatus[index] = 'success'
      if (index < this.selectedTrouble.steps.length - 1) {
        this.activeStep = index + 1
        this.stepStatus[index + 1] = 'process'
      }
    },
    showSolution(solution) {
      this.$notify({
        title: '解决方案',
        message: solution,
        type: 'success',
        duration: 0
      })
    },
    viewCaseDetail(row) {
      this.selectedCase = row
      this.dialogVisible = true
      
      // 添加延迟以确保对话框正确显示
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    getStatusType(status) {
      const types = {
        '已解决': 'success',
        '处理中': 'warning',
        '待处理': 'info'
      }
      return types[status] || 'info'
    },
    filterCases() {
      // 过滤逻辑已通过计算属性实现
    },
    addCategory() {
      this.categoryDialogType = 'add'
      this.categoryForm = {
        id: '',
        label: '',
        description: '',
        severity: '',
        impact: '',
        parentId: null,
        steps: [{
          title: '',
          description: '',
          solution: '',
          tips: ''
        }]
      }
      this.categoryDialogVisible = true
    },
    editCategory(data) {
      this.categoryDialogType = 'edit'
      this.categoryForm = {
        id: data.id,
        label: data.label,
        description: data.description || '',
        severity: data.severity || '',
        impact: data.impact || '',
        parentId: this.getParentId(data),
        steps: data.steps.map(step => ({
          title: step.title,
          description: step.description,
          solution: step.solution,
          tips: step.tips
        }))
      }
      this.categoryDialogVisible = true
    },
    removeCategory(node, data) {
      this.$confirm('确认删除该故障类别吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 在实际项目中这里应该调用后端API
        const parent = node.parent
        const children = parent.data.children || parent.data
        const index = children.findIndex(d => d.id === data.id)
        children.splice(index, 1)
        
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    submitCategory() {
      this.$refs.categoryForm.validate((valid) => {
        if (valid) {
          // 在实际项目中这里应该调用后端API
          if (this.categoryDialogType === 'add') {
            // 生成新的ID
            const newId = Date.now().toString()
            const newCategory = {
              id: newId,
              label: this.categoryForm.label,
              description: this.categoryForm.description,
              severity: this.categoryForm.severity,
              impact: this.categoryForm.impact,
              children: [],
              steps: this.categoryForm.steps
            }
            
            if (this.categoryForm.parentId) {
              // 添加到指定父类别下
              this.addToParent(this.troubleCategories, this.categoryForm.parentId, newCategory)
            } else {
              // 添加到根级别
              this.troubleCategories.push(newCategory)
            }
          } else {
            // 编辑现有类别
            this.updateCategory(this.troubleCategories, this.categoryForm)
          }
          
          this.categoryDialogVisible = false
          this.$message({
            type: 'success',
            message: this.categoryDialogType === 'add' ? '添加成功!' : '更新成功!'
          })
        }
      })
    },
    addToParent(categories, parentId, newCategory) {
      for (let category of categories) {
        if (category.id === parentId) {
          category.children = category.children || []
          category.children.push(newCategory)
          return true
        }
        if (category.children) {
          if (this.addToParent(category.children, parentId, newCategory)) {
            return true
          }
        }
      }
      return false
    },
    updateCategory(categories, formData) {
      for (let category of categories) {
        if (category.id === formData.id) {
          Object.assign(category, {
            label: formData.label,
            description: formData.description,
            severity: formData.severity,
            impact: formData.impact,
            steps: formData.steps
          })
          return true
        }
        if (category.children) {
          if (this.updateCategory(category.children, formData)) {
            return true
          }
        }
      }
      return false
    },
    getParentId(data) {
      // 查找节点的父节点ID
      const findParent = (categories, targetId, parent = null) => {
        for (let category of categories) {
          if (category.id === targetId) {
            return parent ? parent.id : null
          }
          if (category.children) {
            const result = findParent(category.children, targetId, category)
            if (result !== undefined) {
              return result
            }
          }
        }
      }
      return findParent(this.troubleCategories, data.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.troubleshooting-container {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  
  .search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
    padding: 15px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .search-input {
      width: 300px;
      .el-input__inner {
        border-radius: 20px;
      }
    }
    
    .el-select {
      width: 150px;
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    gap: 20px;
    overflow: hidden;
    
    .category-tree {
      width: 280px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      .tree-header {
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ebeef5;
        background: #f8fafc;
        border-radius: 8px 8px 0 0;
        
        h3 {
          margin: 0;
          color: #303133;
          font-size: 16px;
          font-weight: 600;
        }
      }
      
      .el-tree {
        padding: 15px;
        
        :deep(.el-tree-node__content) {
          height: 36px;
          border-radius: 4px;
          
          &:hover {
            background-color: #f5f7fa;
          }
        }
        
        :deep(.el-tree-node.is-current > .el-tree-node__content) {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }
    }
    
    .content-area {
      flex: 1;
      overflow-y: auto;
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      .decision-tree {
        margin-bottom: 30px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 20px;
        background: #fafafa;
        
        .tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ebeef5;
          
          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }
        }
        
        .diagnosis-content {
          .question-box {
            text-align: center;
            padding: 30px 20px;
            background: #fff;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            
            .question {
              font-size: 18px;
              margin-bottom: 25px;
              color: #303133;
              font-weight: 500;
            }
            
            .options {
              display: flex;
              justify-content: center;
              gap: 20px;
              
              .el-button {
                min-width: 120px;
                border-radius: 20px;
                
                &:hover {
                  transform: translateY(-2px);
                  transition: all 0.3s;
                }
              }
            }
          }
        }
      }
      
      .flow-chart {
        margin-bottom: 30px;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        
        .trouble-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ebeef5;
          
          h3 {
            margin: 0;
            font-size: 18px;
            color: #303133;
            font-weight: 600;
          }
        }
        
        .trouble-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 25px;
          
          p {
            margin: 8px 0;
            line-height: 1.6;
            color: #606266;
            
            strong {
              color: #303133;
              margin-right: 8px;
            }
          }
        }
        
        .step-content {
          margin: 15px 0;
          
          p {
            color: #606266;
            line-height: 1.6;
          }
          
          .step-actions {
            margin: 15px 0;
            display: flex;
            gap: 10px;
          }
          
          .step-tips {
            margin-top: 15px;
          }
        }
        
        :deep(.el-step__head) {
          border-radius: 50%;
          
          &.is-success {
            color: #67c23a;
            border-color: #67c23a;
          }
        }
        
        :deep(.el-step__title) {
          font-size: 15px;
          font-weight: 500;
        }
      }
      
      .history-cases {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          h3 {
            margin: 0;
            font-size: 16px;
            color: #303133;
            font-weight: 600;
          }
        }
        
        :deep(.el-table) {
          border-radius: 8px;
          overflow: hidden;
          
          th {
            background-color: #f8fafc;
            color: #606266;
            font-weight: 600;
          }
          
          .el-button--text {
            padding: 0 8px;
            
            &:hover {
              color: #409eff;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
  font-size: 14px;
  
  .node-actions {
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    gap: 8px;
    
    .el-button {
      padding: 2px 6px;
      font-size: 12px;
      
      &:hover {
        color: #409eff;
      }
    }
  }
  
  &:hover .node-actions {
    opacity: 1;
  }
}

.case-detail {
  h4 {
    margin: 0 0 20px;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
  
  :deep(.el-descriptions) {
    margin-top: 20px;
    
    .el-descriptions__label {
      width: 120px;
      font-weight: 500;
      color: #606266;
    }
    
    .el-descriptions__content {
      line-height: 1.6;
      color: #303133;
    }
  }
}

// 添加过渡动画
.el-dialog {
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.3s;
  
  &.dialog-fade-enter-active {
    transform: scale(1);
    opacity: 1;
  }
}

// 优化滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.category-dialog {
  .category-form {
    padding: 0 20px;
    
    .form-section {
      margin-bottom: 30px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      
      .section-title {
        padding: 15px 20px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        align-items: center;
        background: #f8fafc;
        border-radius: 8px 8px 0 0;
        
        i {
          margin-right: 8px;
          color: #409eff;
          font-size: 18px;
        }
        
        span {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
        
        .add-step-btn {
          margin-left: auto;
          padding: 0 16px;
          
          i {
            margin-right: 4px;
            color: #67c23a;
          }
          
          &:hover {
            color: #67c23a;
          }
        }
      }
      
      .section-content {
        padding: 20px;
        
        .step-item {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #ebeef5;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            
            .step-index {
              font-size: 15px;
              font-weight: 500;
              color: #409eff;
            }
            
            .delete-step-btn {
              color: #f56c6c;
              
              &:hover {
                opacity: 0.8;
              }
            }
          }
        }
      }
    }
    
    .el-form-item {
      margin-bottom: 18px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.full-width {
  width: 100%;
}

// 优化滚动条样式
:deep(.el-dialog__body) {
  max-height: calc(90vh - 150px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
}
</style> 