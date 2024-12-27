import CCP from "cc-plugin/src/ccp/entry-render";
import { Msg, Page, PluginEvent } from "../../core/types";
import { Terminal } from "../../scripts/terminal";
import { TestClient, testServer } from "./test/server";
export type BridgeCallback = (data: PluginEvent, sender: chrome.runtime.Port) => void;
if (chrome.devtools) {
  console.log("chrome devtools");
}
class Bridge implements TestClient {
  /**
   * 把callback保存为变量，方便测试
   */
  public onMessage: BridgeCallback | null = null;

  /**
   * 和background建立的链接
   */
  private connect: chrome.runtime.Port | null = null;
  private terminal = new Terminal(Page.Devtools);
  constructor() {
    this.init();
  }

  private init() {
    if (CCP.Adaptation.Env.isChromeRuntime) {
      this.connect = chrome.runtime.connect({ name: Page.Devtools });
      this.connect.onDisconnect.addListener(() => {
        console.log(...this.terminal.disconnect(""));
        this.connect = null;
      });

      this.connect.onMessage.addListener((event, sender: chrome.runtime.Port) => {
        const data = PluginEvent.create(event);
        console.log(...this.terminal.chunkMessage(data.toChunk()));
        if (data.valid && this.onMessage) {
          this.onMessage(data, sender);
        } else {
          console.log(JSON.stringify(event));
        }
      });
    } else {
      testServer.add(this);
    }
  }

  recv(event: PluginEvent): void {
    this.doMessage(event);
  }
  doMessage(data: PluginEvent) {
    if (this.onMessage) {
      this.onMessage(data, null);
    }
  }
  send(msg: Msg, data?: any) {
    if (CCP.Adaptation.Env.isChromeDevtools) {
      if (this.connect) {
        let sendData = new PluginEvent(Page.Devtools, Page.Background, msg, data);
        this.connect.postMessage(sendData);
      } else {
        console.warn(...this.terminal.log("重新和background建立链接"));
        this.init();
        this.send(msg, data);
      }
    } else {
      testServer.recv(msg, data);
    }
  }
}

export const bridge = new Bridge();
