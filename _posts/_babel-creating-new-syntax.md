```js
// collection-if.js
import { parse } from '../lib';

function getParser(code) {
  return () => parse(code, { sourceType: 'module' });
}

describe('array if syntax', function () {
  it('should parse', function () {
    expect(getParser('[if (true) 1]')()).toMatchSnapshot();
  });
});
```

collection としたのは object にもできたらいいな

ArrayExpression

`BABEL_ENV=test node_modules/.bin/jest -u packages/babel-parser/test/collection-if.js`

C:\Dev\GH\babel\packages\babel-plugin-proposal-partial-application\src を確認
https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-visitors

packages\babel-parser\src\parser\expression.js parseExprAtom
parseExprAtom で default に来てる。

parseIfStatement を参考にこねる

make watch しながら

BABEL_ENV=test node_modules/.bin/jest --silent=false --verbose false -u packages/babel-parser/test/collection-if.js

で console.log が見れるのを確認
