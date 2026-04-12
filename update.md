# 更新日志

## 版本 1.05

### 版本更新
- `package.json` - version: "1.0.5"
- `src/renderer/index.html` - 关于弹窗版本号: "版本 1.05"

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

1. 复制文件：`node_modules/piexifjs/piexif.js` → `src/assets/piexxif.js`
2. 更新引用路径
```
