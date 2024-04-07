import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
export default {
    input: 'src/main.js',
    legacy: true,
    output: [
        {
            file: './dist/modest-abtest.cjs.min.js',
            format: 'cjs',
            name: 'ABTest',
            plugins: [terser()]
        },
        {
            file: './dist/modest-abtest.esm.min.js',
            format: 'es',
            name: 'ABTest',
            plugins: [terser()]
        },
        {
            file: './example/modest-abtest.iife.min.js',
            format: 'iife',
            name: 'ABTest',
            plugins: [terser()]
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