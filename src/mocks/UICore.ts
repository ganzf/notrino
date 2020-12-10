import IChannel from 'common/IChannel';
import IUICore from '../ui/include/IUICore';

class MockUICore implements IUICore {
    setAppChannel(channel: IChannel): void {
        throw new Error('Method not implemented.');
    }

    // Implicitely returning Promise<void>
    async init() {

    }

    // Allow unit tests and mock development with variable behavior.
    async saveNote(content: string): Promise<boolean> {
        if (content === 'shouldFail') {
            return false;
        }
        return true;
    }
}

export default MockUICore;

