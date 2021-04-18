import IChannelMessage from "./IChannelMessage";

export default class AResponse implements IChannelMessage {
  name: string = 'null';
  payload: any = null;
  allowSendByApp: boolean = true;
  allowSendByUI: boolean = false;
}