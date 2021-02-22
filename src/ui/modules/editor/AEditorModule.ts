export default interface AEditorModule {
    priority: number;
    apply: Function;
    applyStyle?: Function;
}