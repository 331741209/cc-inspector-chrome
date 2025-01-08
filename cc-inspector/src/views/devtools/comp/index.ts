export enum CompType {
  Node = "cc.Node",
  Spirte = "cc.Sprite",
  Label = "cc.Label",
  Widget = "cc.Widget",
  Camera = "cc.Camera",
  Canvas = "cc.Canvas",
  Mask = "cc.Mask",
  ScrollView = "cc.ScrollView",
  UITransform = "cc.UITransform",
  ParticleSystem = "cc.ParticleSystem",
  EditBox = "cc.EditBox",
  TiledTile = "cc.TiledTile",
  Light = "cc.Light",
  VideoPlayer = "cc.VideoPlayer",
  MeshRenderer = "cc.MeshRenderer",
  ProgressBar = "cc.ProgressBar",
  RichText = "cc.RichText",
  Slider = "cc.Slider",
  PageView = "cc.PageView",
  Webview = "cc.WebView",
  ToggleGroup = "cc.ToggleGroup",
  ToggleContainer = "cc.ToggleContainer",
  Toggle = "cc.Toggle",
  Button = "cc.Button",
  BlockInputEvents = "cc.BlockInputEvents",
  Scene = "cc.Scene",
  Animation = "cc.Animation",
}

export function getSimpleProperties(typeName: string): string[] {
  const config = {};
  config[CompType.Animation] = [
    "defaultClip", //
    "clips",
    "playOnLoad",
  ];
  config[CompType.Scene] = [
    "autoReleaseAssets",
    "position",
    "scale",
    "rotation",
    "color", //
  ];
  config[CompType.BlockInputEvents] = ["enabled"];
  config[CompType.Button] = [
    "target", //
    "interactable",
    "enableAutoGrayEffect",
    "transition",
    "duration",
    "zoomScale",
    "normalColor",
    "normalSprite",
    "pressedColor",
    "pressedSprite",
    "disabledColor",
    "disabledSprite",
    "hoverColor",
    "hoverSprite",
    "duration",
  ];
  config[CompType.Toggle] = [
    "target",
    "interactable",
    "enableAutoGrayEffect",
    "transition", //
    "duration",
    "zoomScale",
    "isChecked",
    "checkMark",
    "toggleGroup",
  ];
  config[CompType.ToggleContainer] = ["allowSwitchOff"];
  config[CompType.ToggleGroup] = ["allowSwitchOff"];
  config[CompType.Webview] = ["url"];
  config[CompType.PageView] = [
    "content",
    "sizeMode",
    "direction",
    "scrollThreshold",
    "autoPageTurningThreshold", //
    "inertia",
    "brake",
    "elastic",
    "bounceDuration",
    "indicator",
    "pageTurningSpeed",
    "pageTurningEventTiming",
    "cancelInnerEvents",
  ];
  config[CompType.Slider] = ["handle", "direction", "progress"];
  config[CompType.RichText] = [
    "string",
    "horizontalAlign",
    "fontSize",
    "font",
    "fontFamily",
    "useSystemFont",
    "cacheMode",
    "maxWidth",
    "lineHeight",
    "imageAtlas",
    "handleTouchEvent", //
  ];
  config[CompType.ProgressBar] = [
    "barSprite",
    "mode",
    "totalLength",
    "progress",
    "reverse", //
  ];
  config[CompType.MeshRenderer] = [
    "materials", //
    "mesh",
    "receiveShadows",
    "shadowCastingMode",
    "enableAutoBatch",
  ];
  config[CompType.VideoPlayer] = [
    "resourceType",
    "clip",
    "currentTime",
    "volume",
    "mute",
    "keepAspectRatio",
    "isFullscreen",
    "stayOnBottom", //
  ];
  config[CompType.Light] = [
    "type",
    "color",
    "intensity", //
    "range",
    "shadowType",
    "range",
    "spotAngle",
    "spotExp",
  ];
  config[CompType.TiledTile] = ["x", "y", "grid"];
  config[CompType.EditBox] = [
    "string",
    "placeholder", //
    "background",
    "textLabel",
    "placeholderLabel",
    "keyboardReturnType",
    "inputFlag",
    "inputMode",
    "maxLength",
    "tabIndex",
  ];
  config[CompType.ParticleSystem] = [
    "playOnLoad", //
    "autoRemoveOnFinish",
  ];
  config[CompType.Node] = [
    "position", //
    "rotation",
    "scale",
    "anchor",
    "size",
    "color",
    "opacity",
    "skew",
    "group",
    //----------
    "worldPosition",
    "worldScale",
    // "worldRotation",// 渲染有问题，暂时先不支持这个属性
  ];
  config[CompType.UITransform] = ["anchor", "size"];
  config[CompType.Widget] = [
    "left",
    "right",
    "top",
    "bottom",
    "alignMode", //
    "isAlignLeft",
    "isAlignRight",
    "isAlignTop",
    "isAlignBottom",
  ];
  config[CompType.Label] = [
    "string", //
    "horizontalAlign",
    "verticalAlign",
    "fontSize",
    "lineHeight",
    "overflow",
    "font",
    "fontFamily",
    "ebableBold",
    "enableItalic",
    "enableUnderline",
    "underlineHeight",
    "cacheMode",
    "useSystemFont",
  ];
  config[CompType.Camera] = ["clearColor", "clearFlags", "cullingMask", "depth", "zoomRatio", "alignWithScreen"];
  config[CompType.Spirte] = [
    "atlas",
    "spriteFrame",
    "type",
    "sizeMode", //
    "fillCenter",
    "fillRange",
    "fillRange",
    "fillStart",
    "fillType",
    "grayscale",
    "color",
    "spriteAtlas",
    "trim",
    "type",
  ];
  config[CompType.ScrollView] = [
    "bounceDuration",
    "content", //
    "horizontal",
    "vertical",
    "inertia",
    "brake",
    "elastic",
    "bounceDuration",
    "verticalScrollBar",
  ];
  config[CompType.Mask] = [
    "alphaThreshold",
    "inverted",
    "segments", //
    "spriteFrame",
    "type",
  ];
  config[CompType.Canvas] = [
    "fitWidth",
    "fitHeight", //
    "designResolution",
  ];
  return config[typeName] || [];
}
export const VisibleProp = {
  Active: "active",
  Enabled: "enabled",
};
