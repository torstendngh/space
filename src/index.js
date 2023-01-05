const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require("fs");

let currentFile;
let currentFilePath;
let currentFileName = "temp.json";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  globalShortcut.register('f5', () => {
		mainWindow.reload();
	});

  globalShortcut.register('f6', () => {
		mainWindow.webContents.openDevTools();
	});

  ipcMain.on('saveFile', (event, data) => {
    fs.writeFile(currentFilePath, data, (err) => {
      if (err) {
        console.log(err);
        dialog.showMessageBox(
        mainWindow,
        { message: "Bruh", type: "warning", title: "Error" }
      );
      }
      dialog.showMessageBox(
        mainWindow,
        { message: "Notes saved.", type: "info", title: "Saved" } // Saved notification
      );
    });
  });

  ipcMain.on('openFile', (event, args) => {
    dialog.showOpenDialog(
      mainWindow,
      {
        title: 'Open Space file',
        filters: [
          { name: "JSON", extensions: ["json"] }
        ]
      }
    ).then((result) => {
      if (!result.canceled) {
        currentFileName = result.filePaths[0].toString().split(/(\\|\/)/g).pop();
        currentFilePath = result.filePaths[0].toString();
      }
      fs.readFile(result.filePaths[0], "utf-8", (err, jsonString) => {
        if (err) {
          console.log(err); //TODO Handle file error
        } else {
          currentFile = JSON.parse(jsonString);
          mainWindow.webContents.send("updateFile", currentFile); // Send filepath to preload.js
        }
      });
    });
  });

  ipcMain.on('titlebar', (event, command) => {
    switch (command) {
      case "minimize":
        mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
        break;
      case "maximize":
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
        break;
      case "close":
        mainWindow.close();
        break;
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
