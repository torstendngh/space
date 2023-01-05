const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  titlebarControl: (command) => ipcRenderer.send('titlebar', command),
  openFile: () => ipcRenderer.send('openFile'),
  updateFile: (data) => ipcRenderer.on('updateFile', data),
})
