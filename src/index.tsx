/**
 * Author: Felix Ganz
 * Description: This project was bootstrapped with Create React App.
 *              Under the hood, CRA uses Webpack to build, and Webpack
 *              requires an `src/index.tsx` file.
 *              This file is the entry point of the Rendering context.
 *
 * /!\ If you are using Visual Studio Code, check out this issue:
 * https://stackoverflow.com/questions/64974648/problem-with-visual-studio-code-using-react-jsx-as-jsx-value-with-create-react
 */
import IUI from 'ui/include/IUI';
import UI from 'ui/modules/UI';

import ICoreUI from 'ui/include/ICoreUI';
import CoreUI from 'ui/modules/CoreUI';

const core: ICoreUI = new CoreUI();
core.init().then(() => {
    const ui: IUI = new UI();
    ui.render();
});