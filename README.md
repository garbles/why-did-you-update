# Why did you update, bruh?

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

### Wat?

![](http://i.imgur.com/Ui8YUBe.png)

A function that monkey patches React and puts your console on blast when your components are
making unnecessary updates.

### How to

```js
import React from 'react'
import {whyDidYouUpdate} from 'why-did-you-update'

if (process.env.NODE_ENV !== 'production') {
  whyDidYouUpdate(React)
}
```

To ignore some component names, you can pass an ignore regex

```js
whyDidYouUpdate(React, { ignore: /^Connect/ })
```

### Credit

I originally read about how Benchling created a mixin to do this on a per component basis ([A deep dive into React perf debugging](http://benchling.engineering/deep-dive-react-perf-debugging/)).
That is really awesome but also tedious AF, so why not just monkey patch React.

[build-badge]: https://img.shields.io/travis/garbles/why-did-you-update/master.svg?style=flat-square
[build]: https://travis-ci.org/garbles/why-did-you-update

[npm-badge]: https://img.shields.io/npm/v/npm-package.svg?style=flat-square
[npm]: https://www.npmjs.org/package/why-did-you-update
