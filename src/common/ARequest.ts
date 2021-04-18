import IChannelMessage from "./IChannelMessage";

export default class ARequest implements IChannelMessage {
  name: string = 'null';
  payload: any = null;
  allowSendByApp: boolean = false;
  allowSendByUI: boolean = true;
}