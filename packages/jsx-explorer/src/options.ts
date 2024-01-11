import { createApp, h, reactive } from 'vue';
import { type VueJSXPluginOptions } from '@showlotus/babel-plugin-jsx';
import babelPluginJsxPackage from '../../babel-plugin-jsx/package.json';

export { VueJSXPluginOptions };

export const compilerOptions: VueJSXPluginOptions = reactive({
  mergeProps: true,
  optimize: false,
  transformOn: false,
  enableObjectSlots: true,
  isTSX: true,
  librarySource: 'vue',
  isReactiveRoot: false,
  customKey: 'BABEL_PLUGIN_JSX',
  injectKey: false,
});

const App = {
  setup() {
    return () => [
      h(
        'h1',
        [
          h('span', '@showlotus/babel-plugin-jsx@'),
          h('span', babelPluginJsxPackage.version),
          h('sup', { style: { fontStyle: 'italic' } }, [
            h('span', ' Forked from '),
            h('a', { href: "https://github.com/vuejs/babel-plugin-jsx", target: '_blank' }, 'vuejs/babel-plugin-jsx'),
          ]),
        ]
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

          // inject key
          h('input', {
            type: 'checkbox',
            id: 'injectKey',
            checked: compilerOptions.injectKey,
            onChange(e: Event) {
              compilerOptions.injectKey = (
                e.target as HTMLInputElement
              ).checked;
            },
          }),
          h('label', { for: 'injectKey' }, 'injectKey'),

          // custom key
          compilerOptions.injectKey &&
            h('li', [
              h(
                'label',
                { for: 'customKey', style: { marginLeft: '22px' } },
                'customKey：'
              ),
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
