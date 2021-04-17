import IChannelMessage from "./IChannelMessage";

type IChannelCallback = (event: IChannelMessage, reply?: Function) => void;

export default IChannelCallback;