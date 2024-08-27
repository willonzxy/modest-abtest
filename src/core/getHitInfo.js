import { BUCKET_NUM } from '../config.js'
import murmurHash3 from "murmurhash3js"

export default function getHitInfo(app_id,qs_layer_id,shunt_model,hash_id,uid){
    let hit_info = {
        layer:{

        },
        trace_id:[]
    };
    let layers = shunt_model.layer;
    for(let layer_id in layers){
        if(!!qs_layer_id && layer_id !== qs_layer_id){
            continue
        }
        let layer_shunt_model = layers[layer_id];
        let hash = murmurHash3.x86.hash32(hash_id);
        let mod = hash % BUCKET_NUM;
        if( layer_shunt_model.ref_exp.bucket.includes(mod) ){
            const {data,id,version} = layer_shunt_model.ref_exp;
            hit_info.layer[layer_id] = {
                hit_exp_data:data,
                hit_exp_id:id,
                version:version
            }
            hit_info.trace_id.push(`${app_id}_${layer_id}_${id}_${version}`)
        }else{
            // launch layer
            if(shunt_model.launch_layer[layer_id]){
                let { data , id , version } = shunt_model.launch_layer[layer_id];
                hit_info.layer[layer_id] = {
                    hit_exp_data:data,
                    hit_exp_id:id,
                    version:version
                }
                hit_info.trace_id.push(`${app_id}_${layer_id}_${id}_${version}`)
                continue
            }
            // 进入实验的流量重新hash打散
            let hash = murmurHash3.x86.hash32(hash_id + layer_id);
            let mod = hash % BUCKET_NUM;
            let exp_set = layer_shunt_model.exp_set;
            for(let id in exp_set){
                // 命中桶的记录下来
                if(exp_set[id].bucket.includes(mod)){
                    let { version,data } = exp_set[id]
                    hit_info.layer[layer_id] = {
                        hit_exp_data:data,
                        hit_exp_id:id,
                        version:version
                    }
                    hit_info.trace_id.push(`${app_id}_${layer_id}_${id}_${version}`)
                    break;
                }
            }
        }
    }
    hit_info.trace_id = hit_info.trace_id.join('|')
    hit_info.uid = uid;
    return hit_info
}
