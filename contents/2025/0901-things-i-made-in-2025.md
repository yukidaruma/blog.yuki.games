---
title: 2025年に個人で作ったもの
lang: ja
---

この記事では、2025年のこれまでに私 [@yukidaruma](https://github.com/yukidaruma) が完成させたプロジェクトを紹介します。いずれのプロジェクトも MIT ライセンスの OSS として GitHub 上でソースコードを公開しています。

### [Pokéfuta Tracker](https://pokefuta.yuki.games/)
Pokéfuta Tracker は日本全国に存在するポケふた (ポケモンが描かれたマンホールの蓋) の訪問を記録するためのアプリです ([GitHub](https://github.com/yukidaruma/pokefuta-tracker)) 。

フレームワークとして Next.js を、 マップ表示部分には OpenLayers + OpenStreetMap を使用しています。

#### 最適化
屋外のモバイルネットワーク接続で利用することを想定しているため、転送量の削減を含むパフォーマンスの最適化を行っています。

- 日本中のポケふたを地図に表示する部分で、 OpenLayers の WebGL アイコンスプライト機能を利用する
  - 参考: [OpenLayersのデモ](https://openlayers.org/en/latest/examples/icon-sprite-webgl.html), [比較動画を含む X のポスト](https://x.com/YukiDotGames/status/1936566390653333901)
  - このスプライトシートを、 [CSS スプライト](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_images/Implementing_image_sprites_in_CSS)で一覧表示に利用しています (実装はこちらが先)
  - スプライトのファイルサイズが大きすぎることにより、画像の読み込みが間に合わない現象が発生する場合があります
    - OpenLayers のソースコードを確認し、画像の読み込みを完了する前は `HTMLImageElement` の `complete` property が `false` となるため、 0x0 のサイズの画像として判定されることにより起因する問題と認識しています (https://github.com/openlayers/openlayers/blob/8b4902fcefcd46a457731def3e39be29c74afb7e/src/ol/render/webgl/style.js#L156-L159)
      ```js
        // the size is provided asynchronously using a uniform
        uniforms[`u_texture${textureId}_size`] = () => {
          return image.complete ? [image.width, image.height] : [0, 0];
        };
      ```
- 詳細画面同士の画面遷移で History API を利用して、ナビゲーションの発生や reflow を抑制する ([yukidaruma/pokefuta-tracker@af3c70](https://github.com/yukidaruma/pokefuta-tracker/blob/af3c70791167d527c5d48f9f8d49f4d4f2603b48/app/%5Blocale%5D/item/%5Bid%5D/client-page.tsx#L63-L70))
- `next.config.ts` で画像ファイルに `immutable` のレスポンスヘッダを付与し、キャッシュを有効化する (https://zenn.dev/chot/articles/next-image-cache-control)
- `i18next` の fallback 機能を無効化し、表示しない言語のテキストを読み込まないようにする
  - すべての言語の翻訳テキストに不足がなければ、 fallback text は不要であるため ([i18next - Discussions (#2035)](https://github.com/i18next/i18next/discussions/2035#discussioncomment-7011527))

#### 制作後記
ちょうど開発を始めた2025年2月頃に vibe coding のブームが起きているのを横目に見ながら、これまでの知識の組み合わせと伝統的な手書きコーディングで手作りの Web アプリ開発を目指しました。  
モノ自体よくできていて便利だと思うのですが、 Google 検索に出てこず宣伝を行っていないのでおそらく誰にも使われていません… ([^pokefuta-1]) 。  
いくつか新機能や、 Service Worker を活用してネットワーク接続がなくても利用できるようにするといったアイデアがありますが、利用者がいない状況のため開発の意欲を失っています。

[^pokefuta-1]: 独自性の低いコンテンツと判定されてしまっているのか、 Google Search Console 上で `「ページはインデックスに登録されていません: クロール済み - インデックス未登録」` のステータスとなっています。[Bing にはインデックスされているようですが](https://www.bing.com/search?q=site%3Apokefuta.yuki.games)、特に日本では Bing の市場シェアが低く、事実上 Web に存在しない状態となっています。

### [Livestream Chat Reader](https://chromewebstore.google.com/detail/livestream-chat-reader-ch/gpnckbhgpnjciklpoehkmligeaebigaa)
Livestream Chat Reader は、 YouTube/Twitch ライブ配信のコメントを読み上げる Google Chrome 向け拡張機能です ([GitHub](https://github.com/yukidaruma/LivestreamChatReader)) 。 Chrome Web Store にて公開されています。

#### 制作後記
Google Play で Beta 版のアプリを公開した経験が過去にありますが、個人で審査を経たアプリを製品としてリリースするのはこれが初めてです。
設定確認用のテスト画面が拡張機能内に存在していて、その画面を利用する形の E2E テストも実装しています。

- 当初は [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) を使用していましたが、リリースビルドでのテストでユーザーの操作なしで Web Speech API を使用して音声を再生できないことが判明したため、バックグラウンドで [Chrome 拡張用の `chrome.tts` API](https://developer.chrome.com/docs/extensions/reference/api/tts) を使用するように変更しています ([`yukidaruma/LivestreamChatReader@d11fd812`](https://github.com/yukidaruma/LivestreamChatReader/commit/d11fd8121f62a9fb7f4aa879f470a6013c3225af)) 。
- [Jonghakseo/chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) (以下、CEB) を boilerplate に使用して Chrome 拡張機能を実装しています。
  しかしながら、これから新規に拡張機能を開発する場合には、以下の理由から [WXT](https://wxt.dev/) を使用して開発を行うことを推奨します。
  - CEB は Owner の [@Jonghakseo](https://github.com/Jonghakseo) さんと、 Maintainer の [@PatrykKuniczak](https://github.com/PatrykKuniczak) さんの 2 人で開発が行われていましたが、 Discord Server のやり取りで 2 人とも開発を停止する意向を示しているため ([^wxt-1])
    - Maintainer である Patryk さんは WXT に対して CEB が遅れていて、もはや CEB のメンテナンスを行う意味がないと述べています ([^wxt-2])
  - 小さなパッケージの集合体の monorepo の構造になっているが、これによってビルド時間が長く、設定が複雑なものとなっているため
  - 実際に WXT を利用した小さな (非公開の) 拡張機能を作成した感想として、 WXT の開発者体験が優れると感じているため
    - CEB に対して、ビルドやホットリロードが高速であること
    - framework-agnostic として作られていて、 React 以外の好みのフレームワークと組み合わせて利用することができること
    - `npm run dev` を実行すると、クリーンな環境に拡張機能だけがインストールされた状態の Chrome が自動的に起動すること
    - [サンプルコード](https://wxt.dev/examples.html)が豊富なこと
    - テンプレートがミニマルな構成で作られていて、フォルダ構造ベースで自動で設定が行われること (convention over configuration)

[^wxt-1]: 2025-09-01 時点ではまだ GitHub 上の CEB リポジトリでアナウンスされていません。 Feature Request を行うために Discord を覗いたところ、二人のやり取りを発見しました。

[^wxt-2]: [Discord Server より](https://discord.com/channels/1263404974830915637/1264514968288759889/1388615767393829004)引用:  
\> **Patryk Kuniczak**: WXT is a wayyyy far from us, i think it hasn't sense to maintain CEB longer, because we can't solve a couple issues in months, in this time WXT community can develop couple new features.

### [Emoji2Text](https://yukidaruma.github.io/emoji2text-font/demo.html) (フォント)
😀 => `grinning_face` のように、「絵文字のコードポイントにその絵文字の名前を表示するグリフのフォント」というアイデアを思いつき、実際にフォントを作成してみました ([GitHub](https://github.com/yukidaruma/emoji2text-font)) 。

![Showing glyph for snowman (U+2603) in FontForge](./0901-fontforge-emoji2text.png)

具体的には次のような手順の操作を行う FontForge script により、フォントを生成しています。
1. (`parse_emoji_test`) 絵文字の名称一覧データをパースする https://unicode.org/Public/draft/emoji/emoji-test.txt
2. (`copy_source_glyphs`) ベースとなるフォントから絵文字の名称表示に使用する文字をコピーする (アルファベット、英数、記号)
3. (`create_emoji_glyphs`) [`ccmp`](https://learn.microsoft.com/en-us/typography/opentype/spec/features_ae#tag-ccmp) を利用して、　`U+1F600` (😀) は `g`, `r`, `i`, `n`, ..., `e` の 13 文字から構成される 1 文字として表現するグリフを作成する
   - `ccmp` は一般的に、ラテン文字で使用されるアクセント付き文字を、アルファベットとアクセント記号に分けて再利用する目的で使用される機能だと考えられます (例: `à` = `a` + `` ` ``)
4. (`create_composition_glyphs`) 複数の Unicode コードポイントで表される絵文字 (例: `U+1F636` + `U+200D` + `U+1F32B` (😶‍🌫)) に対応するため、複数のコードポイントの組み合わせのリガチャを作成し、 "3." と同じ手順で名前を 1 文字で表現するグリフを作成する

まず実現できることを先に確かめるために、 Claude Code を利用してプロトタイプの作成を行いました。そのうえでプロトタイプ実装を最適化したうえで最終的に GitHub で公開したバージョンを作成しています ([^emoji2text-1]) 。

[^emoji2text-1]: "2." について、プロトタイプではソースフォント全体を丸ごとコピーする実装を行いました。その後、必要な文字だけ 1 文字ずつコピーする実装に置き換え、必要な文字すべてを 1 回の操作で (batch) コピーする実装へと最適化しました。  
"3." について、プロトタイプでは `ccmp` を利用する実装となっていませんでした。実際に使用される文字の種類に対してフォントサイズが肥大化しすぎてしまったため、 `ccmp` を利用する実装へと変更しています。  
"4." について、リガチャを使用するためには単体で使用されることがない文字 (例: `U+200D` (ZJW)) であってもコードポイントに対応するグリフが存在している必要があります。プロトタイプではすべての複数のコードポイントで表される絵文字について、毎回全コードポイント分のグリフを作成する実装となっていたため、この処理がコードポイントごとに一度だけ行われるように最適化を行っています。

#### 制作後記
手を動かしながらフォントを作成したり、 FontForge を利用してリリースされているフォントの内部構造を見たりしたことによって、フォントや絵文字について少し理解が深まりました。
- おそらく FontForge が扱えるグリフの横幅に `int16` に由来する制限が存在しているため、横に長過ぎるグリフを作成できない
  - このため、性別や肌の色による絵文字の区別を行っていません
- `face` のように頻繁に (155回) 出現する文字列を1文字のように取り扱い、重複部分の容量を削減できそう ([Emoji2Text (#3)](https://github.com/yukidaruma/emoji2text-font/issues/3))
  - Vibe cofing による実装では、 WOFF2 の brotli による圧縮が十分に効率的であったため、ファイルサイズの削減につながりませんでした ([^emoji2text-2]) 。 Gzip で使用されるような文字列の出現頻度に基づく圧縮/符号化アルゴリズムを応用すれば、優位なファイルサイズの削減が実現できるかもしれません。
- Chrome では一部の絵文字に Emoji2Text フォントを使用することができない ([Emoji2Text (#4)](https://github.com/yukidaruma/emoji2text-font/issues/4))
  - Chrome (Windows) では Variation Selector-16 (`U+FE0F`) つきの絵文字に文字フォント (色情報のないフォント) を使用することができませんでした。 `font-family` によるフォント指定が無視され、代わりにシステムの絵文字フォントが使用されました。
  - Mobile Safari では VS-16 つきの絵文字に Emoji2Text フォントを使用することができました。
- FontForge が利用している WOFF2 生成コード ([google/woff2](https://github.com/google/woff2)) が TTF にしか対応していないため、自動的に
  - FontForge 内部には WOFF2 (OTF) に対応する enum 値 ([ff_woff2_otf](https://github.com/fontforge/fontforge/blob/4c7c0579c8a16c95356069b79d28c8df60d2b450/fontforge/splinefont_enums.h#L63-L65)) が存在していますが、 WOFF2 ファイル作成時にはこの値は無視されるようです ([fontforge/fontforge (#5240)](https://github.com/fontforge/fontforge/issues/5240#issuecomment-1894676034)) 。
- Emoji2Text で使用されている手法を応用した次のようなプロジェクトのアイデア:
  - Emoji2Text とは逆に、 `grinning_face` のような文字列をリガチャで絵文字に変換する Text2Emoji フォント
  - `#123456` のようなカラーコードの文字列を色で表現する ColorCode2Emoji フォント
    - FontForge は絵文字フォントの作成に対応していないため、 FontTools のようなライブラリを使うことになると考えられます (https://github.com/fonttools/fonttools/discussions/2703) 。
    - CSS で使用される `#RGB` 形式の色コード (12-bit; 4096色) であれば実装できそうですが、 True color (24-bit; 約1678万色) に対応するグリフを持つフォントを作成することは難しそうです。
  - コピペ/スクレイピング対策として、人間には読めて機械に読めない文章の Web サイト
    - ビルドシステムと統合して (例: Vite plugin) そのようなフォントを利用する Web サイトを作成できると考えています。
    - 当然、アクセシビリティの観点からは不適切です。
- *トリビア*: Noto や Twitter Emoji といったフォントや Discord のようなアプリケーションは Regional Indicator を単体で使用できる絵文字のように取り扱っていますが、本来は単体で使用するものではないため、連続で入力したときに別の文字に変化してしまう現象が発生します: [Discordのキャプチャー動画](./0901-discord.mp4)

[^emoji2text-2]: `Emoji2Text.ttf.woff2` ファイルがすでに 52.5kB と容量が小さいため、これ以上ファイルサイズを小さくすることが難しいです。 TTF や OTF のような無圧縮のフォントフォーマットでは十分に効果があります。

#### フォントに関する追加の参考文献
今回の開発には使用しませんでしたが、フォントに関するソフトウェアを制作するうえで役に立ちそうな文献を記録しておきます。
- フォント作成の知識
  - https://silnrsi.github.io/FDBP/en-US/index.html - Font Development Best Practices
- OpenType の技術文書
  - https://learn.microsoft.com/en-us/typography/opentype/spec/ - OpenType® Specification
  - https://helpx.adobe.com/fonts/using/use-open-type-features.html - Using OpenType features

----

### あとがき

今後もこれら公開済みのソフトウェアのアップデートを継続しつつ、新規のプロジェクトにも取り組んでまいります。
