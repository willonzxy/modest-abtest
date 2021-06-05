# usage
```js
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
```

