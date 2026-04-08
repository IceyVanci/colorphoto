const { contextBridge, ipcRenderer } = require('electron');

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 打开文件对话框
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // 读取文件
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // 保存文件
  saveFile: (data, defaultPath) => ipcRenderer.invoke('save-file', { data, defaultPath }),
  
  // 获取EXIF
  getExif: (filePath) => ipcRenderer.invoke('get-exif', filePath)
});
