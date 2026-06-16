# ColorPhoto PNG 支持方案

## 1. 概述

当前 ColorPhoto 仅支持 JPG/JPEG 格式。本方案描述如何增加 PNG 格式支持，包括导入、显示、颜色提取和导出。

### PNG 与 JPG 的关键差异

| 特性 | JPG | PNG |
|------|-----|-----|
| 透明通道 | ❌ 无 | ✅ 支持 Alpha 通道 |
| EXIF 数据 | ✅ 支持 | ❌ 不支持标准 EXIF |
| 无损压缩 | ❌ 有损 | ✅ 无损 |
| 文件大小 | 较小 | 较大 |

---

## 2. 需要修改的文件

### 2.1 `src/renderer/index.html`

**修改位置：** 第26-27行

```html
<!-- 原始代码 -->
<p>点击图标或拖拽JPG图片到这里</p>
<input type="file" id="fileInput" accept="image/jpeg" multiple style="display: none;">

<!-- 修改为 -->
<p>点击图标或拖拽JPG/PNG图片到这里</p>
<input type="file" id="fileInput" accept="image/jpeg,image/png" multiple style="display: none;">
```

---

### 2.2 `src/main/main.js`

#### 2.2.1 文件对话框过滤器（第52行）

```javascript
// 原始代码
filters: [
    { name: 'Images', extensions: ['jpg', 'jpeg'] }
]

// 修改为
filters: [
    { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
]
```

#### 2.2.2 open-file-dialog 处理器的 mimeType 判断（第67行）

文件对话框返回文件时，需要根据扩展名动态判断 mimeType：

```javascript
// 原始代码（第67行）
const mimeType = 'image/jpeg';

// 修改为
const ext = path.extname(filePath).toLowerCase();
const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
```

#### 2.2.3 read-file 处理器的 mimeType 判断（第78行）

**⚠️ 重要：** `read-file` 处理器用于拖拽导入，同样需要修改 mimeType 判断：

```javascript
// 原始代码（第78行）
const mimeType = 'image/jpeg';

// 修改为
const ext = path.extname(filePath).toLowerCase();
const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
```

#### 2.2.4 保存对话框过滤器（第95行）

只需修改 filters 数组，添加 png 支持：

```javascript
// 原始代码
filters: [
    { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }
]

// 修改为
filters: [
    { name: 'Image', extensions: ['jpg', 'jpeg', 'png'] }
]
```

注意：`save-file` 处理器的保存逻辑 `data.replace(/^data:image\/\w+;base64,/, '')` 已能正确处理 PNG 和 JPEG（`\w+` 匹配 `jpeg` 和 `png`），无需修改核心保存逻辑。

#### 2.2.5 EXIF 读取（第125行）

PNG 不支持标准 EXIF，需要跳过：

```javascript
ipcMain.handle('get-exif', async (event, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') {
        return null; // PNG 无 EXIF
    }
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
```

---

### 2.3 `src/renderer/js/components/DropZone.js`

#### 2.3.1 文件类型验证（第69-72行）

```javascript
// 原始代码
isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type);
}

// 修改为
isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
}
```

---

### 2.4 `src/renderer/js/renderer.js`

#### 2.4.1 全局 drop 事件过滤器（第391行）

```javascript
// 原始代码
const files = Array.from(e.dataTransfer.files).filter(f => 
    f.type === 'image/jpeg' || f.type === 'image/jpg'
);

// 修改为
const files = Array.from(e.dataTransfer.files).filter(f => 
    f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
);
```

#### 2.4.2 handleExport 函数（第310行）

需要根据原始文件类型选择导出格式，并跳过 PNG 的 EXIF 嵌入：

```javascript
async function handleExport() {
    try {
        const isPng = appState.originalFilePath && 
            appState.originalFilePath.toLowerCase().endsWith('.png');
        
        // PNG 使用无损导出，JPEG 使用 95% 质量
        let exportData = imageProcessor.exportToDataUrl(isPng ? 'image/png' : 'image/jpeg');
        
        // 仅 JPEG 嵌入 EXIF
        if (!isPng && appState.exifData && typeof piexif !== 'undefined') {
            exportData = exifHandler.embedExif(exportData, appState.exifData);
        }
        
        const originalName = appState.originalFilePath 
            ? appState.originalFilePath.split(/[/\\]/).pop()
            : 'image.jpg';
        const baseName = originalName.replace(/\.[^.]+$/, '');
        const ext = isPng ? '.png' : '.jpg';
        const defaultName = baseName + '_colored' + ext;
        
        const result = await window.electronAPI.saveFile(exportData, defaultName);
        
        if (result.success) {
            alert('图片导出成功！\n保存位置: ' + result.path);
        } else if (!result.canceled) {
            alert('导出失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('Error exporting image:', error);
        alert('导出图片失败: ' + error.message);
    }
}
```

---

### 2.5 `src/renderer/js/imageProcessor.js`

#### 2.5.1 exportToDataUrl 方法（第695行）

```javascript
// 原始代码
exportToDataUrl() {
    if (!this.canvas) return null;
    return this.canvas.toDataURL('image/jpeg', 0.95);
}

// 修改为
exportToDataUrl(format = 'image/jpeg') {
    if (!this.canvas) return null;
    if (format === 'image/png') {
        return this.canvas.toDataURL('image/png');
    }
    return this.canvas.toDataURL('image/jpeg', 0.95);
}
```

---

### 2.6 `src/renderer/js/exifHandler.js`

无需修改。`embedExif` 已有错误处理，跳过非 JPEG 数据。但建议在 `handleExport` 中直接判断，避免不必要的 piexif 调用。

---

## 3. 透明通道处理

PNG 支持透明通道（Alpha）。当前颜色提取算法 `colorExtractor.js` 的 `getPixelArray` 已跳过透明像素（`a < 128`），无需修改。

Canvas 渲染时透明区域显示为画布背景色（默认黑色），这是预期行为。

---

## 4. 文件修改清单

| 文件 | 修改内容 | 风险 |
|------|----------|------|
| `src/renderer/index.html` | accept 属性、提示文字 | 低 |
| `src/main/main.js` | filters、mimeType 判断、EXIF 跳过 | 中 |
| `src/renderer/js/components/DropZone.js` | isValidImage 类型 | 低 |
| `src/renderer/js/renderer.js` | drop 过滤器、导出格式 | 中 |
| `src/renderer/js/imageProcessor.js` | exportToDataUrl 格式参数 | 低 |
| `src/renderer/js/exifHandler.js` | 无需修改 | 无 |

---

## 5. 注意事项

1. **EXIF 兼容性**：PNG 不支持标准 EXIF，导入 PNG 时 `getExif` 返回 null，导出时跳过 EXIF 嵌入
2. **透明通道**：颜色提取已正确处理透明像素，无需额外修改
3. **导出格式**：根据原始文件类型自动选择导出格式（PNG → PNG，JPG → JPG）
4. **文件大小**：PNG 文件通常比 JPG 大，队列加载可能较慢，但已有性能优化（缓存、预加载）
5. **向后兼容**：所有修改不影响现有 JPG 功能