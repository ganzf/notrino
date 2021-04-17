import IChannel from "common/IChannel";
import IChannelCallback from "common/IChannelCallback";
import IChannelMessage from "common/IChannelMessage";
import core from "ui";
import { NewNoteInfo } from "ui/protocol/events/Notes";

class AppChannel implements IChannel {
  ipc: any;

  constructor() {
    // @ts-ignore;
    this.ipc = window.ipcRenderer;
  }

  send(event: IChannelMessage): boolean {
    console.log(`=> ${event.name}`, { event });
    if (!event.allowSendByUI) {
      return false;
    }
    this.ipc.send(event.name, event);
    return true;
  }

  on(eventName: string, callback: IChannelCallback): boolean {
    console.log('Listening on ' + eventName);
    this.ipc.on(eventName, (event: any, response: IChannelMessage) => { 
      console.log('<< ' + eventName, response);
      callback(response);
    })
    return true;
  }

  off(eventName: string): boolean {
    return false;
  }

}

export default AppChannel;