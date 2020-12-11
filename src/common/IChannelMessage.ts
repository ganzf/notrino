import IChannel from "./IChannel";
import IChannelMessageName from './IChannelMessageName';
import IChannelMessagePayload from './IChannelMessagePayload';

interface IChannelMessage {
    // Identifier
    name: IChannelMessageName;

    // Body of message
    payload: IChannelMessagePayload;

    // Permissions
    allowSendByApp: boolean;
    allowSendByUI: boolean;
}

export default IChannelMessage;