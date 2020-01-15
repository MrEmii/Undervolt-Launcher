const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');

const FileManager = require('./js/FileManager.js');

const windowConfig = new FileManager({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1000, height: 600 },
    windowLocation: { x: 0, y: 0 }
  }
});

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
});

if (require('electron-squirrel-startup')) {
  app.quit();
}


let mainWindow;

var shoulQuit = app.requestSingleInstanceLock();

const createWindow = (w, h, xx, yy) => {

  mainWindow = new BrowserWindow({
    x: xx, y: yy,
    webPreferences: {
      nodeIntegration: true
    },
    width: w, height: h,
    title: "UnderVolt", minWidth: 800, minHeight: 600, fullscreenable: false, fullscreenWindowTitle: false, fullscreen: false,
    titleBarStyle: "hidden", frame: false, transparent: true,
    hasShadow: true, thickFrame: true,
    icon: path.join(__dirname, "logo.png")
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  mainWindow.on('move', () => {
    var x = mainWindow.getPosition()[0];
    var y = mainWindow.getPosition()[1];
    windowConfig.set('windowLocation', { x, y });
  })

  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    windowConfig.set('windowBounds', { width, height });
  });

};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (!shoulQuit) {
  app.quit();
} else {
  app.on('second-instance', (e, comd, workDir) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  })

  app.on('ready', () => {
    let { width, height } = windowConfig.get('windowBounds');
    let { x, y } = windowConfig.get('windowLocation');
    setTimeout(() => { createWindow(width, height, x, y) }, 500);
  })
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
