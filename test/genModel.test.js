var expect = require('chai').expect;
var ABTest = require('../dist/abtest.min.js');

describe('abtest model generate test', function () {
    it('[case1]: 100% join in the abtest exp , two exp group allocation 50%', function () {
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
        expect(abtest.model).to.deep.equal({
            "launch_layer": {},
            "layer": {
                "layerSymbol": {
                    "ref_exp": {
                        "data": "planZero",
                        "bucket": [],
                        "version": 1
                    },
                    "exp_set": {
                        "1": {
                            "data": "planA",
                            "bucket": [
                                0,
                                1,
                                2,
                                3,
                                4,
                                5,
                                6,
                                7,
                                8,
                                9,
                                10,
                                11,
                                12,
                                13,
                                14,
                                15,
                                16,
                                17,
                                18,
                                19,
                                20,
                                21,
                                22,
                                23,
                                24,
                                25,
                                26,
                                27,
                                28,
                                29,
                                30,
                                31,
                                32,
                                33,
                                34,
                                35,
                                36,
                                37,
                                38,
                                39,
                                40,
                                41,
                                42,
                                43,
                                44,
                                45,
                                46,
                                47,
                                48,
                                49
                            ],
                            "version": 1
                        },
                        "2": {
                            "data": "planB",
                            "bucket": [
                                50,
                                51,
                                52,
                                53,
                                54,
                                55,
                                56,
                                57,
                                58,
                                59,
                                60,
                                61,
                                62,
                                63,
                                64,
                                65,
                                66,
                                67,
                                68,
                                69,
                                70,
                                71,
                                72,
                                73,
                                74,
                                75,
                                76,
                                77,
                                78,
                                79,
                                80,
                                81,
                                82,
                                83,
                                84,
                                85,
                                86,
                                87,
                                88,
                                89,
                                90,
                                91,
                                92,
                                93,
                                94,
                                95,
                                96,
                                97,
                                98,
                                99
                            ],
                            "version": 1
                        }
                    }
                }
            }
        });
    });
});