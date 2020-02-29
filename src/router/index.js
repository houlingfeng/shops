import Vue from 'vue'
import VueRouter from 'vue-router'


//import Login from '../views/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Login.vue')

//import Home from '../views/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Home.vue')

//import Welcome from '../views/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Welcome.vue')



//import Users from '../views/user/Users.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../views/user/Users.vue')

//import Rights from '../views/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../views/power/Rights.vue')

//import Roles from '../views/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../views/power/Roles.vue')


//import Cate from '../views/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "cate-params" */ '../views/goods/Cate.vue')
//import Params from '../views/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "cate-params" */ '../views/goods/Params.vue')


//import GoodsList from '../views/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "goodslist_add" */ '../views/goods/List.vue')
//import Add from '../views/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "goodslist_add" */ '../views/goods/Add.vue')


//import Order from '../views/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '../views/order/Order.vue')
//import Report from '../views/report/Report.vue'
const Report = () => import(/* webpackChunkName: "order_report" */ '../views/report/Report.vue')

Vue.use(VueRouter)

const routes = [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path:'/',
      redirect:'/login'
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {path: '/welcome', component: Welcome},
        {path: '/users', component: Users},
        {path: '/rights', component: Rights},
        {path: '/roles', component: Roles},
        {path: '/categories', component: Cate},
        {path: '/params', component: Params},
        {path: '/goods', component: GoodsList},
        {path: '/goods/add', component: Add},
        {path: '/orders', component: Order},
        {path: '/reports', component: Report}
      ]
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  ]


const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from代表从哪个路径跳转而来
  //next是一个函数，表示放行
  //next() 放行   next('/login') 强制跳转
  if (to.path === '/login') return next()
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
      next()
})




export default router
