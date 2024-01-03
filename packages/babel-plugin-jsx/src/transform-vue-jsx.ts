import * as t from '@babel/types';
import { type NodePath, type Visitor } from '@babel/traverse';
import {
  checkIsComponent,
  createIdentifier,
  getJSXAttributeName,
  getTag,
  isOn,
  transformJSXExpressionContainer,
  transformJSXSpreadChild,
  transformJSXText,
  transformText,
  walksScope,
} from './utils';
import SlotFlags from './slotFlags';
import type { State } from './interface';

const Components = {
  Fragment: 'Fragment',
  Template: 'Template',
  Dialog: 'Dialog',
}

const getJSXAttributeValue = (
  path: NodePath<t.JSXAttribute>,
  state: State
): t.StringLiteral | t.Expression | null => {
  const valuePath = path.get('value');
  if (valuePath.isJSXElement()) {
    return transformJSXElement(valuePath, state);
  }
  if (valuePath.isStringLiteral()) {
    return t.stringLiteral(transformText(valuePath.node.value));
  }
  if (valuePath.isJSXExpressionContainer()) {
    return transformJSXExpressionContainer(valuePath);
  }

  return null;
};

const buildProps = (path: NodePath<t.JSXElement>, state: State) => {
  const tag = getTag(path, state) as t.Identifier;
  const props = path.get('openingElement').get('attributes');
  if (props.length === 0) {
    return {
      tag,
      props: t.objectExpression([]),
    };
  }

  const properties: t.ObjectProperty[] = [];
  props.forEach((prop) => {
    if (prop.isJSXAttribute()) {
      const name = getJSXAttributeName(prop);
      const attributeValue = getJSXAttributeValue(prop, state);
      properties.push(
        t.objectProperty(
          t.stringLiteral(name),
          attributeValue || t.booleanLiteral(true)
        )
      );
    }
  });

  return {
    tag,
    props: t.objectExpression(properties),
  };
};

/**
 * Get children from Array of JSX children
 * @param paths Array<JSXText | JSXExpressionContainer  | JSXElement | JSXFragment>
 * @returns Array<Expression | SpreadElement>
 */
const getChildren = (
  paths: NodePath<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
  >[],
  state: State
): t.Expression[] =>
  paths
    .map((path) => {
      if (path.isJSXText()) {
        const transformedText = transformJSXText(path);
        if (transformedText) {
          return t.callExpression(createIdentifier(state, 'createTextVNode'), [
            transformedText,
          ]);
        }
        return transformedText;
      }
      if (path.isObjectExpression()) {
        return (path as NodePath<t.ObjectExpression>).node;
      }
      if (path.isJSXExpressionContainer()) {
        const expression = transformJSXExpressionContainer(path);

        if (t.isIdentifier(expression)) {
          const { name } = expression;
          const { referencePaths = [] } = path.scope.getBinding(name) || {};
          referencePaths.forEach((referencePath) => {
            walksScope(referencePath, name, SlotFlags.DYNAMIC);
          });
        }

        return expression;
      }
      if (path.isJSXSpreadChild()) {
        return transformJSXSpreadChild(path);
      }
      if (path.isCallExpression()) {
        return (path as NodePath<t.CallExpression>).node;
      }
      if (path.isJSXElement()) {
        return transformJSXElement(path, state);
      }
      throw new Error(`getChildren: ${path.type} is not supported`);
    })
    .filter(
      ((value: any) => value != null && !t.isJSXEmptyExpression(value)) as any
    );

const genProps = (props: t.ObjectExpression) => {
  const result = [] as t.ObjectProperty[];
  const events = [] as t.ObjectProperty[];
  const newProps = [] as (
    | t.ObjectProperty
    | t.ObjectMethod
    | t.SpreadElement
  )[];
  props.properties.forEach((prop) => {
    if (t.isObjectProperty(prop)) {
      const name = (prop.key as t.StringLiteral).value;
      if (['use', 'ref', 'resolve'].includes(name)) {
        result.push(t.objectProperty(t.identifier(name), prop.value));
        return;
      } else if (isOn(name)) {
        events.push(
          t.objectProperty(
            t.identifier(
              name.slice(2).replace(/^[^\s]/, (str) => str.toLowerCase())
            ),
            prop.value
          )
        );
        return;
      } else if (name === 'slot') {
        return;
      }
    }
    newProps.push(prop);
  });

  if (events.length) {
    result.push(
      t.objectProperty(t.identifier('events'), t.objectExpression(events))
    );
  }

  if (newProps.length) {
    result.push(
      t.objectProperty(t.identifier('props'), t.objectExpression(newProps))
    );
  }

  return result;
};

const genComponent = (component: t.Identifier | t.StringLiteral) => {
  return t.objectProperty(
    t.identifier('component'), 
    t.isStringLiteral(component) 
      ? component
      : component.name.indexOf(":") > -1 
        ? t.stringLiteral(component.name) 
        : component
  );
};

const genKey = (() => {
  let idx = 0;
  const generateKey = (prefix: string) => {
    return `${prefix}_${idx++}`;
  };
  return (path: NodePath<t.JSXElement>, state: State) => {
    const { customKey = 'ONE_JSX_LOADER' } = state.opts;
    return t.objectProperty(
      t.identifier('key'),
      t.stringLiteral(
        typeof customKey === 'string' ? generateKey(customKey) : customKey()
      )
    );
  };
})();

const isNamedSlot = (slot: t.Expression) => {
  if (!t.isObjectExpression(slot)) {
    return '';
  }

  const properties = (slot as t.ObjectExpression).properties;
  const componentPropertyIdx = properties.findIndex((item) => {
    if (t.isObjectProperty(item)) {
      return (
        (item.key as t.Identifier).name === 'component' &&
        t.isStringLiteral(item.value) &&
        item.value.value.startsWith(`${Components.Template}:`)
      );
    }
  });
  if (componentPropertyIdx > -1) {
    const componentProperty = properties[componentPropertyIdx] as t.ObjectProperty;
    const oldVal = (componentProperty.value as t.StringLiteral).value;
    const slotName = oldVal.split(':')[1];
    properties.splice(componentPropertyIdx, 1);
    return slotName;
  }
  return '';
};

const genButtonsSlot = (slot: t.ObjectExpression) => {
  const targetSlots = (slot as t.ObjectExpression).properties.find(v => {
    return t.isObjectProperty(v) && (v.key as t.Identifier).name === 'slots';
  })! as t.ObjectProperty;
  const targetDefault = (targetSlots.value as t.ObjectExpression).properties.find(v => {
    return t.isObjectProperty(v) && (v.key as t.Identifier).name === 'default';
  })!
  const value = (targetDefault as t.ObjectProperty).value;
  return t.isArrayExpression(value) ? value : t.arrayExpression([value as t.ObjectExpression]);
}

const genSlots = (slots: t.Expression[]) => {
  const defaultSlots = [] as t.Expression[];
  const namedSlots = {} as any;
  const dialogSlots = [] as t.Expression[];
  slots.forEach((slot) => {
    const properties = (slot as t.ObjectExpression).properties;
    const slotName = isNamedSlot(slot);
    if (slotName) {
      // 对于 buttons 的具名插槽特殊处理
      if (slotName === 'buttons') {
        namedSlots[slotName] = genButtonsSlot(slot as t.ObjectExpression);
      } else {
        namedSlots[slotName] = slot;
      }
    } else if (properties) {
      const componentPropertyIdx = properties.findIndex((item) => {
        if (t.isObjectProperty(item)) {
          return (
            (item.key as t.Identifier).name === 'component' &&
            (
              t.isStringLiteral(item.value) && item.value.value === Components.Dialog ||
              t.isIdentifier(item.value) && item.value.name === Components.Dialog
            )
          );
        }
      });
      if (componentPropertyIdx > -1) {
        properties.splice(componentPropertyIdx, 1);
        dialogSlots.push(slot);
      } else {
        defaultSlots.push(slot);
      }
    } else {
      defaultSlots.push(slot);
    }
  });

  return t.objectProperty(
    t.identifier('slots'),
    t.objectExpression(
      [
        !namedSlots.default &&
          t.objectProperty(
            t.identifier('default'),
            defaultSlots.length <= 1
              ? defaultSlots?.[0] || t.objectExpression([])
              : t.arrayExpression(defaultSlots)
          ),
        ...Object.keys(namedSlots).map((key) => {
          return t.objectProperty(t.identifier(key), namedSlots[key]);
        }),
        dialogSlots.length &&
          t.objectProperty(
            t.identifier('dialog'),
            t.arrayExpression(dialogSlots)
          ),
      ].filter(Boolean) as t.ObjectProperty[]
    )
  );
};

const isTemplate = (tag: t.Identifier) => {
  return tag.name === Components.Template;
};

const isFragment = (tag: t.Identifier) => {
  return tag.name === Components.Fragment;
}

const hasSlot = (path: NodePath<t.JSXElement>, state: State) => {
  const attributes = path.get('openingElement').get('attributes');
  for (const attribute of attributes) {
    if (attribute.isJSXAttribute()) {
      const name = getJSXAttributeName(attribute);
      const value = getJSXAttributeValue(attribute, state);
      if (name === 'slot' && t.isStringLiteral(value) && value.value) {
        const slotName = value.value;
        return slotName;
      }
    }
  }
  return '';
};

const transformJSXElement = (
  path: NodePath<t.JSXElement>,
  state: State
): t.CallExpression | t.ObjectExpression => {
  const children = getChildren(path.get('children'), state);
  const { tag, props } = buildProps(path, state);

  if (isFragment(tag)) {
    return t.objectExpression([
      genKey(path, state),
      ...genProps(props as t.ObjectExpression),
      genSlots(children),
    ])
  }

  const slotName = hasSlot(path, state);
  if (isTemplate(tag) && slotName) {
    tag.name += `:${slotName}`;
  }

  return t.objectExpression([
    genKey(path, state),
    genComponent(tag),
    ...genProps(props as t.ObjectExpression),
    genSlots(children),
  ]);
};

const visitor: Visitor<State> = {
  'JSXFragment|JSXText': {
    enter(path) {
      path.remove();
    },
  },
  JSXElement: {
    exit(path, state) {
      // 移除所有非组件节点
      const tag = getTag(path, state);
      const isComponent = checkIsComponent(path.get('openingElement'), state);
      if (!isComponent) {
        path.remove();
        return;
      }

      // 移除无效的插槽节点
      if (isTemplate(tag as t.Identifier) && !hasSlot(path, state)) {
        path.remove();
        return;
      }

      const parent = path.findParent((parentPath) => parentPath.isJSXElement());
      const { isReactiveRoot } = state.opts;
      // 在最外层的根节点外包裹一层 reactive
      const nodes =
        !parent && isReactiveRoot
          ? t.callExpression(createIdentifier(state, 'reactive'), [
              transformJSXElement(path, state),
            ])
          : transformJSXElement(path, state);
      path.replaceWith(nodes);
    },
  },
};

export default visitor;
