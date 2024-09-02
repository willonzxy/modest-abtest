import { BUCKET_NUM } from '../config.js'
import { checkLayerConfig  } from "./validate.js"

export default function genModel(app_id,config){
    if(!Array.isArray(config)){
        throw new Error(`config must be an array`)
    }
    return createAppShuntModel(app_id,config);
}

function createAppShuntModel(app_id, config) {
    const shunt_model = {};
    shunt_model[app_id] = {
        launch_layer: {},
        layer: {}
    };
    for (let item of config) {
        checkLayerConfig(item);
        let {
            hit,
            layer_id = 'defaultLayerId',
            version = '',
            exp_set,
            ref_exp_id,
            ref_exp_data
        } = item;
        // (100 - hit * 100) / 100 Avoid bugs caused by precision loss
        shunt_model[app_id].layer[layer_id] = {
            ref_exp: {
                id:ref_exp_id,
                data:ref_exp_data,
                bucket:getBucket(0, (100 - hit * 100) / 100  * BUCKET_NUM),
                version
            },
            exp_set: {}
        };
        let index = (100 - hit * 100) / 100  * BUCKET_NUM;
        // exp set model gen
        for (let exp_item of exp_set) {
            let {
                id,
                data,
                weight
            } = exp_item;
            let len = Math.round(weight * BUCKET_NUM);
            if( index + len > BUCKET_NUM ){
                throw new Error(`ABTest初始化失败，请检查 ${app_id} 应用中，${layer_id} 场景下的流量分配情况`)
            }
            let bucket = getBucket(index, len);
            shunt_model[app_id].layer[layer_id].exp_set[id] = {
                data,
                bucket,
                version
            }
            index += len;
            // 100% exp upgrade to launch layer
            if(weight === 1){
                shunt_model[app_id].launch_layer[layer_id] = {
                    data,
                    id,
                    version
                }
            }
        }
    }
    return shunt_model[app_id]
}

function getBucket(start = 0, len) {
    let arr = new Array(len),
        i = start,
        index = 0;
    while (len--) {
        arr[index] = i;
        i++
        index++
    }
    return arr;
}
