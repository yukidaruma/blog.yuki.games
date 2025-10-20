---
title: '自作 Chrome Extension を WXT へ移行する'
published-at: 2025-09-28
---

### 背景

私 [@yukidaruma](https://github.com/yukidaruma) は [Livestream Chat Reader](https://chromewebstore.google.com/detail/livestream-chat-reader-ch/gpnckbhgpnjciklpoehkmligeaebigaa) という Chrome 拡張を開発しています。従来 [Chrome Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) (以下 CEB) をベースとするコードを利用して開発を行っていましたが、新機能をより高速に開発するため [WXT](https://wxt.dev/) への移行を実施しました[^1]。

Livestream Chat Reader の制作に関しては別記事 [2025年に個人で作ったもの#Livestream Chat Reader](./things-i-made-in-2025.md#livestream-chat-reader) の内容もご参照ください。

[^1]: 個人的な単機能のブラウザ拡張 (非公開) を WXT 用いて vibe coding したときに、 WXT が CEB より圧倒的に高速であることに気がついたことがきっかけです。

CEB から WXT への移行と合わせて、開発の高速化を目論み以下の変更も同時に実施しました:
- **ランタイム**: Node.js → [Bun](https://bun.sh/)
- **パッケージマネージャ**: pnpm → Bun
- **Unit テスト**: Mocha → Bun 内蔵のテストランナー
- **E2E テスト**: WebDriverIO → [Playwright](https://playwright.dev/)

具体的な実装については、それぞれ以下のコミット差分をご覧ください:
- Node.js + pnpm → Bun: [`b606757`](https://github.com/yukidaruma/LivestreamChatReader/commit/b6067579afa471c15cc328d0b9b936968cf627ad)
- Mocha → Bun: [`86e3b73`](https://github.com/yukidaruma/LivestreamChatReader/commit/86e3b73ff6244ec76b9fe2293f66f2662b926ac6)
  - このコミットには 1 点不備があり、 `tests/unit/text-filter.test.ts` ファイルで型エラーが発生する状態となっています。後続コミットで `bun i @types/bun` を実行し `import { describe, it } from 'bun:test'` とするコードを追加しています
- CEB → WXT: [`7368ad3`](https://github.com/yukidaruma/LivestreamChatReader/commit/7368ad335dd04850496a583b417cd6cd6c93a08e)
- WebDriverIO → Playwright: [`a2a2152`](https://github.com/yukidaruma/LivestreamChatReader/commit/a2a2152cf6de04a6090b7d47bb1b71f2896c25e0)

### WXT を使用する構成への移行

#### Workspaces 機能 (monorepo)
パッケージマネージャの変更に伴い、 [pnpm の workspaces 機能](https://pnpm.io/workspaces) から [Bun の workspaces 機能](https://bun.com/docs/install/workspaces) への変更が必要となりました。

**従来の構成 (pnpm)** ([`pnpm-workspace.yaml`](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/blob/6fde1ace754505c3dc7b7df48d1a619e12aa42c4/pnpm-workspace.yaml)):
```yaml
# pnpm-workspace.yaml
packages:
  - chrome-extension
  - pages/*
  - packages/*
  - tests/*
```

**移行後の構成 (Bun)**: `package.json` 内の `workspaces` フィールドで workspace を設定します。他の移行作業により `chrome-extension`、`pages`、`tests` ディレクトリを workspace に含める必要がなくなったため、 workspace 設定からそれらを削除しています。
```json
// package.json
{
  "workspaces": [
    "packages/*"
  ]
}
```

#### テスト関連の変更

テスト関連の依存パッケージを削減することを目的に、以下の変更を実施しました。

**E2E テストの移行**: Mocha + WebDriverIO の組み合わせから、 Playwright に移行しました (参考: [wxt-dev/examples (playwright-e2e-testing)](https://github.com/wxt-dev/examples/tree/main/examples/playwright-e2e-testing))。

**Unit テストランナーの移行** もともと CEB には単体テストのセットアップが含まれておらず、 Livestream Chat Reader では独自に Mocha を利用していました。 Bun 内臓のテストランナーを利用し Mocha への依存を削除するため、以下の変更を行っています。
```diff
- import { describe, it } from 'mocha';
+ import { describe, it } from 'bun:test';
```

### WXT で気に入っている部分

CEB はフレームワークではなく boilerplate としてコードが提供されているため、開発に必要なツールのコードがプロジェクトに含まれてしまう状態にありました[^2]。一方 WXT はフレームワーク内にビルドツールがすべて含まれていて、 `wxt` の CLI からすべての機能を利用することができます。このおかげで WXT への移行の結果、拡張機能のコードベースを小さくすることができました。

また Turborepo を使用しなくなったことで[^3]ビルド時間が大幅に短縮され、 2.0.0 のリリースでは新機能の追加があったにもかかわらず約 80% のバンドルサイズの削減を実現しました（688 kB → 137 kB）。

[^2]: 具体的には `dev-utils`, `i18n`, `zipper`, `vite-config`, `tailwindcss-config`, `module-manager` の package を指します。
[^3]: 各サブパッケージを一つずつビルドしてから拡張機能本体をビルドする形になっていました。 lint についても同様です。

#### その他の便利な機能の紹介
WXT は他にも便利な機能が存在しています。その一部を Livestream Chat Reader の開発と関連する形で紹介します。

- 拡張機能がインストールされたブラウザの自動起動
  - 開発時に拡張機能がプリインストールされた状態でブラウザを起動してくれる機能です (参考: [WXT - Browser Startup](https://wxt.dev/guide/essentials/config/browser-startup))
  - Livestream Chat Reader は Dev Container を使用して開発を行っているため、この機能を無効化しています。 Dev Container 内でもブラウザの GUI を利用することは可能ですが、動作が遅く実用に適さないためです (参考: [WXT - How do I run my WXT project with docker / devcontainers?](https://wxt.dev/guide/resources/faq.html#how-do-i-run-my-wxt-project-with-docker-devcontainers))
- **WXT Auto Icons** ([`@wxt-dev/auto-icons`](https://wxt.dev/auto-icons))
  - 複数サイズのアイコンを自動生成してくれる WXT のプラグインです。内部で [sharp](https://www.npmjs.com/package/sharp) を利用しており、 SVG にも対応します
  - Livestream Chat Reader では拡張機能の有効状態に応じて動的にアイコンを変更する機能を実装しているため別途手動で作成したアイコン画像も存在するのですが、アイコンに "DEV" のラベルを表示してくれるのが便利なため使用しています

### WXT への移行後も利用している CEB 由来のコード

CEB に含まれていたコードで便利だったものは、 WXT への移行後も引き続き活用しています。

#### 画面間での設定値の同期
CEB には [`chrome.storage`](https://developer.chrome.com/docs/extensions/reference/api/storage) API を React Hook として wrap するコードが含まれていて、画面間で設定値を同期するコードを簡単に実装することができます。この機能の動作については、 [CEB の README.md のデモ動画](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite#readme) をご覧いただくと理解しやすいです。

**基本的な使用方法**:
```tsx
const Panel = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  return (
    <div className={classNames('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      ...
    </div>
  )
};
```

**テーマ切り替えに関する改良**:
CEB の元のコードは宣言的で分かりやすいのですが、テーマの切り替えに関しては表示を切り替えたい箇所が増えるにつれて記述が冗長となる問題が存在しました。そこで、Tailwind CSS の [data attribute による dark mode 切り替え機能](https://tailwindcss.com/docs/dark-mode#using-a-data-attribute) を活用し記述を簡潔にできるよう、 `useThemeStorage` hook を作成して HTML 要素の `data-theme` 属性を自動的に切り替えるアプローチに変更しました。

<details>
<summary><code>useThemeStorage</code> hook の実装</summary>

```ts
import { useStorage } from './use-storage';
import { themeStorage } from '@extension/storage';
import { useEffect } from 'react';

export const HTML_DATA_THEME_KEY = 'data-theme';

/**
 * A wrapper hook around useStorage(themeStorage) that automatically adds
 * data-theme attribute to `<html>`.
 */
export const useThemeStorage = () => {
  const result = useStorage(themeStorage);
  const { isLight } = result;

  useEffect(() => {
    // Set data-theme attribute on document.documentElement
    const themeValue = isLight ? 'light' : 'dark';
    document.documentElement.setAttribute(HTML_DATA_THEME_KEY, themeValue);

    // Cleanup function to remove the attribute
    return () => {
      document.documentElement.removeAttribute(HTML_DATA_THEME_KEY);
    };
  }, [isLight]);

  return { ...result, toggle: themeStorage.toggle };
};
```
</details>

拡張機能の有効状態に応じてアイコンを切り替える機能についても同様の hook を作成することで実現しています ([`chrome.action.setIcon`](https://developer.chrome.com/docs/extensions/reference/api/action#icon))。

### WXT への移行で見直した機能

#### 国際化対応 (i18n)
CEB に含まれる [i18n パッケージ](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/blob/6fde1ace754505c3dc7b7df48d1a619e12aa42c4/packages/i18n/lib/set-related-locale-import.ts#L22-L33) は、開発環境と本番環境でコードを動的に差し替える仕組みになっていました。この実装には、言語リソースファイル（例: `/_locales/ja/messages.json`）を変更した際に拡張機能内の画面（例: `chrome-extension://.../options.html`）が自動的に閉じるのを防ぐ効果がありました[^4]。しかしながら、 Livestream Chat Reader の開発においてはできるだけビルド機構を簡潔な状態に保ちたかったので、この機能の移植を見送ることとしました[^5]。
また WXT が提供する [@wxt-dev/i18n](https://github.com/wxt-dev/wxt/tree/main/packages/i18n) プラグインは、 locale ファイルの構造を単純化し[^6] 複数形に対応させるものですが、現時点での必要性が乏しかったため採用を見送っています。 なお、このプラグインは WXT や特定のライブラリに依存しない実装となっており、一般的な Web アプリケーションでも利用可能です。

[^4]: この効果は意図的に実現されたものではなく、副産物ではないかと推測されます。
[^5]: CEB と WXT はいずれも最終的に Chrome の国際化対応 API ([chrome.i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n)) を使用しています。この API には、ブラウザの UI 言語を変更しなければ多言語版のテストができないというデメリットが存在しています。現在サポートしている 2 言語のテストは少し不便ながらも対応できていますが、将来的には根本的に異なるアプローチで国際化対応を再実装することも検討しています。
[^6]: `{ "foo": { "messages": "bar" } }` の代わりに `{ "foo": "bar" }` と省略して書くことができます。

#### 環境変数管理
CEB の環境変数管理は Bash スクリプト ([set_global_env.sh](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/blob/6fde1ace754505c3dc7b7df48d1a619e12aa42c4/bash-scripts/set_global_env.sh#L57)) を利用する形になっており、環境変数の追加や切り替えの操作が煩雑でした。また、`process.env` を参照する実装のため、content script から環境変数を利用できないという制約もありました。
WXT への移行後は [Vite の環境変数機構](https://ja.vite.dev/guide/env-and-mode.html#env-variables) をそのまま利用できるようになり (例: `import.meta.env.VITE_FOO`)、環境変数を用いた機能の切り替えが簡単に実現できるようになりました。

具体的な改善例として、 E2E テストにおける挙動の切り替えがあります。従来は [`navigator.webdriver`](https://developer.mozilla.org/ja/docs/Web/API/Navigator/webdriver) を利用して分岐していましたが、環境変数を用いた判定に変更することで、製品版では不要となるコードを dead-code elimination で削除できるようになりました（<a href="https://github.com/yukidaruma/LivestreamChatReader/commit/af7a9338f1471e15b06b0bd0471a4b83d238431a"><code>af7a933</code></a>）。

### あとがき

過去に WXT が誕生する以前に CEB を使用して Chrome 拡張を開発した経験があり、その流れで Livestream Chat Reader の開発でも当初は CEB を採用していました。しかしながら、今回 WXT に移行してみて、大幅な開発体験の向上を実感することができました。 CEB も WXT も、どちらも Chrome Extension 開発のベストプラクティスが詰まった素晴らしいツールではありますが、これから新規で Chrome 拡張の開発を始める際には、より新しく効率的に多くの課題を解決している WXT を選択されることをおすすめします。

最後になりますが、これらの優れたツールの開発者の皆様への感謝を申し上げます。
