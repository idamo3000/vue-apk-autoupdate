# H5之APP安装趵自动升级

![设计坞-20200314-4720547](http://image.damoxueyuan.com/uPic/设计坞-20200314-4720547.jpg)



## 一、效果演示

第一种：提示安装升级

另一种：强制安装升级

![image-20200314021646644](http://image.damoxueyuan.com/uPic/image-20200314021646644.png)

github代码下载：地址xxx

视频核心讲解：地址xxx

## 二、环境准备

### 1、Vue环境准备好

#### Main.js  

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vant from 'vant';
import 'vant/lib/index.css';

Vue.config.productionTip = false
Vue.use(Vant)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

```



#### App.vue

```vue
<template>
  <div id="app">
    <app-version></app-version>
    <h2>hello world</h2>
  </div>
</template>

<script>
import AppVersion from './components/AppVersion'
  export default {
    components: {
      AppVersion,
    },
  }
</script>

<style lang="less" scoped>

</style>
```

#### AppVersion.vue

```vue
<template lang="html">
      <!-- 使用 title 插槽来自定义标题 -->
		<van-popup 
			:close-on-click-overlay = "false"
			:style="{ width:'80%' ,padding:'30px 10px 50px'}"
			:overlay-style="{opacity:0.8}"
			v-model="show">
          <h3 v-if="downloadPercentage !== 100">安装包更新中...</h3>
          <h3 v-else><van-loading type="spinner" />正在安装中...</h3>
          <van-progress :percentage="downloadPercentage" />
		</van-popup>
</template>

<script lang="js">
  import API from '../api/api_v2_home'
  /* eslint-disable */
  export default  {
    name: 'appVersion',
    props: [],
    mounted() {
              // 放在局部可以吗？
      document.addEventListener('plusready', ()=>{
          this.checkVersion(); // 如果是plus5，则自动执行该函数
      });
    },
    created(){
      
    },
    data() {
      return {
        show: false,
        version_api: 'http://tp51.show.demopai.com/index.php/api/home/version',
        dtask:null, // 创建下载apk任务对象
        download_link: '',//新版更新apk地址
        message_content: '', // 新版内容
        downloadPercentage: 0 //下载进度
      }
    },
    methods: {
      async checkVersion(){
        var remoteInfo = await this.getApkInfoByRemoteDB();
        var runtimeInfo = await this.getApkInfoByRuntime();
        this.download_link = remoteInfo.data.download_link; // 把下载地址存起来
        this.message_content = remoteInfo.data.message_content;
        if(remoteInfo.data.version_code > runtimeInfo.versionCode && remoteInfo.data.force_state === '1'){ //强制更新
          this.$dialog.alert({
            message: "发现新版本:V" + remoteInfo.data.version,
            confirmButtonText:'升级确认'
          }).then(()=>{
            this.createDownload();
          })
        }else if(remoteInfo.data.version_code > runtimeInfo.versionCode && remoteInfo.data.force_state === '0'){
          this.$dialog.confirm({
            message: "发现新版本:V" + remoteInfo.data.version,
            confirmButtonText:'升级确认',
            cancelButtonText:'暂不更新'
          }).then(()=>{
            this.createDownload();
          }).catch(e=>{
            //取消
          })
        }
      },
      getApkInfoByRuntime(){ //获取正在运行的信息
        return new Promise((resolve,reject)=>{
          window.plus.runtime.getProperty(plus.runtime.appid,  (info)=>{
            resolve(info);
          })
        })
      },
      getApkInfoByRemoteDB(){//获取数据库中的版本
        // return axios.post(this.version_api).then(res=>res.data)
        return API.appVersion({});
      },
      createDownload(){//创建下载
          this.show = true;
        this.dtask = window.plus.downloader.createDownload(this.download_link);
        this.dtask.addEventListener("statechanged", this.onStateChanged, false);
        this.dtask.start(); 
      },
      
      onStateChanged(download, status){//监听过程
        if(download.state == 4 && status == 200){
          var path = download.filename;//下载apk
          window.plus.runtime.install(path); // 自动安装apk文件
          setTimeout(()=>{
            this.show = false;
          },2000)
          // 下载完成 
        } else{
          var totalSize = download.totalSize;
          var  currentSize = download.downloadedSize;
          var percentSize = parseInt(currentSize/totalSize*100);
          if(this.downloadPercentage !== percentSize){
            this.downloadPercentage = percentSize;
          }
        }
      }
    },
    computed: {

    }
}
</script>

<style scoped lang="less">

</style>

```





#### vue.config.js

```json
module.exports = {
  assetsDir: "static",
  publicPath: "./",
  outputDir: "../vue-apk-autoupdate-h5plus/dist",
  // ylcf-vue-h5plus
  // 配置 axios 代理请求
  devServer: {
    proxy: {
      "/api": {
        // target: 'http://www.tp5token.com/index.php',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/api": "/api"
        }
      }
    }
  }
};

```





### 2、HbuiderX环境准备好

![image-20200314015200596](http://image.damoxueyuan.com/uPic/image-20200314015200596.png)



### 3、接口数据格式

![image-20200314015352949](http://image.damoxueyuan.com/uPic/image-20200314015352949.png)

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "id": 298,
    "version": "3.0",
    "version_code": 30,
    "download_link": "http:\/\/image.damoxueyuan.com\/apk\/H5B940534_0314012250.apk",
    "message_content": "",
    "force_state": "0",
    "show_state": "1",
    "create_time": "2020-03-14 01:24:51",
    "update_time": "2020-03-14 01:24:53"
  }
}
```



## 三、核心代码组件部分

```vue
<template lang="html">
      <!-- 使用 title 插槽来自定义标题 -->
		<van-popup 
			:close-on-click-overlay = "false"
			:style="{ width:'80%' ,padding:'30px 10px 50px'}"
			:overlay-style="{opacity:0.8}"
			v-model="show">
          <h3 v-if="downloadPercentage !== 100">安装包更新中...</h3>
          <h3 v-else><van-loading type="spinner" />正在安装中...</h3>
          <van-progress :percentage="downloadPercentage" />
		</van-popup>
</template>

<script lang="js">
  import API from '../api/api_v2_home'
  /* eslint-disable */
  export default  {
    name: 'appVersion',
    props: [],
    mounted() {
              // 放在局部可以吗？
      document.addEventListener('plusready', ()=>{
          this.checkVersion(); // 如果是plus5，则自动执行该函数
      });
    },
    created(){
      
    },
    data() {
      return {
        show: false,
        version_api: 'http://tp51.show.demopai.com/index.php/api/home/version',
        dtask:null, // 创建下载apk任务对象
        download_link: '',//新版更新apk地址
        message_content: '', // 新版内容
        downloadPercentage: 0 //下载进度
      }
    },
    methods: {
      async checkVersion(){
        var remoteInfo = await this.getApkInfoByRemoteDB();
        var runtimeInfo = await this.getApkInfoByRuntime();
        this.download_link = remoteInfo.data.download_link; // 把下载地址存起来
        this.message_content = remoteInfo.data.message_content;
        if(remoteInfo.data.version_code > runtimeInfo.versionCode && remoteInfo.data.force_state === '1'){ //强制更新
          this.$dialog.alert({
            message: "发现新版本:V" + remoteInfo.data.version,
            confirmButtonText:'升级确认'
          }).then(()=>{
            this.createDownload();
          })
        }else if(remoteInfo.data.version_code > runtimeInfo.versionCode && remoteInfo.data.force_state === '0'){
          this.$dialog.confirm({
            message: "发现新版本:V" + remoteInfo.data.version,
            confirmButtonText:'升级确认',
            cancelButtonText:'暂不更新'
          }).then(()=>{
            this.createDownload();
          }).catch(e=>{
            //取消
          })
        }
      },
      getApkInfoByRuntime(){ //获取正在运行的信息
        return new Promise((resolve,reject)=>{
          window.plus.runtime.getProperty(plus.runtime.appid,  (info)=>{
            resolve(info);
          })
        })
      },
      getApkInfoByRemoteDB(){//获取数据库中的版本
        // return axios.post(this.version_api).then(res=>res.data)
        return API.appVersion({});
      },
      createDownload(){//创建下载
          this.show = true;
        this.dtask = window.plus.downloader.createDownload(this.download_link);
        this.dtask.addEventListener("statechanged", this.onStateChanged, false);
        this.dtask.start(); 
      },
      
      onStateChanged(download, status){//监听过程
        if(download.state == 4 && status == 200){
          var path = download.filename;//下载apk
          window.plus.runtime.install(path); // 自动安装apk文件
          setTimeout(()=>{
            this.show = false;
          },2000)
          // 下载完成 
        } else{
          var totalSize = download.totalSize;
          var  currentSize = download.downloadedSize;
          var percentSize = parseInt(currentSize/totalSize*100);
          if(this.downloadPercentage !== percentSize){
            this.downloadPercentage = percentSize;
          }
        }
      }
    },
    computed: {

    }
}
</script>

<style scoped lang="less">

</style>

```

## 四、参考资料

#### 辅助:本地git关联github

```shell
echo "# vue-apk-autoupdate" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin git@github.com:idamo3000/vue-apk-autoupdate.git
git push -u origin master
```

or

```shell
git remote add origin git@github.com:idamo3000/vue-apk-autoupdate.git
git push -u origin master
```


