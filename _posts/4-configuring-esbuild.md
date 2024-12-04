---
title: 'esbuild の設定ファイル'
date: '2021-04-13T08:00:00+09:00'
coverImage: '/assets/esbuild.svg'
---

多くの設定・依存パッケージを必要とせず、 `npx esbuild index.tsx --jsx-factory=preact.h --jsx-fragment=preact.Fragment --bundle` の形で TypeScript+JSX (Preact) のアプリのビルド・バンドルが行える
とにかくビルド時間が短く

[esbuild](https://github.com/evanw/esbuild) には `webpack.config.js` や `.eslintrc` のような設定ファイルの仕組みをもたないので、プログラム的に呼び出すことで設定を行う必要があります。 ([#39](https://github.com/evanw/esbuild/issues/39), [#952](https://github.com/evanw/esbuild/issues/952))

`build`, `build:watch` のように

```javascript
const { build: runBuild, serve: runServe } = require('esbuild');
const fs = require('fs');

/** @type {string[]} */
const options = process.argv.slice(2);

const debug = options.includes('--debug');
const noMinify = options.includes('--no-minify');
const serve = options.includes('--serve');
const watch = options.includes('--watch');

console.log('Running esbuild with following options:');
console.table({
  debug,
  noMinify,
  serve,
  watch,
});

const postBuildProcess = async () => {
  // console.log('Running post-build process');
  // このタイミングで必要に応じて、 babel や terser を利用して、 polyfil の追加や minification を行うと良い
};

const shippingTable = JSON.stringify(require('./convert/output.json'));

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['./index.tsx'],
  jsxFragment: 'preact.Fragment',
  jsxFactory: 'preact.h',
  bundle: true,
  define: {
    // 文字列の置換を行う。置換後の値は valid JSON value である必要があるので、
    // 文字列であれば "foo" のようにクオートする必要がある。
    // See: https://esbuild.github.io/api/#define
    DEBUG: debug,
  },
  outfile: serve ? undefined : './index.min.js',
  outdir: serve ? 'www/js' : undefined,
  watch: watch
    ? {
        onRebuild: postBuildProcess,
      }
    : null,
  pure: debug ? undefined : ['console.log'], // `console.log` を副作用のない関数とみなすことで、削除できる
  minify: !noMinify,
  logLevel: 'info', // デフォルトのログレベルは "warning" であり、例えば `watch` で rebuild が行われてもメッセージが表示されないため、 "info" を設定している
};

/** @type {Promise<any>} */
let task;
if (serve) {
  task = runServe(
    {
      servedir: 'www/',
      onRequest({ method, status, path }) {
        console.log(`[${method}] ${status}\t${path}`);
      },
    },
    buildOptions,
  ).then(({ port }) => console.log(`Dev server is listening on: http://localhost:${port}`));
} else {
  task = runBuild(buildOptions);

  if (!watch) {
    task.then(postBuildProcess);
  }
}

task.catch((error) => {
  console.error(error);
  process.exit(1);
});
```

```jsonc
// package.json
{
  // ...
  "scripts": {
    "build": "node esbuild.config",
    "watch": "node esbuild.config --watch",
    "serve": "node esbuild.config --serve"
  }
}
```

### 使用例

```sh
$ npm run build # 通常
$ npm run build -- --debug # npm script で定義されている以外のコマンドライン引数を指定する
```

### 応用

今回紹介した設定では、 `serve` でビルドのタイミングで自動リロードが行われないのが面倒になるかもしれません。
その場合は、 `watch` + 別途 Web サーバを起動することで実現できるようです([例](https://github.com/nativew/esbuild-serve))。  
HMR を実現したいとなると、内部的に esbuild を利用している [vite](https://github.com/vitejs/vite) を利用するのが良さそうです([#97](https://github.com/evanw/esbuild/issues/97))。
