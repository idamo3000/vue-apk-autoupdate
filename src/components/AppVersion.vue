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
      this.checkVersion(); // 如果是plus5，则自动执行该函数
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
