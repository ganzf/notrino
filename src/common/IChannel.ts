import IChannelMessage from './IChannelMessage';
import IChannelMessageName from './IChannelMessageName';
import IChannelCallback from './IChannelCallback';

interface IChannel {
    // A channel sends asynchronous messages and returns if the message has been sent or not
    send(event: IChannelMessage): boolean;

    // Place a response callback
    on(eventName: IChannelMessageName, callback: IChannelCallback): boolean;

    // Deactivate a response callback
    off(eventName: IChannelMessageName): boolean;
}

export default IChannel;