import { NewNoteInfo } from 'app/include/events/Notes';
import IChannel from 'common/IChannel';
import IStore from 'ui/include/IStore';
import IUICore from '../ui/include/IUICore';
import MockChannel from './Channel';

// @ts-ignore
class MockUICore implements IUICore {
    channel: IChannel = new MockChannel();

    setStore(store: IStore): void {
        throw new Error('Method not implemented.');
    }

    setAppChannel(channel: IChannel): void {
        throw new Error('Method not implemented.');
    }

    // Implicitely returning Promise<void>
    async init() {
        
    }

    createNewNote(): boolean {
        return true;
    }
}

export default MockUICore;

