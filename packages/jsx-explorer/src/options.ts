import { createApp, h, reactive } from 'vue';
import { type VueJSXPluginOptions } from '@vue/babel-plugin-jsx';

export { VueJSXPluginOptions };

export const compilerOptions: VueJSXPluginOptions = reactive({
  mergeProps: true,
  optimize: false,
  transformOn: false,
  enableObjectSlots: true,
  isTSX: true,
  librarySource: 'vue',
  isReactiveRoot: true,
  customKey: 'ONE_JSX_LOADER',
});

const App = {
  setup() {
    return () => [
      h(
        'h1',
        {
          style: {
            cursor: 'pointer',
            userSelect: 'none',
          },
          onClick() {
            window.open(
              'https://showlotus.github.io/babel-plugin-jsx/packages/jsx-explorer/dist'
            );
          },
        },
        'babel-plugin-jsx explorer'
      ),

      h('div', { id: 'options-wrapper' }, [
        h('div', { id: 'options-label' }, 'Options ↘'),
        h('ul', { id: 'options' }, [
          // isTSX
          h('li', [
            h('input', {
              type: 'checkbox',
              id: 'isTSX',
              checked: compilerOptions.isTSX,
              onChange(e: Event) {
                compilerOptions.isTSX = (e.target as HTMLInputElement).checked;
              },
            }),
            h('label', { for: 'isTSX' }, 'isTSX'),
          ]),

          // isReactiveRoot
          h('li', [
            h('input', {
              type: 'checkbox',
              id: 'isReactiveRoot',
              checked: compilerOptions.isReactiveRoot,
              onChange(e: Event) {
                compilerOptions.isReactiveRoot = (
                  e.target as HTMLInputElement
                ).checked;
              },
            }),
            h('label', { for: 'isReactiveRoot' }, 'isReactiveRoot'),
          ]),

          // select library source
          h('li', [
            h('input', {
              type: 'checkbox',
              disabled: true,
              checked: true,
            }),
            h('label', { for: 'librarySource' }, 'librarySource：'),
            h(
              'select',
              {
                type: 'select',
                id: 'librarySource',
                checked: true,
                onChange(e: Event) {
                  compilerOptions.librarySource = (
                    e.target as HTMLInputElement
                  ).value;
                },
              },
              [
                h('option', { value: 'vue' }, 'vue'),
                h('option', { value: 'vue-demi' }, 'vue-demi'),
                h(
                  'option',
                  { value: '@vue/composition-api' },
                  '@vue/composition-api'
                ),
              ]
            ),
          ]),

          // custom key
          h('li', [
            h('input', {
              type: 'checkbox',
              disabled: true,
              checked: true,
            }),
            h('label', { for: 'customKey' }, 'customKey：'),
            h('input', {
              type: 'text',
              id: 'customKey',
              style: {
                width: '200px',
              },
              value: compilerOptions.customKey,
              onChange(e: Event) {
                compilerOptions.customKey = (
                  e.target as HTMLInputElement
                ).value;
              },
            }),
          ]),
        ]),
      ]),
    ];
  },
};

export function initOptions() {
  createApp(App).mount(document.getElementById('header')!);
}
