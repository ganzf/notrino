import { app, BrowserWindow, ipcMain } from 'electron';
import Core from './modules/Core';
import ICore from './include/ICore';
import * as path from 'path';
import * as url from 'url';

export let win: BrowserWindow;
export const core: ICore = new Core();

// TODO: Comment me before release !!
const ELECTRON_START_URL = 'http://localhost:4001';

app.on('ready', () => {
    const startUrl = ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../../index.html'),
        protocol: 'file:',
        slashes: true,
    });
    core.onInit();
    win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            /* Once compiled, the app is written in common javascript. */
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
        title: 'Notrino',
    });
    win.loadURL(startUrl);
    // TODO: Comment me before release !!
    win.webContents.openDevTools();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});