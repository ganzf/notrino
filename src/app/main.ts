import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import Core from './modules/Core';
import ICore from './include/ICore';
import * as path from 'path';
import * as url from 'url';
import { Cipher } from 'crypto';

export let win: BrowserWindow;
export const core: ICore = new Core();

const isDev = true;
const ELECTRON_START_URL = isDev ? 'http://localhost:4001' : undefined;

function openWindow(): boolean {
    if (core.isWindowActive()) {
        return false;
    }

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
    core.setWindowStatus('active');
}

app.on('ready', () => {
    openWindow();

    const ret = globalShortcut.register('Command+Control+N+O', () => {
        core.onQuickThought();
        win.show();
    })

    if (!ret) {
        console.log('registration failed')
    }
});

app.on('activate', function () {
    openWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    } else {
        core.setWindowStatus('waiting-activation');
    }
});

app.on('will-quit', () => { 
    globalShortcut.unregisterAll()
});