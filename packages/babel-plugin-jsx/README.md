# Babel Plugin JSX

[![NPM version](https://img.shields.io/npm/v/@showlotus/babel-plugin-jsx?color=42a5f5&label=)](https://www.npmjs.com/package/@showlotus/babel-plugin-jsx)

Forked from [`babel-plugin-jsx`](https://github.com/vuejs/babel-plugin-jsx)

## 安装

安装插件

```bash
npm install @showlotus/babel-plugin-jsx
```

配置 Babel

```js
{
  "plugins": ["@showlotus/babel-plugin-jsx"]
}
```

## 使用

### 参数

#### isReactiveRoot

Type: `boolean`

Default: `false`

是否返回一个响应式的结果。

输入

```jsx
import { Fragment, Select } from '.';

function useFn() {
  return (
    <Fragment title="name" showOverflow>
      <Select />
    </Fragment>
  );
}
```

输出

- 为 `false` 时：

  ```js
  import { Fragment, Select } from '.';
  function useFn() {
    return {
      props: {
        title: 'name',
        showOverflow: true,
      },
      slots: {
        default: {
          component: Select,
        },
      },
    };
  }
  ```

- 为 `true` 时：

  ```js
  import { reactive as _reactive } from 'vue';
  import { Fragment, Select } from '.';
  function useFn() {
    return _reactive({
      props: {
        title: 'name',
        showOverflow: true,
      },
      slots: {
        default: {
          component: Select,
        },
      },
    });
  }
  ```

#### librarySource

Type: `string`

Default: `vue`，可选值：`vue`、`vue-demi`、`@vue/composition-api`。

`reactive` 来源。

```js
import { reactive as _reactive } from 'vue';
import { reactive as _reactive } from 'vue-demi';
import { reactive as _reactive } from '@vue/composition-api';
```

#### injectKey

Type: `boolean`

Default: `false`

是否注入 `key`，为每个组件都生成一个唯一的 `key`。开启后，可搭配 `customKey`（`string` 或 `Function`） 共同使用。

输入

```js
import { Fragment, Select } from '.';

function useFn() {
  return (
    <Fragment title="name" showOverflow>
      <Select />
    </Fragment>
  );
}
```

输出

- 不指定 `customKey`，默认为 `"BABEL_JSX_PLUGIN"`：

  ```js
  import { Fragment, Select } from '.';
  function useFn() {
    return {
      key: 'BABEL_JSX_PLUGIN_1',
      props: {
        title: 'name',
        showOverflow: true,
      },
      slots: {
        default: {
          key: 'BABEL_JSX_PLUGIN_0',
          component: Select,
        },
      },
    };
  }
  ```

- 指定 `customKey` 为 `"Only_You"`：

  ```js
  import { Fragment, Select } from '.';
  function useFn() {
    return {
      key: 'Only_You_1',
      props: {
        title: 'name',
        showOverflow: true,
      },
      slots: {
        default: {
          key: 'Only_You_0',
          component: Select,
        },
      },
    };
  }
  ```

- 指定 `customKey` 为一个函数，则需要确保每次调用时，都返回一个唯一的结果，否则可能会导致不同组件有相同的 `key`：

  ```js
  let count = 1;
  function customKey() {
    return `Custom_Key_${count++}`;
  }
  ```

  ```js
  import { Fragment, Select } from '.';
  function useFn() {
    return {
      key: 'Custom_Key_2',
      props: {
        title: 'name',
        showOverflow: true,
      },
      slots: {
        default: {
          key: 'Custom_Key_1',
          component: Select,
        },
      },
    };
  }
  ```

## 组件

### Dialog

弹窗组件，所有组件名为 `Dialog` 的组件，会放在根组件的具名插槽 `dialog` 下。

输入：

```js
import { Dialog, Form, FormItem } from '.';

function useFn() {
  return (
    <Form>
      <FormItem label="name" prop="name" />
      <FormItem label="age" prop="age" />
      <Dialog visible={visible} title="title" />
    </Form>
  );
}
```

输出：

```js
import { Dialog, Form, FormItem } from '.';
function useFn() {
  return {
    component: Form,
    slots: {
      default: [
        {
          component: FormItem,
          props: {
            label: 'name',
            prop: 'name',
          },
        },
        {
          component: FormItem,
          props: {
            label: 'age',
            prop: 'age',
          },
        },
      ],
      dialog: [
        {
          props: {
            visible: visible,
            title: 'title',
          },
        },
      ],
    },
  };
}
```

### Fragment

无 `component` 属性的组件。

输入：

```js
import { Fragment, Option, Select } from '.';

function useFn() {
  return (
    <Fragment title="name" showOverflow>
      <Select>
        <Option label="1" value={1} />
        <Option label="2" value={2} />
        <Option label="3" value={3} />
      </Select>
    </Fragment>
  );
}
```

输出：

```js
import { Fragment, Option, Select } from '.';
function useFn() {
  return {
    props: {
      title: 'name',
      showOverflow: true,
    },
    slots: {
      default: {
        component: Select,
        slots: {
          default: [
            {
              component: Option,
              props: {
                label: '1',
                value: 1,
              },
            },
            {
              component: Option,
              props: {
                label: '2',
                value: 2,
              },
            },
            {
              component: Option,
              props: {
                label: '3',
                value: 3,
              },
            },
          ],
        },
      },
    },
  };
}
```

### Template

具名插槽组件。通过配置 `slot` 属性指定插槽名称。

输入：

```js
import { Button, Form, FormItem, Fragment, Option, Select, Template } from '.';

function useFn() {
  return (
    <Fragment title="name" showOverflow>
      <Template slot="header" title="xxx" />
      <Template slot="default">
        <Form>
          <FormItem label="name" prop="name" />
          <FormItem label="age" prop="age" />
        </Form>
      </Template>
      <Template slot="footer">
        <Button type="default" text="cancel" />
        <Button type="primary" text="confirm" />
      </Template>
    </Fragment>
  );
}
```

输出：

```js
import { Button, Form, FormItem, Fragment, Option, Select, Template } from '.';
function useFn() {
  return {
    props: {
      title: 'name',
      showOverflow: true,
    },
    slots: {
      header: {
        props: {
          title: 'xxx',
        },
      },
      default: {
        component: Form,
        slots: {
          default: [
            {
              component: FormItem,
              props: {
                label: 'name',
                prop: 'name',
              },
            },
            {
              component: FormItem,
              props: {
                label: 'age',
                prop: 'age',
              },
            },
          ],
        },
      },
      footer: [
        {
          component: Button,
          props: {
            type: 'default',
            text: 'cancel',
          },
        },
        {
          component: Button,
          props: {
            type: 'primary',
            text: 'confirm',
          },
        },
      ],
    },
  };
}
```

## 在 TypeScript 中使用

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```
