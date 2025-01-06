// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import { uniq } from "lodash";
import { Msg, PluginEvent, RequestLogData, RequestNodeInfoData, RequestSetPropertyData, ResponseNodeInfoData, ResponseSetPropertyData, ResponseSupportData, ResponseTreeInfoData } from "../../core/types";
import { ArrayData, BoolData, ColorData, DataType, EngineData, Group, ImageData, Info, InvalidData, NodeInfoData, NumberData, ObjectData, Property, StringData, TreeData, Vec2Data, Vec3Data } from "../../views/devtools/data";
import { InjectEvent } from "./event";
import { getValue, trySetValueWithConfig } from "./setValue";
import { BuildArrayOptions, BuildImageOptions, BuildObjectOptions, BuildVecOptions } from "./types";
import { isHasProperty } from "./util";
declare const cc: any;

export class Inspector extends InjectEvent {
  inspectorGameMemoryStorage: Record<string, any> = {};

  private watchIsCocosGame() {
    const timer = setInterval(() => {
      if (this._isCocosGame()) {
        clearInterval(timer);
        // @ts-ignore
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
          const isCocosGame = this._isCocosGame();
          this.notifySupportGame(isCocosGame);
        });
      }
    }, 300);
  }
  onMessage(pluginEvent: PluginEvent): void {
    switch (pluginEvent.msg) {
      case Msg.RequestSupport: {
        const isCocosGame = this._isCocosGame();
        this.notifySupportGame(isCocosGame);
        break;
      }
      case Msg.RequstTreeInfo: {
        this.updateTreeInfo();
        break;
      }
      case Msg.RequestNodeInfo: {
        const data = pluginEvent.data as RequestNodeInfoData;
        this.getNodeInfo(data.uuid);
        break;
      }
      case Msg.RequestSetProperty: {
        const data: RequestSetPropertyData = pluginEvent.data;
        let value = data.data;
        if (data.type === DataType.Color) {
          // @ts-ignore
          value = cc.color().fromHEX(value);
        }

        if (this.setValue(data.path, value)) {
          this.sendMsgToContent(Msg.ResponseSetProperty, data as ResponseSetPropertyData);
        } else {
          console.warn(`设置失败：${data.path}`);
        }
        break;
      }
      case Msg.RequestLogData: {
        const data: RequestLogData = pluginEvent.data;
        const value = getValue(this.inspectorGameMemoryStorage, data);
        // 直接写console.log会被tree shaking
        const logFunction = console.log;
        logFunction(value);
        break;
      }
    }
  }
  init() {
    console.log(...this.terminal.init());
    this.watchIsCocosGame();
  }

  notifySupportGame(b: boolean) {
    this.sendMsgToContent(Msg.ResponseSupport, { support: b, msg: "" } as ResponseSupportData);
  }

  updateTreeInfo() {
    let isCocosCreatorGame = this._isCocosGame();
    if (isCocosCreatorGame) {
      //@ts-ignore
      let scene = cc.director.getScene();
      if (scene) {
        let treeData = new TreeData();
        this.getNodeChildren(scene, treeData);
        this.sendMsgToContent(Msg.ResponseTreeInfo, treeData as ResponseTreeInfoData);
      } else {
        console.warn("can't execute api : cc.director.getScene");
        this.notifySupportGame(false);
      }
    } else {
      this.notifySupportGame(false);
    }
  }

  // @ts-ignore
  draw: cc.Graphics = null;

  _drawRect(node: any) {
    let draw = this.draw;

    if (!draw) {
      // @ts-ignore
      let node = new cc.Node("draw-node");
      // @ts-ignore
      cc.director.getScene().addChild(node);
      // @ts-ignore
      draw = this.draw = node.addComponent(cc.Graphics);
    }
    draw.clear();
    draw.lineWidth = 10;
    // @ts-ignore
    draw.strokeColor = new cc.Color().fromHEX("#ff0000");
    const { anchorX, anchorY, width, height, x, y } = node;
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    let leftBottom = node.convertToWorldSpaceAR(cc.v2(-halfWidth, -halfHeight));
    let leftTop = node.convertToWorldSpaceAR(cc.v2(-halfWidth, halfHeight));
    let rightBottom = node.convertToWorldSpaceAR(cc.v2(halfWidth, -halfHeight));
    let rightTop = node.convertToWorldSpaceAR(cc.v2(halfWidth, halfHeight));

    function line(began: any, end: any) {
      draw.moveTo(began.x, began.y);
      draw.lineTo(end.x, end.y);
    }

    line(leftBottom, rightBottom);
    line(rightBottom, rightTop);
    line(rightTop, leftTop);
    line(leftTop, leftBottom);
    this.draw.stroke();
  }

  // 收集节点信息
  getNodeChildren(node: any, data: TreeData) {
    data.id = node.uuid;
    data.text = node.name;
    // @ts-ignore
    if (node instanceof cc.Scene) {
      // 场景不允许获取active，引擎会报错
    } else {
      data.active = !!node.active;
    }
    this.inspectorGameMemoryStorage[node.uuid] = node;
    let nodeChildren = node.children;
    for (let i = 0; i < nodeChildren.length; i++) {
      let childItem = nodeChildren[i];
      let treeData = new TreeData();
      this.getNodeChildren(childItem, treeData);
      data.children.push(treeData);
    }
  }

  _isCocosGame() {
    // @ts-ignore 检测是否包含cc变量
    return typeof cc !== "undefined";
  }

  getAllPropertyDescriptors(obj: Object): string[] {
    let keys: string[] = [];

    function circle(root: Object) {
      const descriptors = Object.getOwnPropertyDescriptors(root);
      for (let descriptorsKey in descriptors) {
        if (Object.hasOwnProperty.call(descriptors, descriptorsKey)) {
          const value = descriptors[descriptorsKey];
          // 不可枚举的属性，并且允许修改get set的才有效
          if (!value.enumerable && value.configurable) {
            keys.push(descriptorsKey);
          }
        }
      }
      const proto = Object.getPrototypeOf(root);
      if (proto) {
        circle(proto);
      }
    }

    circle(obj);
    return keys;
  }

  _getNodeKeys(node: any) {
    // 3.x变成了getter
    let excludeProperty = [
      "children",
      "quat",
      "node",
      "components",
      "parent",
      // 生命周期函数
      "onFocusInEditor",
      "onRestore",
      "start",
      "lateUpdate",
      "update",
      "resetInEditor",
      "onLostFocusInEditor",
      "onEnable",
      "onDisable",
      "onDestroy",
      "onLoad",
    ];
    const keyHidden = this.getAllPropertyDescriptors(node);
    const keyVisible1 = Object.keys(node); // Object不走原型链
    let keyVisible2: string[] = [];
    for (let nodeKey in node) {
      // 走原型链
      keyVisible2.push(nodeKey);
    }
    let allKeys: string[] = uniq(keyHidden.concat(keyVisible1, keyVisible2)).sort();
    allKeys = allKeys.filter((key) => {
      return !key.startsWith("_") && !excludeProperty.includes(key);
    });

    allKeys = allKeys.filter((key) => {
      try {
        return typeof node[key] !== "function";
      } catch (e) {
        // console.warn(`属性${key}出现异常：\n`, e);
        return false;
      }
    });
    return allKeys;
  }

  _getPairProperty(key: string): null | { key: string; values: string[] } {
    let pairProperty: Record<string, any> = {
      rotation: ["rotationX", "rotationY"],
      anchor: ["anchorX", "anchorY"],
      size: ["width", "height"],
      skew: ["skewX", "skewY"],
      position: ["x", "y", "z"], // position比较特殊，过来的key就是position也需要能处理
      scale: ["scaleX", "scaleY", "scaleZ"],
    };
    for (let pairPropertyKey in pairProperty) {
      if (pairProperty.hasOwnProperty(pairPropertyKey)) {
        let pair = pairProperty[pairPropertyKey];
        if (pair.includes(key) || key === pairPropertyKey) {
          return { key: pairPropertyKey, values: pair };
        }
      }
    }
    return null;
  }

  _buildVecData(options: BuildVecOptions) {
    const ctor: Function = options.ctor;
    const keys: Array<string> = options.keys;
    const value: Object = options.value;
    const data: Vec3Data | Vec2Data = options.data;
    const path: Array<string> = options.path;

    if (ctor && value instanceof ctor) {
      let hasUnOwnProperty = keys.find((key) => !value.hasOwnProperty(key));
      if (!hasUnOwnProperty) {
        for (let key in keys) {
          let propName = keys[key];
          if (value.hasOwnProperty(propName)) {
            let propPath = path.concat(propName);
            let itemData = this._genInfoData(value, propName, propPath);
            if (itemData) {
              data.add(new Property(propName, itemData));
            }
          }
        }
        return data;
      }
    }
    return null;
  }

  _buildImageData(options: BuildImageOptions) {
    const ctor: Function = options.ctor;
    const value: Object = options.value;
    const data: ImageData = options.data;
    const path: Array<string> = options.path;
    if (ctor && value instanceof ctor) {
      data.path = path;
      // 2.4.6 没有了这个属性
      if (value.hasOwnProperty("_textureFilename")) {
        //@ts-ignore
        data.data = `${window.location.origin}/${value._textureFilename}`;
      } else {
        data.data = null;
      }
      return data;
    }
    return null;
  }

  _genInfoData(node: any, key: string | number, path: Array<string>, filterKey = true): Info | null {
    let propertyValue = node[key];
    let info = null;
    let invalidType = this._isInvalidValue(propertyValue);
    if (invalidType) {
      info = new InvalidData(invalidType);
    } else {
      switch (typeof propertyValue) {
        case "boolean":
          info = new BoolData(propertyValue);
          break;
        case "number":
          info = new NumberData(propertyValue);
          break;
        case "string":
          info = new StringData(propertyValue);
          break;
        default:
          //@ts-ignore
          if (propertyValue instanceof cc.Color) {
            let hex = propertyValue.toHEX();
            info = new ColorData(`#${hex}`);
          } else if (Array.isArray(propertyValue)) {
            let keys: number[] = [];
            for (let i = 0; i < propertyValue.length; i++) {
              keys.push(i);
            }
            info = this._buildArrayData({
              data: new ArrayData(),
              path: path,
              value: propertyValue,
              keys: keys,
            });
          } else {
            !info &&
              (info = this._buildVecData({
                // @ts-ignore
                ctor: cc.Vec3,
                path: path,
                data: new Vec3Data(),
                keys: ["x", "y", "z"],
                value: propertyValue,
              }));
            !info &&
              (info = this._buildVecData({
                // @ts-ignore
                ctor: cc.Vec2,
                path: path,
                data: new Vec2Data(),
                keys: ["x", "y"],
                value: propertyValue,
              }));
            !info &&
              (info = this._buildImageData({
                //@ts-ignore
                ctor: cc.SpriteFrame,
                data: new ImageData(),
                path: path,
                value: propertyValue,
              }));
            if (!info) {
              if (typeof propertyValue === "object") {
                let ctorName = propertyValue.constructor?.name;
                if (ctorName) {
                  if (
                    ctorName.startsWith("cc_") ||
                    // 2.4.0
                    ctorName === "CCClass"
                  ) {
                    info = new EngineData();
                    info.engineType = ctorName;
                    info.engineName = propertyValue.name;
                    info.engineUUID = propertyValue.uuid;
                  }
                }
                if (!info) {
                  // 空{}
                  // MaterialVariant 2.4.0
                  info = this._buildObjectData({
                    data: new ObjectData(),
                    path: path,
                    value: propertyValue,
                    filterKey: filterKey,
                  });
                }
              }
            }
          }
          break;
      }
    }
    if (info) {
      info.readonly = this._isReadonly(node, key);
      info.path = path;
    } else {
      console.error(`暂不支持的属性值`, propertyValue);
    }
    return info;
  }

  _buildArrayData({ value, path, data, keys }: BuildArrayOptions) {
    keys = keys.filter((key) => !key.toString().startsWith("_"));
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let propPath = path.concat(key.toString());
      let itemData = this._genInfoData(value, key, propPath);
      if (itemData) {
        data.add(new Property(key.toString(), itemData));
      }
    }
    return data;
  }

  _buildObjectItemData({ value, path, data, filterKey }: BuildObjectOptions): Property[] {
    let keys = Object.keys(value);
    if (filterKey) {
      keys = this.filterKeys(keys); // 不再进行开发者定义的数据
    }
    let ret: Property[] = [];
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let propPath = path.concat(key.toString());
      let itemData = this._genInfoData(value, key, propPath, filterKey);
      if (itemData) {
        ret.push(new Property(key, itemData));
      }
    }
    return ret;
  }

  filterKeys(keys: string[]) {
    // 剔除_开头的属性
    return keys.filter((key) => !key.toString().startsWith("_"));
  }

  _isInvalidValue(value: any) {
    // !!Infinity=true
    if ((value && value !== Infinity) || value === 0 || value === false || value === "") {
      return false;
    }

    if (value === null) {
      return "null";
    } else if (value === Infinity) {
      return "Infinity";
    } else if (value === undefined) {
      return "undefined";
    } else if (Number.isNaN(value)) {
      return "NaN";
    } else {
      debugger;
      return false;
    }
  }

  _buildObjectData({ value, path, data, filterKey }: BuildObjectOptions) {
    let keys = Object.keys(value);
    if (filterKey) {
      keys = this.filterKeys(keys);
    }
    //  只返回一级key，更深层级的key需要的时候，再获取，防止circle object导致的死循环
    let desc: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let propPath = path.concat(key.toString());
      let propValue = (value as any)[key];
      let keyDesc = "";
      if (Array.isArray(propValue)) {
        // 只收集一级key
        propValue.forEach((item) => {});
        keyDesc = `(${propValue.length}) [...]`;
      } else if (this._isInvalidValue(propValue)) {
        // 不能改变顺序
        keyDesc = propValue;
      } else if (typeof propValue === "object") {
        keyDesc = `${propValue.constructor.name} {...}`;
      } else {
        keyDesc = propValue;
      }
      desc[key] = keyDesc;
    }
    data.data = [];
    //JSON.stringify(desc);
    return data;
  }

  private getCompName(comp: any): string {
    const nameKeys = [
      "__classname__", // 2.4.0 验证通过
    ];
    for (let i = 0; i < nameKeys.length; i++) {
      let key = nameKeys[i];
      // 一般来说，这里的name是不会出现假值
      if (comp[key]) {
        return comp[key];
      }
    }
    return comp.constructor.name;
  }

  // 校验keys的有效性，3.x有position，没有x,y,z
  _checkKeysValid(obj: any, keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!isHasProperty(obj, key)) {
        return false;
      }
    }
    return true;
  }

  _getGroupData(node: any) {
    const name = this.getCompName(node);
    let nodeGroup = new Group(name, node.uuid);
    let keys = this._getNodeKeys(node);
    for (let i = 0; i < keys.length; ) {
      let key = keys[i];
      let pair = this._getPairProperty(key);
      if (pair && this._checkKeysValid(node, pair.values)) {
        let bSplice = false;
        // 把这个成对的属性剔除掉
        pair.values.forEach((item: string) => {
          let index = keys.findIndex((el) => el === item);
          if (index !== -1) {
            keys.splice(index, 1);
            if (pair && item === pair.key) {
              // 切掉了自己，才能步进+1
              bSplice = true;
            }
          }
        });
        // 序列化成对的属性
        let info: Vec2Data | Vec3Data | null = null;
        let pairValues = pair.values;
        if (pairValues.length === 2) {
          info = new Vec2Data();
        } else if (pairValues.length === 3) {
          info = new Vec3Data();
        }
        // todo path
        pairValues.forEach((el: string) => {
          let propertyPath = [node.uuid, el];
          let vecData = this._genInfoData(node, el, propertyPath);
          if (vecData) {
            info && info.add(new Property(el, vecData));
          }
        });
        if (info) {
          let property = new Property(pair.key, info);
          nodeGroup.addProperty(property);
        }
        if (!bSplice) {
          i++;
        }
      } else {
        let propertyPath = [node.uuid, key];
        let info = this._genInfoData(node, key, propertyPath);
        if (info) {
          nodeGroup.addProperty(new Property(key, info));
        }
        i++;
      }
    }
    nodeGroup.sort();
    return nodeGroup;
  }

  // 获取节点信息，只获取一级key即可，后续
  getNodeInfo(uuid: string) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      let groupData = [];
      if (node.isValid) {
        // 收集节点信息
        let nodeGroup = this._getGroupData(node);
        groupData.push(nodeGroup);
        // 收集组件信息
        const nodeComp = node._components;
        if (nodeComp) {
          for (let i = 0; i < nodeComp.length; i++) {
            let itemComp = nodeComp[i];
            this.inspectorGameMemoryStorage[itemComp.uuid] = itemComp;
            let compGroup = this._getGroupData(itemComp);
            groupData.push(compGroup);
          }
        }
      }
      const data: NodeInfoData = new NodeInfoData(uuid, groupData);
      this.sendMsgToContent(Msg.ResponseNodeInfo, data as ResponseNodeInfoData);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  }

  logValue(uuid: string, key: string) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp) {
      console.log(nodeOrComp[key]);
    }
  }

  _isReadonly(base: Object, key: string | number): boolean {
    let ret = Object.getOwnPropertyDescriptor(base, key);
    if (ret) {
      return !(ret.set || ret.writable);
    } else {
      let proto = Object.getPrototypeOf(base);
      if (proto) {
        return this._isReadonly(proto, key);
      } else {
        return false;
      }
    }
  }

  setValue(pathArray: Array<string>, value: string): boolean {
    let target = this.inspectorGameMemoryStorage;
    // 尝试设置creator3.x的数据
    if (trySetValueWithConfig(pathArray, target, value)) {
      return true;
    }
    for (let i = 0; i < pathArray.length; i++) {
      let path = pathArray[i];
      if (i === pathArray.length - 1) {
        // 到最后的key了
        if (this._isReadonly(target, path)) {
          console.warn(`值不允许修改`);
        } else {
          target[path] = value;
          return true;
        }
      } else {
        // creator3.x的enumerable导致无法判断
        if (target.hasOwnProperty(path) || target[path]) {
          target = target[path];
        } else {
          return false;
        }
      }
    }
    return false;
  }

  onMemoryInfo() {
    const memory = console["memory"];
    this.sendMsgToContent(Msg.MemoryInfo, {
      performance: {
        // @ts-ignore
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
        // @ts-ignore
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        // @ts-ignore
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
      },

      console: {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      },
    });
  }
}
