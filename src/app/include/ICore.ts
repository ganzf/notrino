import IChannel from '../../common/IChannel';

interface ICore {
    onInit(): void;
    setUiChannel(channel: IChannel): void;
    onSaveNote(): boolean;
}

export default ICore;