import IUI from 'ui/include/IUI';
import UI from 'ui/modules/UI';

import IUICore from './include/IUICore';
import UICore from './modules/UICore';

import './css/glob.css';

const core: IUICore = new UICore();
core.init().then(() => {
    // UI is the rendering context of the UI process (React root component)
    const ui: IUI = new UI();
    ui.render();
});

export default core;