import IChannel from "./IChannel";
import IChannelMessageName from 'common/IChannelMessageName';

interface IChannelMessage {
    // Identifier
    name: IChannelMessageName;

    // Body of message
    payload: any;

    // Permissions
    allowSendByApp: boolean;
    allowSendByUI: boolean;
}

export default IChannelMessage;