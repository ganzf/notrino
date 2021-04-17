import IChannel from 'common/IChannel';
import IChannelMessage from 'common/IChannelMessage';
import IChannelCallback from 'common/IChannelCallback';
import IChannelMessageName from 'common/IChannelMessageName';
import IChannelMessagePayload from 'common/IChannelMessagePayload';

class MockChannel implements IChannel {
    callbacks: { [key: string]: IChannelCallback } = {};
    lastMessage?: IChannelMessageName;
    lastPayload?: IChannelMessagePayload;
    messagesSent: number = 0;


    send(event: IChannelMessage): boolean {
        if (!event.allowSendByUI) {
            return false;
        }
        if (this.callbacks[event.name]) {
            this.lastMessage = event.name;
            this.lastPayload = event.payload;
            this.messagesSent += 1;
            this.callbacks[event.name](event);
            return true;
        }
        return true;
    }

    on(eventName: IChannelMessageName, callback: IChannelCallback): boolean {
        this.callbacks[eventName] = callback;
        return true;
    }

    off(eventName: IChannelMessageName): boolean {
        throw new Error('Method not implemented.');
    }
}

export default MockChannel;