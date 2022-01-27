// rollup.config.js
import { join } from 'path';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import license from 'rollup-plugin-license';
import del from 'rollup-plugin-delete';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/i18n-babel.esm.min.js',
            format: 'iife',
            exports: 'default',
            name: 'Translator',
        },
        {
            file: 'dist/i18n-babel.es.min.js',
            format: 'es',
            exports: 'default',
        },
        {
            file: 'dist/i18n-babel.min.js',
            format: 'umd',
            exports: 'default',
            name: 'Translator',
        },
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.json' }),
        copy({
            targets: [
                { src: 'src/components.d.ts', dest: 'dist' },
                { src: 'dist/lib/index.d.ts', dest: 'dist' },
                { src: 'dist/lib/translator.d.ts', dest: 'dist' },
                { src: 'dist/lib/types.d.ts', dest: 'dist' },
            ],
            hook: 'writeBundle',
        }),
        del({ targets: 'dist/lib', hook: 'closeBundle' }),
        terser({ format: { comments: false } }),
        license({
            banner: {
                commentStyle: 'ignored', // The default
                content: {
                    file: join(__dirname, 'LICENSE'),
                    encoding: 'utf-8', // Default is utf-8
                },
            },
        }),
    ],
};
