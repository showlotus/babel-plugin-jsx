var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/index.ts
import * as t3 from "@babel/types";
import template from "@babel/template";
import syntaxJsx from "@babel/plugin-syntax-jsx";
import { addNamed, addNamespace, isModule } from "@babel/helper-module-imports";

// src/transform-vue-jsx.ts
import * as t2 from "@babel/types";

// src/utils.ts
import * as t from "@babel/types";
import htmlTags from "html-tags";
import svgTags from "svg-tags";

// src/slotFlags.ts
var SlotFlags = /* @__PURE__ */ ((SlotFlags2) => {
  SlotFlags2[SlotFlags2["STABLE"] = 1] = "STABLE";
  SlotFlags2[SlotFlags2["DYNAMIC"] = 2] = "DYNAMIC";
  SlotFlags2[SlotFlags2["FORWARDED"] = 3] = "FORWARDED";
  return SlotFlags2;
})(SlotFlags || {});
var slotFlags_default = SlotFlags;

// src/utils.ts
var FRAGMENT = "Fragment";
var KEEP_ALIVE = "KeepAlive";
var createIdentifier = (state, name) => state.get(name)();
var shouldTransformedToSlots = (tag) => !(tag.match(RegExp(`^_?${FRAGMENT}\\d*$`)) || tag === KEEP_ALIVE);
var checkIsComponent = (path, state) => {
  var _a, _b;
  const namePath = path.get("name");
  if (namePath.isJSXMemberExpression()) {
    return shouldTransformedToSlots(namePath.node.property.name);
  }
  const tag = namePath.node.name;
  return !((_b = (_a = state.opts).isCustomElement) == null ? void 0 : _b.call(_a, tag)) && // shouldTransformedToSlots(tag) &&
  !htmlTags.includes(tag) && !svgTags.includes(tag);
};
var transformJSXMemberExpression = (path) => {
  const objectPath = path.node.object;
  const propertyPath = path.node.property;
  const transformedObject = t.isJSXMemberExpression(objectPath) ? transformJSXMemberExpression(
    path.get("object")
  ) : t.isJSXIdentifier(objectPath) ? t.identifier(objectPath.name) : t.nullLiteral();
  const transformedProperty = t.identifier(propertyPath.name);
  return t.memberExpression(transformedObject, transformedProperty);
};
var getTag = (path, state) => {
  var _a, _b;
  const namePath = path.get("openingElement").get("name");
  if (namePath.isJSXIdentifier()) {
    const { name } = namePath.node;
    if (!htmlTags.includes(name) && !svgTags.includes(name)) {
      return path.scope.hasBinding(name) ? t.identifier(name) : t.stringLiteral(name);
      return name === FRAGMENT ? createIdentifier(state, FRAGMENT) : path.scope.hasBinding(name) ? t.identifier(name) : ((_b = (_a = state.opts).isCustomElement) == null ? void 0 : _b.call(_a, name)) ? t.stringLiteral(name) : t.callExpression(createIdentifier(state, "resolveComponent"), [
        t.stringLiteral(name)
      ]);
    }
    return t.stringLiteral(name);
  }
  if (namePath.isJSXMemberExpression()) {
    return transformJSXMemberExpression(namePath);
  }
  throw new Error(`getTag: ${namePath.type} is not supported`);
};
var getJSXAttributeName = (path) => {
  const nameNode = path.node.name;
  if (t.isJSXIdentifier(nameNode)) {
    return nameNode.name;
  }
  return `${nameNode.namespace.name}:${nameNode.name.name}`;
};
var transformJSXText = (path) => {
  const str = transformText(path.node.value);
  return str !== "" ? t.stringLiteral(str) : null;
};
var transformText = (text) => {
  const lines = text.split(/\r\n|\n|\r/);
  let lastNonEmptyLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i;
    }
  }
  let str = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFirstLine = i === 0;
    const isLastLine = i === lines.length - 1;
    const isLastNonEmptyLine = i === lastNonEmptyLine;
    let trimmedLine = line.replace(/\t/g, " ");
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, "");
    }
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, "");
    }
    if (trimmedLine) {
      if (!isLastNonEmptyLine) {
        trimmedLine += " ";
      }
      str += trimmedLine;
    }
  }
  return str;
};
var transformJSXExpressionContainer = (path) => path.get("expression").node;
var transformJSXSpreadChild = (path) => t.spreadElement(path.get("expression").node);
var walksScope = (path, name, slotFlag) => {
  if (path.scope.hasBinding(name) && path.parentPath) {
    if (t.isJSXElement(path.parentPath.node)) {
      path.parentPath.setData("slotFlag", slotFlag);
    }
    walksScope(path.parentPath, name, slotFlag);
  }
};
var onRE = /^on[^a-z]/;
var isOn = (key) => onRE.test(key);

// src/transform-vue-jsx.ts
var Components = {
  Fragment: "Fragment",
  Template: "Template",
  Dialog: "Dialog"
};
var getJSXAttributeValue = (path, state) => {
  const valuePath = path.get("value");
  if (valuePath.isJSXElement()) {
    return transformJSXElement(valuePath, state);
  }
  if (valuePath.isStringLiteral()) {
    return t2.stringLiteral(transformText(valuePath.node.value));
  }
  if (valuePath.isJSXExpressionContainer()) {
    return transformJSXExpressionContainer(valuePath);
  }
  return null;
};
var buildProps = (path, state) => {
  const tag = getTag(path, state);
  const props = path.get("openingElement").get("attributes");
  if (props.length === 0) {
    return {
      tag,
      props: t2.objectExpression([])
    };
  }
  const properties = [];
  props.forEach((prop) => {
    if (prop.isJSXAttribute()) {
      const name = getJSXAttributeName(prop);
      const attributeValue = getJSXAttributeValue(prop, state);
      properties.push(
        t2.objectProperty(
          t2.stringLiteral(name),
          attributeValue || t2.booleanLiteral(true)
        )
      );
    }
  });
  return {
    tag,
    props: t2.objectExpression(properties)
  };
};
var getChildren = (paths, state) => paths.map((path) => {
  if (path.isJSXText()) {
    const transformedText = transformJSXText(path);
    if (transformedText) {
      return t2.callExpression(createIdentifier(state, "createTextVNode"), [
        transformedText
      ]);
    }
    return transformedText;
  }
  if (path.isObjectExpression()) {
    return path.node;
  }
  if (path.isJSXExpressionContainer()) {
    const expression = transformJSXExpressionContainer(path);
    if (t2.isIdentifier(expression)) {
      const { name } = expression;
      const { referencePaths = [] } = path.scope.getBinding(name) || {};
      referencePaths.forEach((referencePath) => {
        walksScope(referencePath, name, slotFlags_default.DYNAMIC);
      });
    }
    return expression;
  }
  if (path.isJSXSpreadChild()) {
    return transformJSXSpreadChild(path);
  }
  if (path.isCallExpression()) {
    return path.node;
  }
  if (path.isJSXElement()) {
    return transformJSXElement(path, state);
  }
  throw new Error(`getChildren: ${path.type} is not supported`);
}).filter(
  (value) => value != null && !t2.isJSXEmptyExpression(value)
);
var genProps = (props) => {
  const result = [];
  const events = [];
  const newProps = [];
  props.properties.forEach((prop) => {
    if (t2.isObjectProperty(prop)) {
      const name = prop.key.value;
      if (["use", "ref", "resolve"].includes(name)) {
        result.push(t2.objectProperty(t2.identifier(name), prop.value));
        return;
      } else if (isOn(name)) {
        events.push(
          t2.objectProperty(
            t2.identifier(
              name.slice(2).replace(/^[^\s]/, (str) => str.toLowerCase())
            ),
            prop.value
          )
        );
        return;
      } else if (name === "slot") {
        return;
      }
    }
    newProps.push(prop);
  });
  if (events.length) {
    result.push(
      t2.objectProperty(t2.identifier("events"), t2.objectExpression(events))
    );
  }
  if (newProps.length) {
    result.push(
      t2.objectProperty(t2.identifier("props"), t2.objectExpression(newProps))
    );
  }
  return result;
};
var genComponent = (component) => {
  return t2.objectProperty(
    t2.identifier("component"),
    t2.isStringLiteral(component) ? component : component.name.indexOf(":") > -1 ? t2.stringLiteral(component.name) : component
  );
};
var genKey = (() => {
  let idx = 0;
  const generateKey = (prefix) => {
    return `${prefix}_${idx++}`;
  };
  return (path, state) => {
    const { customKey = "BABEL_PLUGIN_JSX" } = state.opts;
    return t2.objectProperty(
      t2.identifier("key"),
      t2.stringLiteral(
        typeof customKey === "string" ? generateKey(customKey) : customKey()
      )
    );
  };
})();
var isNamedSlot = (slot) => {
  if (!t2.isObjectExpression(slot)) {
    return "";
  }
  const properties = slot.properties;
  const componentPropertyIdx = properties.findIndex((item) => {
    if (t2.isObjectProperty(item)) {
      return item.key.name === "component" && t2.isStringLiteral(item.value) && item.value.value.startsWith(`${Components.Template}:`);
    }
  });
  if (componentPropertyIdx > -1) {
    const componentProperty = properties[componentPropertyIdx];
    const oldVal = componentProperty.value.value;
    const slotName = oldVal.split(":")[1];
    properties.splice(componentPropertyIdx, 1);
    return slotName;
  }
  return "";
};
var genChildSlot = (slot, slotName) => {
  const targetSlots = slot.properties.find((v) => {
    return t2.isObjectProperty(v) && v.key.name === "slots";
  });
  if (!targetSlots) {
    return slot;
  }
  const targetDefault = targetSlots.value.properties.find((v) => {
    return t2.isObjectProperty(v) && v.key.name === "default";
  });
  const value = targetDefault.value;
  if (slotName === "buttons") {
    return t2.isArrayExpression(value) ? value : t2.arrayExpression([value]);
  } else {
    return value;
  }
};
var genSlots = (slots) => {
  const defaultSlots = [];
  const namedSlots = {};
  const dialogSlots = [];
  slots.forEach((slot) => {
    const properties = slot.properties;
    const slotName = isNamedSlot(slot);
    if (slotName) {
      namedSlots[slotName] = genChildSlot(slot, slotName);
    } else if (properties) {
      const componentPropertyIdx = properties.findIndex((item) => {
        if (t2.isObjectProperty(item)) {
          return item.key.name === "component" && (t2.isStringLiteral(item.value) && item.value.value === Components.Dialog || t2.isIdentifier(item.value) && item.value.name === Components.Dialog);
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
  return t2.objectProperty(
    t2.identifier("slots"),
    t2.objectExpression(
      [
        !namedSlots.default && t2.objectProperty(
          t2.identifier("default"),
          defaultSlots.length <= 1 ? (defaultSlots == null ? void 0 : defaultSlots[0]) || t2.objectExpression([]) : t2.arrayExpression(defaultSlots)
        ),
        ...Object.keys(namedSlots).map((key) => {
          return t2.objectProperty(t2.identifier(key), namedSlots[key]);
        }),
        dialogSlots.length && t2.objectProperty(
          t2.identifier("dialog"),
          t2.arrayExpression(dialogSlots)
        )
      ].filter(Boolean)
    )
  );
};
var isTemplate = (tag) => {
  return tag.name === Components.Template;
};
var isFragment = (tag) => {
  return tag.name === Components.Fragment;
};
var hasSlot = (path, state) => {
  const attributes = path.get("openingElement").get("attributes");
  for (const attribute of attributes) {
    if (attribute.isJSXAttribute()) {
      const name = getJSXAttributeName(attribute);
      const value = getJSXAttributeValue(attribute, state);
      if (name === "slot" && t2.isStringLiteral(value) && value.value) {
        const slotName = value.value;
        return slotName;
      }
    }
  }
  return "";
};
var transformJSXElement = (path, state) => {
  const children = getChildren(path.get("children"), state);
  const { tag, props } = buildProps(path, state);
  const { injectKey } = state.opts;
  if (isFragment(tag)) {
    return t2.objectExpression(
      [
        injectKey && genKey(path, state),
        ...genProps(props),
        children.length && genSlots(children)
      ].filter(Boolean)
    );
  }
  const slotName = hasSlot(path, state);
  if (isTemplate(tag) && slotName) {
    tag.name += `:${slotName}`;
  }
  return t2.objectExpression(
    [
      injectKey && genKey(path, state),
      genComponent(tag),
      ...genProps(props),
      children.length && genSlots(children)
    ].filter(Boolean)
  );
};
var visitor = {
  "JSXFragment|JSXText": {
    enter(path) {
      path.remove();
    }
  },
  JSXElement: {
    exit(path, state) {
      const tag = getTag(path, state);
      const isComponent = checkIsComponent(path.get("openingElement"), state);
      if (!isComponent) {
        path.remove();
        return;
      }
      if (isTemplate(tag) && !hasSlot(path, state)) {
        path.remove();
        return;
      }
      const parent = path.findParent((parentPath) => parentPath.isJSXElement());
      const { isReactiveRoot } = state.opts;
      const nodes = !parent && isReactiveRoot ? t2.callExpression(createIdentifier(state, "reactive"), [
        transformJSXElement(path, state)
      ]) : transformJSXElement(path, state);
      path.replaceWith(nodes);
    }
  }
};
var transform_vue_jsx_default = visitor;

// src/index.ts
var hasJSX = (parentPath) => {
  let fileHasJSX = false;
  parentPath.traverse({
    JSXElement(path) {
      fileHasJSX = true;
      path.stop();
    },
    JSXFragment(path) {
      fileHasJSX = true;
      path.stop();
    }
  });
  return fileHasJSX;
};
var JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;
var src_default = ({ types }) => ({
  name: "babel-plugin-jsx",
  inherits: syntaxJsx,
  visitor: __spreadProps(__spreadValues({}, transform_vue_jsx_default), {
    // ...sugarFragment,
    Program: {
      enter(path, state) {
        if (hasJSX(path)) {
          const importNames = [
            "createVNode",
            "Fragment",
            "resolveComponent",
            "withDirectives",
            "vShow",
            "vModelSelect",
            "vModelText",
            "vModelCheckbox",
            "vModelRadio",
            "vModelText",
            "vModelDynamic",
            "resolveDirective",
            "mergeProps",
            "createTextVNode",
            "isVNode",
            "reactive"
          ];
          if (isModule(path)) {
            const importMap = {};
            const { librarySource } = state.opts;
            importNames.forEach((name) => {
              state.set(name, () => {
                if (importMap[name]) {
                  return types.cloneNode(importMap[name]);
                }
                const identifier4 = addNamed(path, name, librarySource, {
                  ensureLiveReference: true
                });
                console.log(name, identifier4);
                importMap[name] = identifier4;
                return identifier4;
              });
            });
            return;
            const { enableObjectSlots = false } = state.opts;
            console.log(enableObjectSlots, "enableObjectSlots");
            if (enableObjectSlots) {
              state.set("@vue/babel-plugin-jsx/runtimeIsSlot", () => {
                if (importMap.runtimeIsSlot) {
                  return importMap.runtimeIsSlot;
                }
                const { name: isVNodeName } = state.get(
                  "isVNode"
                )();
                const isSlot = path.scope.generateUidIdentifier("isSlot");
                const ast = template.ast`
                    function ${isSlot.name}(s) {
                      return typeof s === 'function' || (Object.prototype.toString.call(s) === '[object Object]' && !${isVNodeName}(s));
                    }
                  `;
                console.log(isSlot);
                const lastImport = path.get("body").filter((p) => p.isImportDeclaration()).pop();
                if (lastImport) {
                  lastImport.insertAfter(ast);
                }
                importMap.runtimeIsSlot = isSlot;
                return isSlot;
              });
            }
          } else {
            let sourceName;
            importNames.forEach((name) => {
              state.set(name, () => {
                if (!sourceName) {
                  sourceName = addNamespace(path, "vue", {
                    ensureLiveReference: true
                  });
                }
                return t3.memberExpression(sourceName, t3.identifier(name));
              });
            });
            const helpers = {};
            const { enableObjectSlots = true } = state.opts;
            if (enableObjectSlots) {
              state.set("@vue/babel-plugin-jsx/runtimeIsSlot", () => {
                if (helpers.runtimeIsSlot) {
                  return helpers.runtimeIsSlot;
                }
                const isSlot = path.scope.generateUidIdentifier("isSlot");
                const { object: objectName } = state.get(
                  "isVNode"
                )();
                const ast = template.ast`
                  function ${isSlot.name}(s) {
                    return typeof s === 'function' || (Object.prototype.toString.call(s) === '[object Object]' && !${objectName.name}.isVNode(s));
                  }
                `;
                const nodePaths = path.get("body");
                const lastImport = nodePaths.filter(
                  (p) => p.isVariableDeclaration() && p.node.declarations.some(
                    (d) => {
                      var _a;
                      return ((_a = d.id) == null ? void 0 : _a.name) === sourceName.name;
                    }
                  )
                ).pop();
                if (lastImport) {
                  lastImport.insertAfter(ast);
                }
                return isSlot;
              });
            }
          }
          const {
            opts: { pragma = "" },
            file
          } = state;
          if (pragma) {
            state.set("createVNode", () => t3.identifier(pragma));
          }
          if (file.ast.comments) {
            for (const comment of file.ast.comments) {
              const jsxMatches = JSX_ANNOTATION_REGEX.exec(comment.value);
              if (jsxMatches) {
                state.set("createVNode", () => t3.identifier(jsxMatches[1]));
              }
            }
          }
        }
      },
      exit(path) {
        const body = path.get("body");
        const specifiersMap = /* @__PURE__ */ new Map();
        body.filter(
          (nodePath) => t3.isImportDeclaration(nodePath.node) && nodePath.node.source.value === "vue"
        ).forEach((nodePath) => {
          const { specifiers: specifiers2 } = nodePath.node;
          let shouldRemove = false;
          specifiers2.forEach((specifier) => {
            if (!specifier.loc && t3.isImportSpecifier(specifier) && t3.isIdentifier(specifier.imported)) {
              specifiersMap.set(specifier.imported.name, specifier);
              shouldRemove = true;
            }
          });
          if (shouldRemove) {
            nodePath.remove();
          }
        });
        const specifiers = [...specifiersMap.keys()].map(
          (imported) => specifiersMap.get(imported)
        );
        if (specifiers.length) {
          path.unshiftContainer(
            "body",
            t3.importDeclaration(specifiers, t3.stringLiteral("vue"))
          );
        }
      }
    }
  })
});
export {
  src_default as default
};
