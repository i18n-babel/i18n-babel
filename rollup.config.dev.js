// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/i18n-babel.esm.min.js',
            format: 'iife',
            exports: 'default',
            name: 'Translator',
            sourcemap: true,
        },
        {
            file: 'dist/i18n-babel.es.min.js',
            format: 'es',
            exports: 'default',
            sourcemap: true,
        },
        {
            file: 'dist/i18n-babel.min.js',
            format: 'umd',
            exports: 'default',
            name: 'Translator',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript(),
        copy({
            targets: [
                { src: 'examples/plain-js/all*', dest: 'dist' },
                {
                    src: 'examples/plain-js/index.html',
                    dest: 'dist',
                    transform: (content) => content.toString()
                        .replace(/https:\/\/unpkg.com\/i18n-babel\/dist/ig, '')
                        .replace(/assetsLocation: '.*'/ig, 'assetsLocation: \'\''),
                },
            ]
        }),
        serve('dist'),
    ],
};
