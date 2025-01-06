import { v4 } from "uuid";
import { Msg, Page, PluginEvent, RequestNodeInfoData, ResponseNodeInfoData, ResponseSupportData, ResponseTreeInfoData } from "../../../core/types";
import { VisibleProp } from "../comp";
import { ArrayData, BoolData, ColorData, EngineData, EnumData, Group, ImageData, Info, InvalidData, NodeInfoData, NumberData, ObjectData, Property, StringData, TextData, TreeData, Vec2Data, Vec3Data, Vec4Data } from "../data";
export class TestClient {
  recv(event: PluginEvent) {}
}
class Node {
  active: boolean = true;
  children: Node[] = [];
  id: string = "";
  name: string = "";
  components: Group[] = [];
  constructor(name: string = "") {
    this.name = name;
    this.active = true;
    this.id = v4();
    this.children = [];
  }
  buildComponent(name: string) {
    const info = new Group(name);
    this.components.push(info);
    return info;
  }

  buildChild(name: string) {
    const node = new Node(name);
    this.children.push(node);
    return node;
  }
  toTreeData(data: TreeData) {
    data.id = this.id;
    data.text = this.name;
    data.active = this.active;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const childData = new TreeData();
      child.toTreeData(childData);
      data.children.push(childData);
    }
  }
  private allNodes(): Node[] {
    const nodes: Node[] = [];
    function circle(node: Node) {
      node.children.forEach((child) => {
        nodes.push(child);
        circle(child);
      });
    }
    circle(this);
    return nodes;
  }
  findNode(id: string): Node | null {
    const nodes: Node[] = this.allNodes();
    return nodes.find((node) => node.id === id) || null;
  }
  findInfo(id: string): Info | null {
    const nodes: Node[] = this.allNodes();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const comp = node.findProperty(id);
      if (comp) {
        return comp;
      }
    }
    return null;
  }
  private findProperty(id: string): Info | null {
    for (let i = 0; i < this.components.length; i++) {
      const comp = this.components[i];
      for (let j = 0; j < comp.data.length; j++) {
        const item: Property = comp.data[j];
        if (item.value.id === id) {
          return item.value;
        }
      }
    }
    return null;
  }
}
export class TestServer {
  private clients: TestClient[] = [];
  private testData: Node = new Node("scene");
  constructor() {
    this.testData
      .buildChild("base")
      .buildComponent("group-base") //
      .buildProperty("bool", new BoolData(true))
      .buildProperty("text", new TextData("text"))
      .buildProperty("number", new NumberData(100))
      .buildProperty("string", new StringData("string"))
      .buildProperty("enum", new EnumData().test())
      .buildProperty("color", new ColorData("#f00"))
      .buildProperty("image", new ImageData().test());
    this.testData
      .buildChild("vec")
      .buildComponent("group-vec") //
      .buildProperty("number", new NumberData(200))
      .buildProperty("vec2", new Vec2Data().test())
      .buildProperty("vec3", new Vec3Data().test())
      .buildProperty("vec4", new Vec4Data().test());
    this.testData
      .buildChild("arr")
      .buildComponent("group-arr") //
      .buildProperty("array[t/b/n]", new ArrayData().testNormal()); //
    this.testData
      .buildChild("obj") //
      .buildComponent("group-obj")
      .buildProperty("object", new ObjectData().testNormal()); //

    this.testData
      .buildChild("arr[arr]")
      .buildComponent("group-arr[arr]") //
      .buildProperty("arr", new ArrayData().testArray()); //

    this.testData
      .buildChild("arr[obj]")
      .buildComponent("group-arr[obj]") //
      .buildProperty("arr", new ArrayData().testObject()); //
    this.testData.buildChild("engine").buildComponent("group4").buildProperty("node", new EngineData().init("name", "cc_Node", "uuid")).buildProperty("sprite", new EngineData().init("name", "cc_Sprite", "uuid")).buildProperty("label", new EngineData().init("name", "cc_Label", "uuid")).buildProperty("un_known", new EngineData().init("name", "un_known", "uuid"));

    const c = this.testData.buildChild("str1");
    c.active = false;
    c.buildComponent("group51").buildProperty("str1", new StringData("str1"));
    c.buildComponent("group52").buildProperty("num", new NumberData(200));

    this.testData.buildChild("str2").buildComponent("group6").buildProperty("str2", new StringData("str2"));

    this.testData
      .buildChild("Invalid")
      .buildComponent("group7")
      .buildProperty("NaN", new InvalidData(NaN)) //
      .buildProperty("null", new InvalidData(null))
      .buildProperty("Infinity", new InvalidData(Infinity))
      .buildProperty(VisibleProp.Active, new BoolData(true))
      .buildProperty("undefined", new InvalidData(undefined));
    this.testData
      .buildChild("comp")
      .buildComponent("node-2") //
      .buildProperty("rotation", new NumberData(0))
      .buildProperty(VisibleProp.Enabled, new BoolData(true))
      .buildProperty("max", new NumberData(100));
  }
  add(client: TestClient) {
    this.clients.push(client);
  }
  public support: boolean = true;
  recv(msg: string, data: any) {
    switch (msg) {
      case Msg.RequestSupport: {
        const e = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseSupport, {
          support: this.support,
          msg: "",
        } as ResponseSupportData);
        this.send(e);
        break;
      }
      case Msg.RequestNodeInfo: {
        const id: string = (data as RequestNodeInfoData).uuid;
        const node: Node = this.testData.findNode(id);
        let group = [];
        if (node) {
          group = node.components;
        } else {
          let g = new Group("scene").buildProperty("scene id", new StringData(id));
          group.push(g);
        }
        const ret: NodeInfoData = new NodeInfoData(id, group);
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseNodeInfo, ret as ResponseNodeInfoData);
        this.send(event);
        break;
      }
      case Msg.RequstTreeInfo: {
        const ret: TreeData = new TreeData();
        this.testData.toTreeData(ret);
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.ResponseTreeInfo, ret as ResponseTreeInfoData);
        this.send(event);
        break;
      }
      case Msg.RequestSetProperty: {
        const i = data as Info;
        console.log(i);
        break;
      }
      case Msg.RequestLogData: {
        console.log(data);
        break;
      }
      default:
        break;
    }
  }
  send(event: PluginEvent) {
    this.clients.forEach((client) => {
      client.recv(event);
    });
  }
}
export const testServer = new TestServer();
