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
function useFn() {
  return <Fragment title="name" showOverflow>
    <Select>
      <Option label="1" value={1} />
      <Option label="2" value={2} />
      <Option label="3" value={3} />
    </Select>
  </Fragment>
}
```

输出

- 为 `false` 时：

  ```js
  function useFn() {
    return {
      props: {
        "title": "name",
        "showOverflow": true
      },
      slots: {
        default: {
          component: Select,
          slots: {
            default: [{
              component: Option,
              props: {
                "label": "1",
                "value": 1
              }
            }, {
              component: Option,
              props: {
                "label": "2",
                "value": 2
              }
            }, {
              component: Option,
              props: {
                "label": "3",
                "value": 3
              }
            }]
          }
        }
      }
    };
  }
  ```

- 为 `true` 时：


  ```js
  import { reactive as _reactive } from "vue";
  function useFn() {
    return _reactive({
      props: {
        "title": "name",
        "showOverflow": true
      },
      slots: {
        default: {
          component: Select,
          slots: {
            default: [{
              component: Option,
              props: {
                "label": "1",
                "value": 1
              }
            }, {
              component: Option,
              props: {
                "label": "2",
                "value": 2
              }
            }, {
              component: Option,
              props: {
                "label": "3",
                "value": 3
              }
            }]
          }
        }
      }
    });
  }
  ```

#### librarySource

Type: `string`

Default: `Vue`，可选值：`vue`、`vue-demi`、`@vue/composition-api`。

自定义元素

#### customKey

Type: `boolean`

Default: `true`

合并 class / style / onXXX handlers

## 表达式

### 内容

函数式组件

```jsx
const App = () => <div></div>;
```

在 render 中使用

```jsx
const App = {
  render() {
    return <div>Vue 3.0</div>;
  },
};
```

```jsx
import { withModifiers, defineComponent } from 'vue';

const App = defineComponent({
  setup() {
    const count = ref(0);

    const inc = () => {
      count.value++;
    };

    return () => (
      <div onClick={withModifiers(inc, ['self'])}>{count.value}</div>
    );
  },
});
```

Fragment

```jsx
const App = () => (
  <>
    <span>I'm</span>
    <span>Fragment</span>
  </>
);
```

### Attributes / Props

```jsx
const App = () => <input type="email" />;
```

动态绑定:

```jsx
const placeholderText = 'email';
const App = () => <input type="email" placeholder={placeholderText} />;
```

### 插槽

> 注意: 在 `jsx` 中，应该使用 **`v-slots`** 代替 _`v-slot`_

```jsx
const A = (props, { slots }) => (
  <>
    <h1>{slots.default ? slots.default() : 'foo'}</h1>
    <h2>{slots.bar?.()}</h2>
  </>
);

const App = {
  setup() {
    const slots = {
      bar: () => <span>B</span>,
    };
    return () => (
      <A v-slots={slots}>
        <div>A</div>
      </A>
    );
  },
};

// or

const App = {
  setup() {
    const slots = {
      default: () => <div>A</div>,
      bar: () => <span>B</span>,
    };
    return () => <A v-slots={slots} />;
  },
};

// 或者，当 `enableObjectSlots` 不是 `false` 时，您可以使用对象插槽
const App = {
  setup() {
    return () => (
      <>
        <A>
          {{
            default: () => <div>A</div>,
            bar: () => <span>B</span>,
          }}
        </A>
        <B>{() => 'foo'}</B>
      </>
    );
  },
};
```

### 在 TypeScript 中使用

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```