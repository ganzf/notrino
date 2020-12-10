import IChannelMessage from './IChannelMessage';
import IChannelMessageName from './IChannelMessageName';
import IChannelCallback from './IChannelCallback';

interface IChannel {
    send(event: IChannelMessage): Promise<any>;
    on(eventName: IChannelMessageName, callback: IChannelCallback): boolean;
    off(eventName: IChannelMessageName): boolean;
}

export default IChannel;