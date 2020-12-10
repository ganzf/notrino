import IChannel from 'common/IChannel';

interface IUICore {
    // The UI needs asynchronous time for setting itself up.
    init(): Promise<void>;

    // The UI can send a note as string and asynchronously return if the note was saved by the App
    saveNote(content: string): Promise<boolean>;

    // setAppChannel
    setAppChannel(channel: IChannel): void;
}

export default IUICore;