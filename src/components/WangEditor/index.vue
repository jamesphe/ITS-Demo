<template>
  <div class="editor-container">
    <div ref="editor"></div>
  </div>
</template>

<script>
import E from 'wangeditor'

export default {
  name: 'EditorWang',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editor: null,
      content: ''
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.content) {
          this.content = val
          this.editor?.setHtml(val)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  },
  methods: {
    initEditor() {
      this.editor = new E(this.$refs.editor)

      // 配置编辑器
      this.editor.config.height = 500
      this.editor.config.placeholder = '请输入内容...'
      this.editor.config.zIndex = 1

      // 配置菜单栏
      this.editor.config.menus = [
        'head',
        'bold',
        'fontSize',
        'fontName',
        'italic',
        'underline',
        'strikeThrough',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'image',
        'table',
        'code',
        'undo',
        'redo'
      ]

      // 配置 onchange 回调函数
      this.editor.config.onChange = (html) => {
        this.content = html
        this.$emit('input', html)
      }

      // 创建编辑器
      this.editor.create()

      // 设置初始内容
      if (this.value) {
        this.editor.setHtml(this.value)
      }
    }
  }
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
}
</style> 