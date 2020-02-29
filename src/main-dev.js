import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入文本编辑器
import VueQuillEditor from 'vue-quill-editor'


//导入文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入nprogress效果和动画
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//在request拦截器中，展示进度条 NProgress.start()
//请求拦截预处理
axios.interceptors.request.use(config => {
    NProgress.start()
    console.log(config)
    config.headers.Authorization = window.sessionStorage.getItem('token')
    //最后必须return config
    return config
})

//在response拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.request.use(config => {
    NProgress.done()
    return config
})


//挂载到原型的属性上
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

//将文本编辑器注册为全局可用
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(originVal){
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
