import * as t from '@babel/types';
import type * as BabelCore from '@babel/core';
import template from '@babel/template';
// @ts-expect-error
import syntaxJsx from '@babel/plugin-syntax-jsx';
// @ts-expect-error
import { addNamed, addNamespace, isModule } from '@babel/helper-module-imports';
import { type NodePath } from '@babel/traverse';
import transformVueJSX from './transform-vue-jsx';
import type { State, VueJSXPluginOptions } from './interface';

export { VueJSXPluginOptions };

const hasJSX = (parentPath: NodePath<t.Program>) => {
  let fileHasJSX = false;
  parentPath.traverse({
    JSXElement(path) {
      // skip ts error
      fileHasJSX = true;
      path.stop();
    },
    JSXFragment(path) {
      fileHasJSX = true;
      path.stop();
    },
  });

  return fileHasJSX;
};

const JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;

export default ({ types }: typeof BabelCore): BabelCore.PluginObj<State> => ({
  name: 'babel-plugin-jsx',
  inherits: syntaxJsx,
  visitor: {
    ...transformVueJSX,
    // ...sugarFragment,
    Program: {
      enter(path, state) {
        if (hasJSX(path)) {
          const importNames = [
            'createVNode',
            'Fragment',
            'resolveComponent',
            'withDirectives',
            'vShow',
            'vModelSelect',
            'vModelText',
            'vModelCheckbox',
            'vModelRadio',
            'vModelText',
            'vModelDynamic',
            'resolveDirective',
            'mergeProps',
            'createTextVNode',
            'isVNode',
            'reactive',
          ];
          if (isModule(path)) {
            // TAG 当前文件中包含 jsx 语法时，走进这个 if
            // import { createVNode } from "vue";
            const importMap: Record<string, t.Identifier> = {};
            const { librarySource } = state.opts;
            importNames.forEach((name) => {
              state.set(name, () => {
                if (importMap[name]) {
                  return types.cloneNode(importMap[name]);
                }
                const identifier = addNamed(path, name, librarySource, {
                  ensureLiveReference: true,
                });
                importMap[name] = identifier;
                return identifier;
              });
            });
            return; // DONE
            const { enableObjectSlots = false } = state.opts;
            console.log(enableObjectSlots, 'enableObjectSlots');
            if (enableObjectSlots) {
              state.set('@showlotus/babel-plugin-jsx/runtimeIsSlot', () => {
                if (importMap.runtimeIsSlot) {
                  return importMap.runtimeIsSlot;
                }
                const { name: isVNodeName } = state.get(
                  'isVNode'
                )() as t.Identifier;
                const isSlot = path.scope.generateUidIdentifier('isSlot');
                const ast = template.ast`
                    function ${isSlot.name}(s) {
                      return typeof s === 'function' || (Object.prototype.toString.call(s) === '[object Object]' && !${isVNodeName}(s));
                    }
                  `;
                console.log(isSlot);
                const lastImport = (path.get('body') as NodePath[])
                  .filter((p) => p.isImportDeclaration())
                  .pop();
                if (lastImport) {
                  lastImport.insertAfter(ast);
                }
                importMap.runtimeIsSlot = isSlot;
                return isSlot;
              });
            }
          } else {
            // var _vue = require('vue');
            let sourceName: t.Identifier;
            importNames.forEach((name) => {
              state.set(name, () => {
                if (!sourceName) {
                  sourceName = addNamespace(path, 'vue', {
                    ensureLiveReference: true,
                  });
                }
                return t.memberExpression(sourceName, t.identifier(name));
              });
            });
            const helpers: Record<string, t.Identifier> = {};
            const { enableObjectSlots = true } = state.opts;
            if (enableObjectSlots) {
              state.set('@showlotus/babel-plugin-jsx/runtimeIsSlot', () => {
                if (helpers.runtimeIsSlot) {
                  return helpers.runtimeIsSlot;
                }
                const isSlot = path.scope.generateUidIdentifier('isSlot');
                const { object: objectName } = state.get(
                  'isVNode'
                )() as t.MemberExpression;
                const ast = template.ast`
                  function ${isSlot.name}(s) {
                    return typeof s === 'function' || (Object.prototype.toString.call(s) === '[object Object]' && !${
                      (objectName as t.Identifier).name
                    }.isVNode(s));
                  }
                `;
                const nodePaths = path.get('body') as NodePath[];
                const lastImport = nodePaths
                  .filter(
                    (p) =>
                      p.isVariableDeclaration() &&
                      p.node.declarations.some(
                        (d) => (d.id as t.Identifier)?.name === sourceName.name
                      )
                  )
                  .pop();
                if (lastImport) {
                  lastImport.insertAfter(ast);
                }
                return isSlot;
              });
            }
          }
          const {
            opts: { pragma = '' },
            file,
          } = state;
          if (pragma) {
            state.set('createVNode', () => t.identifier(pragma));
          }
          // USELESS 针对 @jsx 多行注释将 _createVNode 替换成 *
          if (file.ast.comments) {
            for (const comment of file.ast.comments) {
              const jsxMatches = JSX_ANNOTATION_REGEX.exec(comment.value);
              if (jsxMatches) {
                state.set('createVNode', () => t.identifier(jsxMatches[1]));
              }
            }
          }
        }
      },
      exit(path) {
        const body = path.get('body') as NodePath[];
        const specifiersMap = new Map<string, t.ImportSpecifier>();

        body
          .filter(
            (nodePath) =>
              t.isImportDeclaration(nodePath.node) &&
              nodePath.node.source.value === 'vue'
          )
          .forEach((nodePath) => {
            const { specifiers } = nodePath.node as t.ImportDeclaration;
            let shouldRemove = false;
            specifiers.forEach((specifier) => {
              if (
                !specifier.loc &&
                t.isImportSpecifier(specifier) &&
                t.isIdentifier(specifier.imported)
              ) {
                specifiersMap.set(specifier.imported.name, specifier);
                shouldRemove = true;
              }
            });
            if (shouldRemove) {
              nodePath.remove();
            }
          });

        const specifiers = [...specifiersMap.keys()].map(
          (imported) => specifiersMap.get(imported)!
        );
        if (specifiers.length) {
          path.unshiftContainer(
            'body',
            t.importDeclaration(specifiers, t.stringLiteral('vue'))
          );
        }
      },
    },
  },
});
