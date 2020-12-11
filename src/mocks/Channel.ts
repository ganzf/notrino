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


    async send(event: IChannelMessage): Promise<any> {
        if (this.callbacks[event.name]) {
            this.lastMessage = event.name;
            this.lastPayload = event.payload;
            this.messagesSent += 1;
            return this.callbacks[event.name](event);
        }
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