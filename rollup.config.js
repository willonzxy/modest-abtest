import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
export default {
    input: 'src/main.js',
    legacy: true,
    output: [
        {
            file: './dist/modest-abtest.min.js',
            format: 'umd',
            name: 'ABTest',
            plugins: [terser()]
        },
        {
            file: './example/modest-abtest.js',
            format: 'umd',
            name: 'ABTest'
        }
    ],
    plugins: [
        resolve(),
        babel({
            babelHelpers: 'bundled'
        }),
        commonjs()
    ]
}