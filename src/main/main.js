const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'ColorPhoto',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // 窗口准备就绪后允许拖拽
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 打开文件对话框（支持多文件）
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const files = result.filePaths.map(filePath => {
      const imageBuffer = fs.readFileSync(filePath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg';
      return {
        path: filePath,
        data: `data:${mimeType};base64,${base64}`
      };
    });
    return files;
  }
  return null;
});

// 读取文件（用于拖拽）
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    
    return {
      path: filePath,
      data: `data:${mimeType};base64,${base64}`
    };
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

// 保存文件
ipcMain.handle('save-file', async (event, { data, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || 'colored_image.jpg',
    filters: [
      { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      // 移除data URL前缀
      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(result.filePath, buffer);
      return { success: true, path: result.filePath };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// 获取文件EXIF信息
ipcMain.handle('get-exif', async (event, filePath) => {
  try {
    const piexif = require('piexifjs');
    const imageData = fs.readFileSync(filePath);
    const base64 = imageData.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const exifObj = piexif.load(dataUrl);
    return exifObj;
  } catch (error) {
    console.error('Error getting EXIF:', error);
    return null;
  }
});

// 在默认浏览器打开链接
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external:', error);
    return { success: false, error: error.message };
  }
});
