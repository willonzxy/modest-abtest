# 介绍
一个只在浏览器中运行的ABTest JS库，提供了CJS、ESM、IIFE三种格式的模块导出。  
IIFE模块的兼容性为：> 0.2% , not dead , Chrome >= 67
# 示例
demo示例在dist目录下可以找到
```javascript
// CJS 模式
// const ABTest = require('modest-abtest');

// ESM 模式
// import ABTest from 'modest-abtest';

// IIFE 模式
// html 中以script标签的形式引入 modest-abtest.iife.min.js
var abtest = new ABTest('yourAppId',[{
    layer_id:'yourLayerId',
    ref_exp_id:0,
    ref_exp_data:'planZero',
    hit:1,
    version:1,
    exp_set:[
        {id:1,weight:0.5,data:'planA'},
        {id:2,weight:0.5,data:'planB'}
    ]
}]);
var abtest_result = abtest.run();
console.log(abtest_result);
// 打印结果
{
	"layer": {
		"yourLayerId": {
			"hit_exp_data": "planB",
			"hit_exp_id": "2",
			"version": 1
		}
	},
	"trace_id": "yourAppId_yourLayerId_2_1",
	"uid": "7f65cb09-51ba-48b1-9622-fc698141b1dd"
}
```
# 初始化配置说明
```
var abtest = new ABtest(appId,config)
```
| 字段 | 描述 | 类型 | 是否必填 | 其他
| -:| :- | :-: | :-:| :-:|
| appId | 应用标识 | string | 是 | - |
| config | 实验数据配置  | Array\<object\> | 是 | -|

## config 字段说明
| 字段 | 描述 | 类型 | 是否必填 | 其他
| -:| :- | :-: | :-:| :-:|
| layer_id | 场景标识 | string | 是 | 为支持一个应用里同时进行多场景ABTest（分层实验、流量正交） |
| hit | 用户参与实验的比例 | number | 是 | 可选范围 (0,1], 精度为 0.01，通常配置为1，即所有用户参与实验。如果配置0.8，则会有80%的用户会参与到exp_set字段配置的实验中，其中20%的用户不参与实验，这20%的用户会命中空白对照组 |
| ref_exp_id | 空白对照实验组标识  | string | 否 | - |
| ref_exp_data | 空白对照实验组数据 | any | 否 | hit不为1时必填 |
| version | 实验配置版本号 | number | 否 | 如果想更好地了解该用户的实验结果是来自你哪一次的实验配置调整，你可以用这个字段来表示，作为标记 |
| exp_set | 实验组数据 | Array\<object\> | 是 | - |

## exp_set 字段说明
| 字段 | 描述 | 类型 | 是否必填 | 其他
| -:| :- | :-: | :-:| :-:|
| id | 实验组标识 | string | 是 | - |
| weight | 实验组权重 | number | 是 | 在用户参与实验的比例的中，你期望有多少比例进入这组实验当中，可选范围 [0,1], 精度为 0.01。 注意：同一场景下的所有实验组权重相加不允许超过hit配置的值 |
| data | 实验组数据 | any | 是 | - |


# 运行实验
```
var result = abtest.run(layer_id);
```
## `run` 方法参数说明
| 字段 | 描述 | 类型 | 是否必填 | 其他
| -:| :- | :-: | :-:| :-:|
| layer_id | 场景标识  | string | 否 | 允许只运行指定场景下的实验，不传入则默认多场景实验同时进行 |

## `result` 运行结果说明
| 字段 | 描述 | 类型 | 其他
| -:| :- | :-: | :-:|
| layer | 场景集合  | object | 已进行实验的场景集合 |
| trace_id | 实验结果标识（含多场景实验）  | string | 命中对应场景实验下的标识组合`${app_id}_${layer_id}_${exp_id}_${version}`。 如果有多场景实验进行了实验，trace_id会以\|的形式分割:`${app_id}_${layer_id}_${exp_id}_${version}\|${app_id}_${layer_id}_${exp_id}_${version}` |
| uid | 用户UUID标识  | string | - |

### 注意
1. `trace_id`、`uid` 均会被追加到cookie上，设置于二级域名上，有效期为1年。
2. `trace_id` 在cookie中的key为 `abtest-trace-id-${trace_id}`
3. `uid` 在cookie中的key为 `abtest-uid-${trace_id}`


## `layer` 字段说明
| 字段 | 描述 | 类型 | 其他
| -:| :- | :-: | :-:|
| `[key]` | 初始化配置中自定义的场景标识 | object | -

### `[key]` 说明
| 字段 | 描述 | 类型 | 其他
| -:| :- | :-: | :-:|
| hit_exp_data | 命中该场景下的实验数据 | string | -
| hit_exp_id | 命中该场景下的实验标识 | string | -
| version | 命中该场景下的实验配置版本号 | number | -

