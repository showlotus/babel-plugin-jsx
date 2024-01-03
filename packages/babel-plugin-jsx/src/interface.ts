import type * as t from '@babel/types';
import type * as BabelCore from '@babel/core';

export type Slots = t.Identifier | t.ObjectExpression | null;

export type State = {
  get: (name: string) => any;
  set: (name: string, value: any) => any;
  opts: VueJSXPluginOptions;
  file: BabelCore.BabelFile;
};

export interface VueJSXPluginOptions {
  /** transform `on: { click: xx }` to `onClick: xxx` */
  transformOn?: boolean;
  /** enable optimization or not. */
  optimize?: boolean;
  /** merge static and dynamic class / style attributes / onXXX handlers */
  mergeProps?: boolean;
  /** configuring custom elements */
  isCustomElement?: (tag: string) => boolean;
  /** enable object slots syntax */
  enableObjectSlots?: boolean;
  /** Replace the function used when compiling JSX expressions */
  pragma?: string;
  /** open tsx */
  isTSX?: boolean;
  /** some api source */
  librarySource?: string;
  /** use reactive wrap the root's outer */
  isReactiveRoot?: boolean;
  /**
   * a method of generating key.
   *
   * If the type is a string, it will be used as a prefix to the key
   *
   * If the type is a function, you should be sure to return a different value each time you call it
   */
  customKey?: string | ((...args: any[]) => string);
}
