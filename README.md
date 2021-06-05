# About
A javascript ABTest lib running in browser
# Usage
```javascript
var abtest = new ABTest('abtestAppSymbol',[{
    layer_id:'layerSymbol',
    ref_exp_id:0,
    ref_exp_data:'planZero',
    version:1,
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

