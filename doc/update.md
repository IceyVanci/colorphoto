# 更新日志

## 版本 1.09

### 版本更新
- `package.json` - version: "1.0.9"
- `src/renderer/index.html` - 关于弹窗版本号: "版本 1.09"
- `package.json` - description 更新为 "从JPG/PNG图片中提取主要颜色并可视化显示"

### 新功能

#### PNG 格式支持

**问题描述：** 之前仅支持 JPG/JPEG 格式，无法导入和导出 PNG 文件。

**解决方案：** 修改 5 个文件，全面支持 PNG 格式的导入、显示、颜色提取和导出。

**修改文件清单：**

1. `src/renderer/index.html` - accept 属性添加 `image/png`，提示文字更新为"JPG/PNG图片"
2. `src/main/main.js`:
   - 文件对话框 filters 添加 `'png'`
   - `open-file-dialog` 和 `read-file` 的 mimeType 根据扩展名动态判断
   - `get-exif` PNG 文件直接返回 null（PNG 不支持标准 EXIF）
   - `save-file` filters 添加 `'png'`
3. `src/renderer/js/components/DropZone.js` - `isValidImage` 添加 `image/png`
4. `src/renderer/js/renderer.js`:
   - 全局 drop 事件过滤器添加 `image/png`
   - `handleExport` 根据原始文件类型选择导出格式（PNG→PNG，JPG→JPG），PNG 跳过 EXIF 嵌入
5. `src/renderer/js/imageProcessor.js` - `exportToDataUrl` 添加 `format` 参数支持

**关键设计：**
- PNG 透明通道：颜色提取已跳过透明像素（`a < 128`），无需额外修改
- PNG EXIF：PNG 不支持标准 EXIF，导入时返回 null，导出时跳过嵌入
- 导出格式：根据原始文件类型自动选择（PNG → PNG，JPG → JPG）

---

## 版本 1.08

### 版本更新
- `package.json` - version: "1.0.8"
- `src/renderer/index.html` - 关于弹窗版本号: "版本 1.08"
- `src/renderer/index.html` - 添加致谢信息

### 新功能

#### 多选导入支持
**问题描述：** 通过"导入图片"按钮和拖拽区域均无法选择多个文件。

**解决方案：**

1. `src/renderer/index.html` - 给 `<input type="file">` 添加 `multiple` 属性
2. `src/renderer/js/components/DropZone.js` - `change` 事件处理多个文件，`drop` 事件处理多个文件
3. `src/renderer/js/renderer.js` - `handleDropZoneFileSelect` 支持数组参数，使用队列处理
4. `src/main/main.js` - 文件对话框已配置 `multiSelections`，添加调试日志

```javascript
// DropZone.js - 文件选择事件（支持多文件）
this.fileInput.addEventListener('change', (e) => {
    const validFiles = Array.from(e.target.files).filter(file => this.isValidImage(file));
    if (validFiles.length > 0) {
        this.onFileSelect(validFiles.length === 1 ? validFiles[0] : validFiles);
    }
    this.fileInput.value = '';
});
```

#### UI 标签优化
- 色号 → 色号显示
- 名称 → 名称显示
- 英文 → 英文名称

### 问题修复

#### 问题13：单文件关闭后未恢复初始状态

**问题描述：** 导入单张图片后点击关闭按钮，图片预览未消失，拖拽区域未重新显示。

**原因：** `resetToInitialState()` 调用 `imageProcessor.setImage(null)` 时，`setImage` 方法直接访问 `img.width` 导致 null 错误。

**解决方案：** 在 `imageProcessor.js` 的 `setImage` 方法中添加 null 检查。

**修改文件：** `src/renderer/js/imageProcessor.js`

```javascript
setImage(img) {
    this.originalImage = img;
    if (!img) {
        // img为null时清空画布
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.blockPositions = [];
        this.colors = [];
        return;
    }
    // ... 原有逻辑
}
```

### 性能优化

#### 动态采样步长
**修改文件：** `src/renderer/js/colorExtractor.js`

`getPixelArray` 函数根据图片尺寸动态计算采样步长，小图片保持步长10，大图片适当增大以提高性能。

```javascript
const totalPixels = imageData.width * imageData.height;
const step = Math.max(10, Math.floor(Math.sqrt(totalPixels / 20000)));
```

#### EXIF 数据缓存
**修改文件：** `src/renderer/js/renderer.js`

添加 `exifCache` Map，首次读取 EXIF 后缓存结果，队列切换时直接使用缓存，避免重复读取文件系统。

#### 队列图片预加载
**修改文件：** `src/renderer/js/renderer.js`

添加 `preloadAdjacentImages` 函数，加载当前图片时自动预加载前后各1张图片。

详见 `performance_optimization.md`

---

## 版本 1.07

### 版本更新
- `package.json` - version: "1.0.7"
- `src/renderer/index.html` - 关于弹窗版本号: "版本 1.07"

### 问题修复

#### 问题11：导出的JPG保留了原始图片的EXIF略缩图

**问题描述：** 导出图片时，EXIF中的略缩图仍然是原图，导致Windows资源管理器预览显示的是原图而非编辑后的图。

**解决方案：** 在 `exifHandler.js` 的 `embedExif()` 函数中设置 `exifObj.thumbnail = null`，清除旧略缩图。Windows会重新生成新的略缩图缓存。

**修改文件：** `src/renderer/js/exifHandler.js`

```javascript
// 清除略缩图，避免显示旧图片的预览
exifObj.thumbnail = null;
```

#### 问题12：编辑界面有照片的情况下，无法拖动新的图片导入

**问题描述：** 导入图片后，dropZone被隐藏，拖拽新图片到窗口时无法加载新图片。

**解决方案：** 在 `renderer.js` 中添加全局 drop 事件处理，当拖入JPG文件时调用 `handleDropZoneFileSelect()` 加载新图片。

**修改文件：** `src/renderer/js/renderer.js`

```javascript
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      handleDropZoneFileSelect(file);
    }
  }
});
```

---

## 版本 1.06

### 版本更新
- `package.json` - version: "1.0.6"
- `src/renderer/index.html` - 关于弹窗版本号: "版本 1.06"

### 问题修复
- 问题9：导入新图片时使用旧图片的色块位置
- 问题10：导入新图片时使用旧图片的颜色排序

---

## 首次开启颜色名称时自动设置为英文

### 问题

打开软件后默认不显示颜色名称，用户开启"颜色名称"开关后，语言开关默认为中文，导致显示的颜色名称不是预期的英文。

### 解决方案

在 `renderer.js` 中添加 `firstTimeShowColorName` 标志位，首次开启颜色名称时自动设置为英文。

### 文件: `src/renderer/js/renderer.js`

#### 添加状态标志

```javascript
const appState = {
  // ... 其他状态
  showColorName: false,
  colorNameLanguage: 'en',
  firstTimeShowColorName: true,  // 首次显示颜色名称标志
  // ...
};
```

#### 修改回调逻辑

```javascript
controlPanel.setCallback('onShowColorNameChange', (show) => {
  appState.showColorName = show;
  imageProcessor.setShowColorName(show);
  // 首次开启颜色名称时，自动设置为英文
  if (show && appState.firstTimeShowColorName) {
    appState.firstTimeShowColorName = false;
    appState.colorNameLanguage = 'en';
    imageProcessor.setColorNameLanguage('en');
    // 更新 UI：勾选英文开关
    const langToggle = document.getElementById('colorNameLangSelect');
    if (langToggle) langToggle.checked = true;
  }
  renderImage();
});
```

---

## 修复色块拖动排序问题

### 问题

侧边栏的色块预览框拖动改变颜色顺序后，再次拖动无法改变顺序。

### 解决方案

#### 文件: `src/renderer/js/components/ImagePreview.js`

修改事件处理，使用 `dataset.index` 获取元素位置：

```javascript
block.addEventListener('dragstart', (e) => {
  this.draggedIndex = parseInt(block.dataset.index);
  e.dataTransfer.effectAllowed = 'move';
});

block.addEventListener('drop', (e) => {
  e.preventDefault();
  const targetIndex = parseInt(block.dataset.index);
  if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
    this.swapColors(this.draggedIndex, targetIndex);
  }
  this.draggedIndex = null;
});
```

---

## 修复切换颜色数量逻辑

### 问题

切换色块数量时，固定显示"原始排序"的中间3个颜色，忽略用户手动拖动的顺序。

### 测试步骤

1. 导入一张图片
2. 在侧边栏拖动色块，改变颜色顺序
3. 切换色块数量从5个改为3个

**预期结果：** 显示用户手动排序的5个颜色中的中间3个

**实际结果（错误）：** 固定显示"原始排序"的中间3个颜色（index 1,2,3）

### 解决方案

#### 文件: `src/renderer/js/renderer.js`

```javascript
controlPanel.setCallback('onColorCountChange', (count) => {
  appState.colorCount = count;
  colorExtractor.colorCount = count;
  if (appState.extractedColors.length >= 5) {
    let limitedColors;
    if (count === 3) {
      // 取当前侧边栏5个颜色的中间3个
      limitedColors = [appState.extractedColors[1], appState.extractedColors[2], appState.extractedColors[3]];
    } else {
      limitedColors = appState.extractedColors.slice(0, count);
    }
    appState.extractedColors = limitedColors;
    imageProcessor.setColors(limitedColors);
    controlPanel.setColors(limitedColors);
    renderImage();
  }
});
```

---

## 修复拖动后图片色块位置重置

### 问题

拖动图片上的色块到新位置后，再拖动侧边栏的色块预览改变颜色顺序，图片上的色块位置会被重置。

### 测试步骤

1. 导入一张图片
2. 拖动图片上的色块到新位置
3. 拖动侧边栏的色块预览，改变颜色顺序

**预期结果：** 图片上的色块保持在第2步拖动的新位置

**实际结果（错误）：** 图片上的色块位置被重置回初始位置

### 解决方案

#### 文件: `src/renderer/js/renderer.js`

直接赋值 `imageProcessor.colors` 而非调用 `setColors()`，避免触发位置重置：

```javascript
imagePreview.setOnColorsChange((colors) => {
  appState.extractedColors = colors;
  // 直接更新 colors，不调用 setColors 以避免重置位置
  imageProcessor.colors = colors.slice(0, appState.colorCount);
  // 侧边栏显示全部5个颜色（保持用户拖动后的顺序）
  imagePreview.setColors(colors.slice(0, 5));
  controlPanel.setColors(colors);
  renderImage();
});
```

---

## 代码逻辑问题分析

### 问题1：颜色排序切换 - 无需修复 ✅

按设计，改变排序方式应该重新排序。这是预期行为。

### 问题2：拖动后再次拖动失败 - 已修复 ✅

见上方"修复色块拖动排序问题"章节。

### 问题3：切换颜色数量逻辑 - 已修复 ✅

见上方"修复切换颜色数量逻辑"章节。

### 问题4：ControlPanel.setState - 无需修复 ✅

`setState` 方法用于代码层面设置状态，不存在非UI操作的场景。

### 问题5：拖动后图片色块位置重置 - 已修复 ✅

见上方"修复拖动后图片色块位置重置"章节。

### 问题6：方格模式控制面板只显示4个颜色 - 已修复 ✅

**问题：** 方格模式下，侧边栏颜色预览正确显示5个颜色，但控制面板底部只显示4个颜色。

**解决方案：** 修改 `onDisplayModeChange` 回调，方格模式下也传递5个颜色给控制面板。

#### 文件: `src/renderer/js/renderer.js`

```javascript
if (mode === 'grid') {
  const gridColors = displayColors.slice(0, 4);
  imageProcessor.setColors(gridColors);
  // 侧边栏显示全部5个颜色
  imagePreview.setColors(displayColors.slice(0, 5));
  controlPanel.setColors(displayColors.slice(0, 5));  // 改为5个
}
```

---

### 问题7：模式切换时无法记忆颜色排序 - 已修复 ✅

**问题：** 切换显示模式时，颜色排序会被重置为默认排序，无法保持用户手动调整的顺序。

**预期行为：**
1. 纵向模式调整排序 12453
2. 切换到边缘模式
3. 切换回纵向模式 → 应显示 12453

**解决方案：** 添加 `modeColors` 状态，每个模式独立存储颜色排序。

#### 文件: `src/renderer/js/renderer.js`

**添加状态：**
```javascript
const appState = {
  // ... 其他状态
  // 每个模式独立的颜色排序状态
  modeColors: {
    vertical: [],
    grid: [],
    edge: []
  }
};
```

**修改回调：**
```javascript
controlPanel.setCallback('onDisplayModeChange', (mode) => {
  // 保存当前模式的颜色排序
  appState.modeColors[appState.displayMode] = [...appState.extractedColors];
  
  appState.displayMode = mode;
  imageProcessor.setDisplayMode(mode);
  
  // 如果该模式已有保存的颜色排序，使用它；否则使用默认排序
  const savedColors = appState.modeColors[mode];
  const defaultSortedColors = colorExtractor.sortColors(appState.allExtractedColors, appState.colorSort);
  const displayColors = savedColors.length > 0 ? savedColors : defaultSortedColors;
  
  // ... 使用 displayColors
});
```

---

### 问题8：导出图片EXIF信息丢失 - 已修复 ✅

**问题：** 导出图片时 EXIF 信息丢失。

**原因：** `index.html` 中引用 `node_modules/piexifjs/piexif.js`，但打包时 `node_modules` 不会被包含。

**解决方案：** 将 `piexif.js` 复制到 `src/assets/` 目录，并更新引用路径。

#### 文件: `src/renderer/index.html`

```html
<!-- 改为 -->
<script src="assets/piexif.js"></script>
```

#### 操作步骤

1. 复制文件：`node_modules/piexifjs/piexif.js` → `src/assets/piexif.js`
2. 更新引用路径

---

### 问题9：导入新图片时使用旧图片的色块位置 - 已修复 ✅

**问题：** 用户调整图片A的色块位置后，导入新图片B时，色块位置沿用了图片A保存的位置，导致在新图片上显示位置错误。

**原因：** `setImage()` 调用 `initBlockPositions()` 时，没有重置 `modePositions` 中的 `userHasCustom` 标志，导致 `setColors()` 错误地使用了旧位置。

**解决方案：** 在 `setImage()` 中导入新图片时，重置所有模式的 `userHasCustom` 标志。

#### 文件: `src/renderer/js/imageProcessor.js`

```javascript
setImage(img) {
  this.originalImage = img;
  if (this.canvas) {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    // 导入新图片时重置所有模式的用户自定义位置
    Object.keys(this.modePositions).forEach(mode => {
      this.modePositions[mode].userHasCustom = false;
    });
    this.initBlockPositions();
  }
}
```

---

### 问题10：导入新图片时使用旧图片的颜色排序 - 已修复 ✅

**问题：** 用户在纵向模式下调整颜色排序后，导入新图片，然后切换到其他模式再切回纵向模式，会显示旧图片的排序而非新图片的默认排序。

**原因：** `loadImage()` 函数中没有重置 `appState.modeColors`，导致旧图片的排序被保留。

**解决方案：** 在 `loadImage()` 中导入新图片时，重置 `appState.modeColors`。

#### 文件: `src/renderer/js/renderer.js`

```javascript
appState.extractedColors = displayColors;
// 导入新图片时重置所有模式的颜色排序状态
appState.modeColors = {
  vertical: [],
  grid: [],
  edge: []
};
imageProcessor.setImage(imagePreview.getImage());
```
```
