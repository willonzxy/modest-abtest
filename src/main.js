import uuid from "./core/uuid.js";
import genModel from "./core/genModel.js";
import getHitInfo from "./core/getHitInfo.js";
import setCookies from "./core/setCookies.js";
import { parse as cookieParse } from "cookie";
import {
  ABTEST_UID_COOKIE_NAME,
  ABTEST_TRACE_ID_COOKIE_NAME,
} from "./config.js";

class ABTest {
  constructor(app_id, config) {
    this.app_id = app_id;
    this.config = config;
    this.model = genModel(app_id, config);
  }
  getUid() {
    return (
      this.uid ||
      cookieParse(document.cookie)[ABTEST_UID_COOKIE_NAME + this.app_id]
    );
  }
  getTraceId() {
    return (
      this.trace_id ||
      cookieParse(document.cookie)[ABTEST_TRACE_ID_COOKIE_NAME + this.app_id]
    );
  }
  run(layer_id) {
    let uid = this.getUid() || uuid();
    let hash_id = `${uid}_${
      location.protocol + "://" + location.host + location.pathname
    }`;
    let hit_info = getHitInfo(this.app_id, layer_id, this.model, hash_id, uid);
    // set uid trace_id in cookie
    setCookies(this.app_id, uid, hit_info.trace_id);
    this.uid = uid;
    this.trace_id = hit_info.trace_id;
    return hit_info;
  }
}

export default ABTest;