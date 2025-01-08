import { isVersion3 } from "./util";

interface ConfigItem {
  path: string[],
  func: Function;
}

const config: ConfigItem[] = [
  {
    path: ["position", "x"],
    func: (target: any, value: any) => {
      let pos = target.getPosition();
      pos.x = value;
      target.setPosition(pos);
    }
  },
  {
    path: ["position", "y"],
    func: (target: any, value: any) => {
      let pos = target.getPosition();
      pos.y = value;
      target.setPosition(pos);
    }
  },
  {
    path: ["position", "z"],
    func: (target: any, value: any) => {
      let pos = target.getPosition();
      pos.z = value;
      target.setPosition(pos);
    }
  },
  {
    path: ["scale", "x"],
    func: ((target: any, value: any) => {
      let scale = target.getScale();
      scale.x = value;
      target.setScale(scale);
    })
  },
  {
    path: ["scale", "y"],
    func: ((target: any, value: any) => {
      let scale = target.getScale();
      scale.y = value;
      target.setScale(scale);
    })
  },
  {
    path: ["scale", "z"],
    func: ((target: any, value: any) => {
      let scale = target.getScale();
      scale.z = value;
      target.setScale(scale);
    })
  }
]

// 3.x不允许直接设置xyz，需要走setPosition
export function trySetValueWithConfig(pathArray: string[], targetObject: any, targetValue: any) {
  if (isVersion3()) {
    let fullPath: string = pathArray.toString()
    let item = config.find(el => {
      return fullPath.endsWith(el.path.toString())
    });
    if (item) {
      // 将多余的path去掉
      let leftPathArray = [];
      let max = pathArray.length - item.path.length;
      for (let i = 0; i < max; i++) {
        leftPathArray.push(pathArray[i])
      }

      let pathObjectValue = getValue(targetObject, leftPathArray);
      if (pathObjectValue) {
        try {
          item.func(pathObjectValue, targetValue);
          return true;
        } catch (e) {
          console.error(e);
          return false
        }
      }
    }
  }
  return false;
}

export function getValue(target: any, path: string[]) {
  for (let i = 0; i < path.length; i++) {
    let key = path[i];
    if (target[key] !== undefined || target.hasOwnProperty(key)) {
      target = target[key]
    } else {
      return null;
    }
  }
  return target;
}
