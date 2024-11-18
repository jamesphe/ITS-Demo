<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="bullshit">
        <div class="bullshit__headline">{{ message }}</div>
        <div class="bullshit__info">请检查您输入的网址是否正确，或点击下面的按钮返回首页。</div>
        <router-link class="bullshit__return-home" to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page404',
  data() {
    return {
      message: '404 - 页面不存在'
    }
  }
}
</script>

<style lang="scss" scoped>
.wscn-http404-container {
  transform: translate(-50%,-50%);
  position: absolute;
  top: 40%;
  left: 50%;
}
.wscn-http404 {
  position: relative;
  width: 800px;
  padding: 0 50px;
  overflow: hidden;
  .bullshit {
    position: relative;
    float: left;
    width: 300px;
    padding: 30px 0;
    overflow: hidden;
    &__headline {
      font-size: 20px;
      font-weight: bold;
      color: #1482f0;
      margin-bottom: 10px;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      margin-bottom: 30px;
    }
    &__return-home {
      display: block;
      float: left;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      text-decoration: none;
      &:hover {
        background: #2492f0;
      }
    }
  }
}
</style> 