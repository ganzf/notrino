import IAppEvent from 'ui/include/IAppEvent';
import IAppEventListener, { EventCallback } from 'ui/include/IAppEventListener';

class AppEventListener implements IAppEventListener {
    private callbacks: Map<string, EventCallback> = new Map();

    onEvent(eventName: string, callback: EventCallback): void {
        this.callbacks.set(eventName, callback);
        // add electron listener
    }
}

export default AppEventListener;