import { IpcMain, ipcMain } from "electron";
import { CreateNewNote } from '../include/events/Notes';
import IChannel from "../../common/IChannel";
import IChannelCallback from "../../common/IChannelCallback";
import IChannelMessage from "../../common/IChannelMessage";
import { core } from "../main";

class UIChannel implements IChannel {
  ipc: IpcMain = ipcMain;

  constructor() { 
    this.on(CreateNewNote.name, (cnn: CreateNewNote, reply) => {
      const newNote = core.createNewNote();
      reply(newNote); 
    });
  }
  
  send(event: IChannelMessage): boolean {
    throw new Error('Cannot send spontaneous message from app');
  }
  
  on(eventName: string, callback: IChannelCallback): boolean {
    this.ipc.on(eventName, (event: Electron.IpcMainEvent, message) => { 
      console.log(`<< ${message.name}`, { message });
      callback(message, (response: any) => {
        console.log(`>> ${response.name}`, response);
        event.reply(response.name, response);
      });
    });
    return true;
  }

  off(eventName: string): boolean {
    throw new Error("Method not implemented.");
  }

}

export default UIChannel;