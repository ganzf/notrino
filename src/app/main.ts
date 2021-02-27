import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow;

process.env.ELECTRON_START_URL = 'http://localhost:4001';

app.on('ready', () => {
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true,
    });
    
    win = new BrowserWindow({
        width: 1600 * 0.9,
        height: 900 * 0.9,
        webPreferences: {
            /* Once compiled, the app is written in common javascript. */
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
        title: 'Notrino',
    });
    win.loadURL(startUrl);
    win.webContents.openDevTools();
    console.log('Hello World from app', { startUrl, env: process.env.ELECTRON_START_URL });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});