/**
 * Created by jerry on 2017/6/9.
 */
import axios from "axios";
import { Dialog } from "vant";
import router from "../router";
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';//配置请求头
/* eslint-disable */
// axios.defaults.baseURL= "http://api.guojintz.show.demopai.com/index.php";
// axios.defaults.baseURL= "http://tp51.show.demopai.com";
// axios.defaults.baseURL= "http://d51.guojintz.com/index.php";
axios.defaults.baseURL = "http://ipbgoe1.prod.demopai.com";

//添加一个请求拦截器
axios.interceptors.request.use(
  function(config) {
    try {
      let token = localStorage.getItem("token");
      if (token && localStorage.getItem("userInfo")) {
        config.headers["token"] = token;
      }
    } catch (e) {}
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);
// 响应拦截（配置请求回来的信息）
axios.interceptors.response.use(
  function(response) {
    let data = response.data ? response.data : {};
    if (data["code"] === 1001) {
      // window.history.pushState(null,'/login')
      Dialog.alert({
        title: "提示",
        message: data.msg
      }).then(() => {
        console.log(999, "login");

        // on confirm
        router.replace("/login");
      });
      return;
    } // 处理响应数据
    return response;
  },
  function(error) {
    // 处理响应失败
    return Promise.reject(error);
  }
);
// 1001
//基地址
// 在vue-cli3的项目中，
// npm run serve时会把process.env.NODE_ENV设置为‘development’；
// npm run build 时会把process.env.NODE_ENV设置为‘production’；
let base = "";
if (process.env.NODE_ENV === "production") {
  base = "./index.php/"; // 线上地址，打包是开启
} else {
  base = "./"; // 本地地址
}

//通用方法
export const POST = (url, params) => {
  return axios.post(`${base}${url}`, params).then(res => res.data);
};

export const GET = (url, params) => {
  return axios.get(`${base}${url}`, { params: params }).then(res => res.data);
};

export const PUT = (url, params) => {
  return axios.put(`${base}${url}`, params).then(res => res.data);
};

export const DELETE = (url, params) => {
  return axios
    .delete(`${base}${url}`, { params: params })
    .then(res => res.data);
};

export const PATCH = (url, params) => {
  return axios.patch(`${base}${url}`, params).then(res => res.data);
};
