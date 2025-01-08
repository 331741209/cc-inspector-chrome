import { ArrayData, ImageData, ObjectData, Vec2Data, Vec3Data } from "../../views/devtools/data";

export interface BuildObjectOptions {
  path: string[];
  value: Object;
  data: ObjectData;
}

export interface BuildArrayOptions {
  path: string[];
  value: Object;
  data: ArrayData;
  keys: number[];
}

export interface BuildVecOptions {
  path: string[];
  keys: string[];
  ctor: Function;
  value: Object;
  data: Vec3Data | Vec2Data;
}

export interface BuildImageOptions {
  path: string[];
  ctor: Function;
  value: Object;
  data: ImageData;
}
