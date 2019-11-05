import Vue from 'vue';
import App from './App.vue';
import '@/assets/css/fontSize.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'


Vue.config.productionTip = false;
Vue.use(BootstrapVue)
// Vue.use(VueRouter);

// const routes = [
//   { path: '/',  meta: {
//     title: 'MdsplusWave'
//   }
// }
// ];

// const router = new VueRouter({
//   routes
// });

// router.beforeEach((to, from, next) => {
//   document.title = 'MdsplusWave'
//   next()
// })


new Vue({
  render: (h) => h(App),
  // router
}).$mount('#app');

