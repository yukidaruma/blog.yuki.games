---
title: 'サイトリニューアル + Markdownブログを構築する (SvelteKit, mdsvex)'
published-at: 2025-09-27
updated-at: 2025-09-28
---

### これまでの私と個人サイト/ブログとの関わり
過去に私は、 WordPress[^1] やはてなブログ ([2015～2017年のブログ](https://dota2yukidaruman.hatenablog.com/); 趣味についてのブログ[^2]) といった既存のプラットフォームで個人ブログを運営した経験がありました。2021年頃に Next.js で独自ブログの構築を試みましたが満足のいく成果を得られず、結果的に長期間ブログ活動から遠ざかった状態にありました。

今回は最後の挑戦以来に積んだ経験を活かしてアクセシビリティとパフォーマンスに優れた個人サイトを構築したいと考え、これまで使用したことがない Svelte ([SvelteKit](https://svelte.dev/docs/kit/introduction)) を使用してブログを構築することを決意しました[^3]。

[^1]: 2012年ごろに独自の .jp ドメインを使用する個人サイトを所有しており、その一部で WordPress を利用したブログコンテンツが存在していました。しかしながらバックアップが存在せず、 Wayback Machine にも記録されていないため、当時のコンテンツを確認する方法が存在していません。
[^2]: 面白い特徴として、ブログのサイドバーに Dota 2 というゲームの直近のプレイ記録を表示する機能を持っていました (Python + wkhtmltoimage)。
[^3]: 主要なフレームワークと対比して書くべきコードが簡潔なことに加え、特にランタイムサイズが小さい点がパフォーマンス向上に寄与すると考え、 Svelte の採用を決定しました。

### 構成
ブログ記事を git で管理しようとすると、下書きや誤字修正などの軽微な変更のコミットが発生しやすく、コミット履歴が汚れがちです[^4]。そこでブログシステムとブログ記事のリポジトリを別とすることにしました。コードとコンテンツの間に明確な境界を設けることで、それぞれの独立性を高めることを目指しました[^5]。

- [yukidaruma/blog.yuki.games](https://github.com/yukidaruma/blog.yuki.games)
  - 記事や画像のような静的なコンテンツを格納します
  - このリポジトリ単体にはブログを描画する機能はありませんが、 github.com の Markdown 表示機能を利用して記事を読むことができます
- [yukidaruma/yuki.games](https://github.com/yukidaruma/yuki.games)
  - SvelteKit を使用して作られた個人サイトです
  - サイトのコンテンツの一部として、ブログを描画する機能を持ちます
  - `git submodule` を利用して `blog.yuki.games` のコンテンツをリポジトリ内に取り込んでいます

[^4]: 私は個人開発の際に amend/rebase といった操作を行うことが多いのですが、これらの操作後に GitHub の main ブランチに push すると意図せず GitHub 上の contribution 数が増加しています。これを避けるため、 main ブランチではないブランチを使用してコンテンツを管理したいと考えています。
[^5]: 具体的には、 (1) コンテンツを除くシステムだけで再利用できるようにしたい (2) ポータビリティを高め、将来的に別のブログシステムに移行できるようにしたい (3) 個人サイトと同じドメインでブログを公開したい という考えを持っています。

#### ブログ設定についての説明
具体的な実装については、コミット差分をご覧ください ([`yukidaruma/yuki.games@1cccaf5`](https://github.com/yukidaruma/yuki.games/commit/1cccaf5721f2c6281495f625479c0ffafcd7adfb); [`diff: yukidaruma/yuki.games@fa38914...d17e949`](https://github.com/yukidaruma/yuki.games/compare/abd198f0b4a8dbaeac26d00805a005459c56e8de...d17e94925251f1074f6df784274e62e589927214))。

[mdsvex](https://www.npmjs.com/package/mdsvex) ([website](https://mdsvex.pngwn.io/)) と [vite-plugin-static-copy](https://www.npmjs.com/package/vite-plugin-static-copy) の 2 つのパッケージの利用が今回のセットアップでは必須となります。それ以外に紹介しているパッケージについては、利用する Markdown の拡張機能に応じてお好みで導入してください。

<details>
<summary><code>vite.config.ts</code> の設定項目抜粋</summary>

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    // submodule のフォルダ内の静的コンテンツを public フォルダに存在するかのように扱う
    // (dev サーバーの実行時・ build 時にファイルのコピーを行う)
    viteStaticCopy({
      targets: [{ src: 'blog.yuki.games/contents/static/**/*', dest: 'blog/static' }]
    }),
    sveltekit()
  ],
  server: {
    fs: {
      allow: ['blog.yuki.games'] // submodule のフォルダから import できるよう、許可リストに追加する
    }
  }
});
```
</details>

<details>
<summary><code>svelte.config.js</code> の設定項目抜粋</summary>

```js
import { mdsvex } from 'mdsvex';
import remarkFootnotes from 'remark-footnotes';
import remarkHeadingId from 'remark-heading-id';

// svelte.config.js
export default {
  extensions: ['.svelte', '.md', '.svx'], // ブログコンテンツで使用される拡張子を記述する
  preprocess: [
    mdsvex({
      extensions: ['.md', '.svx'], // (同上) ブログコンテンツで使用される拡張子を記述する
      remarkPlugins: [
        // TOC を使用する場合のみ; uniqueDefaults は見出しの文字列に重複が存在するとき必要
        // ※ npm からインストールすると uniqueDefaults を使用できない
        [remarkHeadingId, { defaults: true, uniqueDefaults: true }],
        remarkFootnotes // 脚注 (`[^1](...)`) を使用する場合のみ
      ],
      rehypePlugins: [toc] // TOC を使用する場合のみ
    })
  ],
  compilerOptions: {
    experimental: {
      async: true // https://svelte.dev/docs/svelte/await-expressions
    }
  }
};
```
</details>

- デプロイするブログのコンテンツは、 `publish` というブランチに push するという規約を設けています
  ```bash
  # 初回設定
  git submodule add -b publish https://github.com/yukidaruma/blog.yuki.games

  # コンテンツの更新反映
  git submodule update --force --remote blog.yuki.games
  ```
  - Vercel へのデプロイ時には、デフォルトで Vercel がサブモジュールを clone (`git clone --recursive`) してくれるため、追加の設定が不要でした。プライベートリポジトリを使用するためには package.json 内の dependencies として設定する必要があることにご注意ください (Vercel: [Build Features for Customizing Deployments - Git submodules](https://vercel.com/docs/builds/build-features#git-submodules))
- SvelteKit 標準の Vite を利用するセットアップで submodule 内の静的コンテンツを[public フォルダのアセット](https://vite.dev/guide/assets.html#the-public-directory)として参照するため、 [`vite-plugin-static-copy`](https://www.npmjs.com/package/vite-plugin-static-copy) を利用しています
- mdsvex を使用して `.md` ファイルの loader として利用して、 JS コード内で import して使用できるようにしています
  - 今回のセットアップでは Svelte から Markdown を import する形でのみ使用していますが、 (React における `.mdx` のように) Markdown 中で Svelte を利用することもできます
  - Markdown のスタイルについては、 GitHub の CSS に慣れている人が多いと考え [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) を利用して GitHub と同等のスタイルを適用するようにしました。ただしコードブロックのシンタックスハイライト部分については、 mdsvex がシンタックスハイライタに [Prism.js](https://prismjs.com/) を使用しており GitHub のクラス名と互換性がないため、 [PrismJS/prism-themes](https://github.com/PrismJS/prism-themes) を利用して Prism.js が提供するテーマを利用するようにしました
    ```css
    /* Run `npm i github-markdown-css prism-themes` beforehand */
    :global {
      @import 'github-markdown-css/github-markdown-dark.css';
      @import 'prism-themes/themes/prism-a11y-dark.css';
    }
    ```
- Svelte 5.36+ (2025年7月) の実験的機能である [await](https://svelte.dev/docs/svelte/await-expressions) を利用することで、コンポーネントコード内で `await` を使用し SSR でのコンテンツ読み込みを実装しています
  - 参考にしたセットアップ [mvasigh/sveltekit-mdsvex-blog](https://github.com/mvasigh/sveltekit-mdsvex-blog) (2022年) では個別記事ページでも `import.meta.glob` を使用していたのですが、非効率であったため変更しています
- **UPDATE (2025-09-28)**: GitHub / テキストエディタ上で Markdown ファイル間のリンクを機能させつつ Web 上では `.md` の拡張子をリンクの href から削除するため、 `rehype-urls` を使用するよう変更しました
  <details>
  <summary>svelte.config.js - mdsvex の rehypePlugins に追加</summary>

  ```js
  [
    rehypeUrls,
    function (url) {
      if (url.pathname?.endsWith('.md')) {
        url.pathname = url.pathname.slice(0, -3);
      }
      return url;
    }
  ]
  ```
  </details>
- **UPDATE (2025-09-28)**: rss.xml を配信するようにしました ([`1eacdcc`](https://github.com/yukidaruma/yuki.games/commit/1eacdcc3003066b096b10b331df4512928d2fb74))
  - ビルド時に rss.xml の内容は決定しているので、 [prerender の page option](https://svelte.dev/docs/kit/page-options#prerender) を使用して静的ファイルが生成されるようにしています
    <details>
    <summary>src/routes/rss.xml/+server.ts</summary>

    ```ts
    export const prerender = true;

    const getBlogPosts = () => { /* ... */ };
    const generateRss = () => { /* ... */ };
    export const GET: RequestHandler = async () => {
      const markdownFiles = import.meta.glob('../../../blog.yuki.games/contents/*.md', {
        as: 'raw',
        eager: true
      });

      const posts = getBlogPosts(markdownFiles).slice(0, 50); // Limit to latest 50 posts
      const rssXml = generateRss(posts);

      return new Response(rssXml, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'max-age=3600'
        }
      });
    };
    ```
    </details>

#### 試行錯誤の記録
今回のセットアップでは、 mdsvex との組み合わせによる制約に由来するパッケージ選定が多くなっています。以下に最終的なセットアップに至った説明を記載します。

- 特に静的ファイルの部分が、自分の構成にあった正解を見つけるのに難航しました
  - symbolic link を利用して、 `public` フォルダ内に実際にファイルが存在するかのように見せかける (`ln -s ./blog.yuki.games/contents/static public/blog/static`)
    - おそらく Vite が `public/` フォルダ内の symlink を辿らないようで、意図通りに機能しなかった
  - Markdown 内の URL を動的に書き換え、 Github を CDN 代わりに利用してファイルを読み込む (`rehype-urls`, `rehype-url-inspector` など)
    - ~~外部リンクに対して `target="_blank"` を追加するという使い方はできた一方で、いずれのライブラリも `href` や `src` を書き換えることができなかった~~  
      **UPDATE (2025-09-28)**: `href` そのものではなく、 `pathname` を書き換えればリンクの href を変更できることがわかりました
  - mdsvex の拡張で処理できないか検討する (例: [mdsvex-relative-images](https://github.com/mattjennings/mdsvex-relative-images))
    - 初期状態では画像以外のリソースに対応していない (例: `<video>`)
  - サーバーに API ルートを追加する (意図した通りの動作を実現することができたが、問題があり却下)
    - リクエストごとに負荷が発生する
    - 静的ファイルとしてデプロイできない
    - Node の `Response` オブジェクトで返す必要があり、 `ReadableStream` を使用してレスポンスを返すことができず非効率である (やり方が間違っているかもしれない; See: [sveltejs/kit#5344](https://github.com/sveltejs/kit/issues/5344))
  - 複数の `public` フォルダを使用できるようにする Vite プラグインを追加する [vite-multiple-assets](https://github.com/nguyenbatranvan/vite-multiple-assets)
    - 設定の問題か、意図通りに機能しなかった
- コードブロックの言語名指定の対応が、 GitHub と異なっている ([PrismJS/prism#1665](https://github.com/PrismJS/prism/issues/1665))
  - `vue`, `svelte` -> `html`
  - `sh` -> `bash`
- remark プラグインについて、注意点が存在する
  - `remark-footnotes` は [npm](https://www.npmjs.com/package/remark-footnotes) で deprecated となっているのですが、 mdsvex 側の仕様により ([pngwn/MDsveX#374](https://github.com/pngwn/MDsveX/issues/374)) 古いパッケージでなければ footnote が機能しない状態となっていました
  - `remark-heading-id` を利用して Markdown 中の `<h1>` ～ `<h6>` に `id` 属性を設定しているのですが、当該ライブラリの npm で配布されているソースコードが GitHub で配布されているものと一致しておらず、 `uniqueDefaults` オプションを利用することができませんでした ([imcuttle/remark-heading-id#10](https://github.com/imcuttle/remark-heading-id/issues/10))
    - この問題を回避するため、 `npm i imcuttle/remark-heading-id#5f6272e54a0d7182a9b8f06dfea7b71e89b31d44` の形で GitHub からパッケージを直接インストールするようにしています

### 工夫した点
- JavaScript がなくてもすべてのコンテンツが閲覧できることを目指しています
  - サイトトップのこれまでの個人プロジェクトを紹介するセクションは、当初 Svelte 内の状態管理で表示・非表示を切り替える実装を取っていました。しかしながら、チェックボックスをチェックするまでDOMツリー上に要素が存在しない状態となってしまうことに気が付き、 CSS の [subsequent-sibling combinator (`~`)](https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator) を使用して CSS のみで表示・非表示を切り替えるように変更しました ([`yukidaruma/yuki.games@2a34eb2`](https://github.com/yukidaruma/yuki.games/commit/2a34eb24888e07664bb802b240d8cc6b78ca4e9f))
    <details>
    <summary><code>~</code> セレクタを使用して、画面内の他の箇所のチェックボックスの状態に応じたコンテンツの表示を切り替える CSS</summary>

    ```html
    <style>
      .extra {
        display: none;
      }
      div:has(#show-extra:checked) ~ p.extra {
        display: block;
      }
    </style>

    <div>
      <input type="checkbox" id="show-extra">
      <label for="show-extra">Show extra items</label>
    </div>

    <p>item 1</p>
    <p>item 2</p>
    <p class="extra">extra item 1</p>
    <p class="extra">extra item 2</p>
    <p class="extra">extra item 3</p>
    ```
    </details>
  - 同じくプロジェクト紹介の "Read More" ボタンについても、 JavaScript 有効時はダイアログが開き無効時は `<details>` として機能するように実装しています
  - 特に LLM が流行っている昨今では、アクセシビリティを高めることは人間のみならず Bot からのコンテンツを利用にも繋がるため、有益であると考えています
- ブログの検索機能を自前で実装する代わりに、 GitHub の検索を利用するフォームを用意することで検索機能を実現しています (`<form action="https://github.com/search">`)
  <details>
  <summary><code>&lt;GitHubSearch&gt;</code> コンポーネントの実装コード</summary>

  JavaScript が有効なとき、検索クエリのリポジトリ指定部分 (`repo:blog.yuki.games `) を動的に挿入する実装を行っています。実際のコードでは TypeScript を使用しており、また JS の有効状態による表示の分岐 (FOUC対策) を行っています。

  ```html
  <script>
    let inputValue = $state(`repo:blog.yuki.games `);
    onMount(() => {
      inputValue = '';
    });

    function handleSearch(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const query = formData.get('q');
      const searchUrl = `https://github.com/search?type=code&q=repo:blog.yuki.games+${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank');
    }
  </script>

  <form
    role="search"
    method="get"
    action="https://github.com/search"
    target="_blank"
    onsubmit={handleSearch}
  >
    <div>
      <label for="search-input">Search on GitHub:</label>
      <input type="hidden" name="type" value="code" />
      <input
        id="search-input"
        type="text"
        name="q"
        placeholder="Search keyword"
        spellcheck={false}
        required
        bind:value={inputValue}
      />
      <button type="submit">Search</button>
  </form>
  ```

  </details>
- [404エラーページ](https://yuki.games/404)のメッセージにちょっとした遊び心を持たせています⛄️
