declare const cc: any;

export function isVersion3() {
  if (typeof cc.ENGINE_VERSION === "string") {
    const version: string = cc.ENGINE_VERSION;
    return version.startsWith("3.")
  }
  return false;
}

export function isHasProperty(base: Object, key: string): boolean {
  let ret = Object.getOwnPropertyDescriptor(base, key)
  if (ret) {
    return true;
  } else {
    let proto = Object.getPrototypeOf(base);
    if (proto) {
      return isHasProperty(proto, key)
    } else {
      return false;
    }
  }
}
