---
excerpt: 'VInput を拡張し、ファイルサイズによるバリデーションを実装してみます'
title: 'Vuetify: 入力コンポーネントにカスタムバリデーションを実装する'
date: '2021-01-09T18:00:00+09:00'
---

この記事では、 Vuetify の `<v-file-input>` コンポーネントを基に、ファイルサイズの上限設定を追加した `<file-input>` コンポーネントを実装していきながら、 `<v-form>` のバリデーション機構の理解、 `VInput` を継承した入力コンポーネントの拡張を目指します。

**TL;DR 完成済みソースコードへのリンク**

- [GitHub](https://github.com/yukidaruma/vuetify-extending-form-demo)
- [Try on Codesandbox](https://codesandbox.io/s/sad-nobel-ciom3)

<figure>
  <img src="/assets/blog/2/demo.gif" alt="実装した &lt;file-input&gt; コンポーネントの動作の様子">
  <figcaption>実装した &lt;file-input&gt; コンポーネントの動作の様子</figcaption>
</figure>

---

[Vuetify](https://vuetifyjs.com/) の `<v-input>` 系コンポーネントでは、 [rules prop](https://vuetifyjs.com/en/components/forms/#rules) を利用して入力のバリデーションを行うことが可能ですが、

- 非同期処理を含むバリデーションを実装したい
- 複数の入力コンポーネントをまたいでバリデーションを実装したい

といった場合、 rules では実現が難しいケースが存在するのではないかと思います。

### Vuetify のソースコードを読む

まずは [`<v-form>`](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/components/VForm/VForm.ts) のソースコードから、 `error` や `validate` といったキーワードを中心に探していきます。

手始めに、どのような流れで `<v-form>` が子要素のバリデーションを行った結果を `v-model` で通知しているかを調べてみましょう。  
[VForm.ts#L47-L65](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/components/VForm/VForm.ts#L47-L65), [#L111-L114](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/components/VForm/VForm.ts#L111-L114)

<details>
<summary>ソースコードの抜粋</summary>

```ts
export default mixins(/* ... */).extend({
  // ...
  watch: {
    errorBag: {
      handler (val) {
        const errors = Object.values(val).includes(true)

        this.$emit('input', !errors)
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    watchInput (input: any): Watchers {
      const watcher = (input: any): (() => void) => {
        return input.$watch('hasError', (val: boolean) => {
          this.$set(this.errorBag, input._uid, val)
        }, { immediate: true })
      }
    // ...
    },
    register (input: VInputInstance) {
      this.inputs.push(input)
      this.watchers.push(this.watchInput(input))
    },
    // ...
```

</details>

1. `register()` で `this.inputs` に 入力コンポーネントを登録する
2. `watchInputs()` で input 入力コンポーネントのエラー状態を監視する
   - **input の `hasError` プロパティがエラー状態を表している**
   - エラーがあれば `this.errorBag` に保持する
3. `watch` で、 `this.errorBag` が空であれば `true` を、1 つでもエラーがあれば `false` を emit する

`<v-form>` のバリデーションが実現されていることがわかりました。次に個々の入力コンポーネントがどのようにエラーを判定しているかを調べてみることにします。

いくつかの入力コンポーネントのソースコードを確認したところ、

- `VInput` を extends していること
- `validatable` mixin を利用していること

がわかり、 `hasError` は `validatable` mixin ([validatable/index.ts#L79-L85](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/mixins/validatable/index.ts#L79-L85)) 内で定義されていることがわかりました。

- [VInput](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/components/VInput/VInput.ts#L26-L37)
- [validatable mixin](https://github.com/vuetifyjs/vuetify/blob/252aae59539950b8fc4ad3df4def246a0a0d9372/packages/vuetify/src/mixins/validatable/index.ts)

これらを踏まえ、 `VInput` を extends し `hasError` computed property を override することで、入力コンポーネントにエラーが存在すると判定されるようになるか確かめてみましょう。

<details>
<summary>App.vue</summary>

```vue
<template>
  <v-app>
    <v-main class="ma-8">
      <v-form v-model="isValid">
        <custom-validation />
      </v-form>

      <p>
        Is form valid? <b :class="isValid || 'red--text'">{{ isValid }}</b>
      </p>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import CustomValidation from './components/CustomValidation.vue';

export default Vue.extend({
  name: 'App',
  components: {
    CustomValidation,
  },
  data() {
    return {
      isValid: false,
    };
  },
});
</script>
```

</details>

<details>
<summary>components/CustomValidation.vue</summary>

```vue
<template>
  <v-text-field v-model="input" />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import VInput from 'vuetify/es5/components/VInput';

export default Vue.extend({
  extends: (VInput as unknown) as typeof Vue,
  data() {
    return { input: '' };
  },
  computed: {
    hasError(): boolean {
      return !this.input; // 入力が空であれば true を返す (=入力エラーが存在する)
    },
  },
});
</script>
```

</details>

`hasError() { return !this.input; }` とした結果、入力がなければ `error` であると認識されるようになりました。

<figure>
  <img src="/assets/blog/2/has-error.gif" alt="hasError() の override で入力エラーの判定が行われる様子">
  <figcaption>hasError() の override で入力エラーの判定が行われる様子</figcaption>
</figure>

### <file-input> コンポーネントの作成

ようやくここで独自のバリデーションを実現した入力コンポーネントを実装する準備が整いました 🎉。
あとは、 `hasError()` に、選択したファイルの容量が超過していないかチェックするコードを実装するだけです。

最終的には次のようなコードになりました。

<details>
<summary>App.vue</summary>

[View App.vue on GitHub](https://github.com/yukidaruma/vuetify-extending-form-demo/blob/main/src/App.vue)

```vue
<template>
  <v-app>
    <v-main class="ma-8">
      <v-form v-model="isValid">
        <file-input ref="fileInput" :max-file-size="maxFileSize" />
      </v-form>

      <p>
        Is form valid? <b :class="isValid || 'red--text'">{{ isValid }}</b>
      </p>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import FileInput from './components/FileInput.vue';

export default Vue.extend({
  name: 'App',
  components: {
    FileInput,
  },
  data() {
    return {
      isValid: false,
      maxFileSize: 5 * 1024,
    };
  },
});
</script>
```

</details>

<details>
<summary>components/FileInput.vue</summary>

[View FileInput.vue on GitHub](https://github.com/yukidaruma/vuetify-extending-form-demo/blob/main/src/components/FileInput.vue)

```vue
<template>
  <div>
    <v-file-input ref="fileInput" @change="handleFileChange" />
    <p>
      Current file size is <b>{{ JSON.stringify(fileSize) }}</b> bytes
    </p>
    <p>
      Maximum file size is <b>{{ maxFileSize }}</b> bytes
    </p>
    <p>
      Does my file exceed max file size? <b>{{ hasError }}</b>
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Component } from 'vue/types';
import VInput from 'vuetify/es5/components/VInput';

type FileEventTarget = EventTarget & { files: FileList };

export default Vue.extend({
  extends: (VInput as unknown) as typeof Vue,
  props: {
    maxFileSize: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      fileSize: null as null | number,
    };
  },
  computed: {
    hasError(): boolean {
      return (this.fileSize ?? 0) > this.maxFileSize;
    },
  },
  methods: {
    handleFileChange(file: File | undefined): void {
      if (file) {
        this.fileSize = file.size;
      } else {
        this.fileSize = null;
      }
    },
  },
});
</script>
```

</details>

### あとがき

今回の例のような単純なバリデーションであれば、単純に rules を利用するだけで実現できますが、Vuetify の他のコンポーネントを含む、任意のコンポーネントを拡張する際に今回の手法は役に立つのではないかと考えています。  
直接 VFileInput を extends しなかったのは、 "Composition over inheritance" を念頭においています。 (場合によっては、直接対象のコンポーネントを extends したほうが良い場合もあるでしょう)

この記事中で紹介した Vuetify のソースコードは、 [MIT ライセンス](https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md) のもと配布されています。

**利用したライブラリのバージョン**

- Vue: 2.6.11
- Vuetify: 2.4.2
