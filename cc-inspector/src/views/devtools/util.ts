import { Msg, RequestSupportData } from "../../core/types";
import { bridge } from "./bridge";

export function checkSupport() {
  bridge.send(Msg.RequestSupport, {} as RequestSupportData);
}
