import IAppEvent from "./IAppEvent";

export type EventCallback = (event: IAppEvent) => void;

interface IAppEventListener {
    onEvent(eventName: string, callback: EventCallback): void;
}

export default IAppEventListener;
