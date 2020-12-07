//
// Preload.ts
// This file bootstrap the renderer process for the React part of the project.
// This enables us to access node libraries or other "backend" features directly from the renderer.
// However, this is a rather bad practice as it creates high coupling between the frontend and the backend.
// The only REQUIRED data is accessing the ipcRenderer to enable sending events.
//

const { ipcRenderer } = require('electron');
// @ts-ignore
window.ipcRenderer = ipcRenderer;

// @ts-ignore
window.utils = {};

// @ts-ignore
window.utils.path = require('path');