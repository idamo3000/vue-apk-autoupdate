/**
 * Created by daxiang on 2019/5/4.
 * 产品相关api
 */
import * as API from "./api_v2_index";

export default {
  // 我的预约产品
  appVersion: params => {
    return API.POST("api/home/version", params);
  }
}