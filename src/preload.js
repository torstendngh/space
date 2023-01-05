const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  titlebarControl: (command) => ipcRenderer.send('titlebar', command),
  openFile: () => ipcRenderer.send('openFile'),
  saveFile: (data) => ipcRenderer.send('saveFile', data),
  updateFile: (data) => ipcRenderer.on('updateFile', data),
})
