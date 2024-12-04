はまりポイント

DOM 周りの Type Definition が存在しない

```ts
/// <reference lib="dom" />
import * as firebase from '@firebase/rules-unit-testing';
```

cross-env を dep に増やしたくない

```ts
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:19300';
```

jest.config.js で exports ではなく module.exports を使用する
require(.json) は、内部的に JSON.parse() を利用するため、 いわゆる JSONC (JSON with comments) は利用できない

commit hash from @ to @
