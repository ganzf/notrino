import ICore from '../include/ICore';
import IChannel from '../../common/IChannel';

class Core implements ICore {
    uiChannel: IChannel;

    onInit() {

    }

    setUiChannel(channel: IChannel) {
        this.uiChannel = channel;
    }

    onSaveNote(): boolean {
        return false;
    }
}

export default Core;