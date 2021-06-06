## About
A javascript ABTest lib running in browser
## Usage
```javascript
var abtest = new ABTest('abtestAppSymbol',[{
    layer_id:'layerSymbol',
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
{
	"layer": {
		"layerSymbol": {
			"hit_exp_data": "planB",
			"hit_exp_id": "2",
			"version": 1
		}
	},
	"trace_id": "abtestAppSymbol_layerSymbol_2_1",
	"uid": "7f65cb09-51ba-48b1-9622-fc698141b1dd"
}
```
## Attributes
| Attribute | Description | Type | Verbose
| -:| :- | :-: | :-:|
| layer_id | the scene id in this ABTest experiment | Number\|String | - |
| ref_exp_id | the reference experiment id  | Number\|String | -|
| ref_exp_data | the reference experiment data  | Any | -|
| hit | the percentage of users participating in the experiment | Number | range [0,1]  precision 0.01 |
| version | experiment version,will record to the trace_id | Number | - |
| exp_set | experiment group | Array | - |
| exp_set.weight | the percentage of experiment | Number | range [0,1]  precision 0.01 |

## Verbose
trace_id = `${app_id}_${layer_id}_${exp_id}_${version}`