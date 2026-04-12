# 函数动作分析总结

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 设计 | 12 | 按设计预期运行，无需修改 |
| 🔧 已修复 | 7 | 存在逻辑问题，已修复 |

---

## 📋 机制汇总表

### renderer.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `onImport` | ✅ | 点击导入按钮 | 打开系统文件选择器 → 读取图片 | 全局 |
| `onExport` | ✅ | 点击导出按钮 | 导出Canvas为图片 → 嵌入EXIF → 保存 | 全局 |
| `onDisplayModeChange` | 🔧 | 切换显示模式 | 保存当前排序 → 恢复目标模式排序 | 图片、侧边栏 |
| `onEdgePositionChange` | ✅ | 切换边缘位置 | 更新位置状态 → 重绘 | 图片 |
| `onColorCountChange` | 🔧 | 切换色块数量 | 取当前排序的中间3个(3个时) | 图片、侧边栏 |
| `onBlockSizeChange` | ✅ | 调整色块大小 | 保持中心点 → 重新计算 | 图片 |
| `onColorSortChange` | ✅ | 切换排序方式 | 调用sortColors → 重新排序 | 全部显示 |
| `onShowLabelChange` | ✅ | 切换HEX显示 | 更新状态 → 重绘 | 图片 |
| `onShowColorNameChange` | 🔧 | 开启颜色名称 | 首次自动设为英文 → 重绘 | 图片 |
| `onColorNameLangChange` | ✅ | 切换语言 | 更新语言状态 → 重绘 | 图片 |
| `setOnColorsChange` | 🔧 | 侧边栏拖动 | 直接赋值colors → 保持位置 | 图片、侧边栏 |

### ImagePreview.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `loadImage` | ✅ | 导入图片 | 加载到Canvas | Canvas |
| `setColors` | ✅ | 颜色更新 | 更新颜色数组 → 渲染预览 | 侧边栏 |
| `renderColorBlocks` | ✅ | 渲染时 | 创建拖动元素 → 绑定事件 | 侧边栏 |
| `swapColors` | 🔧 | 拖动结束 | 使用dataset.index交换 → 回调 | 全部 |

### imageProcessor.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `setColors` | ✅ | 颜色更新 | 位置保护逻辑 | 图片 |
| `setDisplayMode` | ✅ | 模式切换 | 保存/加载位置 | 图片 |
| `setEdgePosition` | ✅ | 位置切换 | 更新边缘位置 | 图片 |
| `setBlockSize` | ✅ | 大小调整 | 保持中心点 | 图片 |
| `setupDragEvents` | ✅ | 初始化 | 绑定拖动事件 | 图片 |
| `renderBlocks` | ✅ | 渲染时 | 绘制色块和标签 | Canvas |

### ControlPanel.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `setColors` | 🔧 | 颜色更新 | 更新底部预览 | 控制面板 |
| `setCallback` | ✅ | 初始化时 | 注册回调 | 全局 |
| `setState` | ✅ | 代码调用 | 设置控件状态 | 控制面板 |
| `init` | ✅ | 初始化时 | 绑定事件 | 控制面板 |

---

## 📂 renderer.js 详细分析

### 1. `onImport` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第81行 |
| **类型** | 回调函数注册 |
| **触发时机** | 用户点击控制面板的"导入"按钮 |
| **依赖** | `handleImport` 函数 |

**代码：**
```javascript
controlPanel.setCallback('onImport', handleImport);
```

**处理函数 `handleImport`（第212-220行）：**
```javascript
async function handleImport() {
  try {
    const result = await window.electronAPI.openFileDialog();
    if (result) {
      await loadImage(result);
    }
  } catch (error) {
    console.error('Error importing image:', error);
    alert('导入图片失败: ' + error.message);
  }
}
```

**执行流程：**
1. 调用 Electron API `openFileDialog()` 打开系统文件选择器
2. 如果用户选择文件，调用 `loadImage(result)` 加载图片
3. 如果出错，显示错误提示

**副作用：**
- 设置 `appState.originalFilePath`
- 设置 `appState.exifData`
- 调用 `imagePreview.loadImage()`
- 调用 `colorExtractor.extract()`
- 更新 `appState.extractedColors` 和 `appState.allExtractedColors`
- 隐藏 dropZone，显示 imagePreview

---

### 2. `onExport` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第82行 |
| **类型** | 回调函数注册 |
| **触发时机** | 用户点击控制面板的"导出"按钮 |
| **依赖** | `handleExport` 函数 |

**处理函数 `handleExport`（第290-310行）：**
```javascript
async function handleExport() {
  try {
    let exportData = imageProcessor.exportToDataUrl();
    
    if (appState.exifData && typeof piexif !== 'undefined') {
      exportData = exifHandler.embedExif(exportData, appState.exifData);
    }
    
    const originalName = appState.originalFilePath 
      ? appState.originalFilePath.split(/[/\\]/).pop()
      : 'image.jpg';
    const baseName = originalName.replace(/\.[^.]+$/, '');
    const defaultName = baseName + '_colored.jpg';
    
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

**执行流程：**
1. 调用 `imageProcessor.exportToDataUrl()` 获取 Canvas 的图片数据
2. 如果有 EXIF 数据且 piexif 可用，嵌入 EXIF
3. 生成默认文件名（原始名称 + `_colored`）
4. 调用 `saveFile()` 保存文件
5. 显示成功/失败提示

---

### 3. `onDisplayModeChange` - 🔧 已修复（问题7）

| 属性 | 内容 |
|------|------|
| **位置** | 第84-114行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换显示模式（纵向/方格/边缘） |
| **状态依赖** | `appState.modeColors` |

**代码：**
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
  
  // 方格模式始终使用前4个颜色
  if (mode === 'grid') {
    const gridColors = displayColors.slice(0, 4);
    imageProcessor.setColors(gridColors);
    imagePreview.setColors(displayColors.slice(0, 5));
    controlPanel.setColors(displayColors.slice(0, 5));  // ✅ 修复：显示5个
  } else {
    const limitedColors = mode === 'vertical' && appState.colorCount < 5 
      ? displayColors.slice(0, appState.colorCount) 
      : displayColors;
    appState.extractedColors = limitedColors;
    imageProcessor.setColors(limitedColors);
    imagePreview.setColors(displayColors.slice(0, 5));
    controlPanel.setColors(displayColors.slice(0, 5));
  }
  renderImage();
});
```

**修复内容：**
- 添加 `modeColors` 状态，保存每个模式的颜色排序
- 切换模式时恢复该模式之前保存的颜色顺序

---

### 4. `onEdgePositionChange` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第116-120行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换边缘位置（左/右） |

**代码：**
```javascript
controlPanel.setCallback('onEdgePositionChange', (position) => {
  appState.edgePosition = position;
  imageProcessor.setEdgePosition(position);
  renderImage();
});
```

**执行流程：**
1. 更新 `appState.edgePosition`
2. 调用 `imageProcessor.setEdgePosition(position)`
3. 调用 `renderImage()` 重绘

---

### 5. `onColorCountChange` - 🔧 已修复（问题3）

| 属性 | 内容 |
|------|------|
| **位置** | 第122-138行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换色块数量（3/5） |

**代码：**
```javascript
controlPanel.setCallback('onColorCountChange', (count) => {
  appState.colorCount = count;
  colorExtractor.colorCount = count;
  if (appState.extractedColors.length >= 5) {
    let limitedColors;
    if (count === 3) {
      // 取当前侧边栏5个颜色的中间3个
      limitedColors = [
        appState.extractedColors[1],
        appState.extractedColors[2],
        appState.extractedColors[3]
      ];
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

**修复内容：** 切换为3个颜色时，取当前用户排序的中间3个，而非原始排序的中间3个。

---

### 6. `onBlockSizeChange` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第140-144行 |
| **类型** | 回调函数 |
| **触发时机** | 用户调整色块大小滑块 |

**代码：**
```javascript
controlPanel.setCallback('onBlockSizeChange', (size) => {
  appState.blockSize = size;
  imageProcessor.setBlockSize(size);
  renderImage();
});
```

**设计要点：** 调整大小时保持色块中心位置不变，由 `imageProcessor.setBlockSize()` 内部处理。

---

### 7. `onColorSortChange` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第146-156行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换排序方式 |

**代码：**
```javascript
controlPanel.setCallback('onColorSortChange', (sortType) => {
  appState.colorSort = sortType;
  if (appState.extractedColors.length > 0) {
    const sortedColors = colorExtractor.sortColors(appState.extractedColors, sortType);
    appState.extractedColors = sortedColors;
    imageProcessor.setColors(sortedColors);
    imagePreview.setColors(sortedColors);
    controlPanel.setColors(sortedColors);
    renderImage();
  }
});
```

**排序类型：** `brightness`（亮度）、`hue`（色相）、`saturation`（饱和度）、`original`（原始）

---

### 8. `onShowLabelChange` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第158-162行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换HEX标签显示开关 |

**代码：**
```javascript
controlPanel.setCallback('onShowLabelChange', (show) => {
  appState.showLabel = show;
  imageProcessor.setShowLabel(show);
  renderImage();
});
```

---

### 9. `onShowColorNameChange` - 🔧 已修复（问题1）

| 属性 | 内容 |
|------|------|
| **位置** | 第164-177行 |
| **类型** | 回调函数 |
| **触发时机** | 用户开启颜色名称显示 |

**代码：**
```javascript
controlPanel.setCallback('onShowColorNameChange', (show) => {
  appState.showColorName = show;
  imageProcessor.setShowColorName(show);
  // 首次开启颜色名称时，自动设置为英文
  if (show && appState.firstTimeShowColorName) {
    appState.firstTimeShowColorName = false;
    appState.colorNameLanguage = 'en';
    imageProcessor.setColorNameLanguage('en');
    const langToggle = document.getElementById('colorNameLangSelect');
    if (langToggle) langToggle.checked = true;
  }
  renderImage();
});
```

**修复内容：** 首次开启颜色名称时，自动设置为英文并勾选英文开关。

---

### 10. `onColorNameLangChange` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第179-183行 |
| **类型** | 回调函数 |
| **触发时机** | 用户切换颜色名称语言（中/英） |

**代码：**
```javascript
controlPanel.setCallback('onColorNameLangChange', (lang) => {
  appState.colorNameLanguage = lang;
  imageProcessor.setColorNameLanguage(lang);
  renderImage();
});
```

---

### 11. `setOnColorsChange` - 🔧 已修复（问题5）

| 属性 | 内容 |
|------|------|
| **位置** | 第185-193行 |
| **类型** | 回调函数 |
| **触发时机** | 用户拖动侧边栏色块改变顺序 |
| **来源** | ImagePreview 组件 |

**代码：**
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

**修复内容：** 使用直接赋值而非 `setColors()`，避免触发位置重置。

---

## 📂 ImagePreview.js 详细分析

### 1. `loadImage(src)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第26-38行 |
| **返回** | Promise |
| **异步** | 是 |

**代码：**
```javascript
loadImage(src) {
  return new Promise((resolve, reject) => {
    this.image = new Image();
    this.image.onload = () => {
      this.canvas.width = this.image.width;
      this.canvas.height = this.image.height;
      this.ctx.drawImage(this.image, 0, 0);
      resolve();
    };
    this.image.onerror = reject;
    this.image.src = src;
  });
}
```

**执行流程：**
1. 创建新的 Image 对象
2. 设置 onload 回调：设置 Canvas 尺寸并绘制图片
3. 设置 onerror 回调
4. 开始加载图片

---

### 2. `setColors(colors)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第43-46行 |
| **参数** | `colors: Array<{hex, position}>` |

**代码：**
```javascript
setColors(colors) {
  this.colors = colors;
  this.renderColorBlocks();
}
```

---

### 3. `renderColorBlocks()` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第51-95行 |
| **创建元素** | 色块容器 + 每个颜色的色块 |

**代码：**
```javascript
renderColorBlocks() {
  if (!this.colorBlocksContainer) return;
  
  this.colorBlocksContainer.innerHTML = '';
  this.colorBlocksContainer.className = 'color-blocks vertical';
  
  this.colors.forEach((color, index) => {
    const block = document.createElement('div');
    block.className = 'color-block';
    block.draggable = true;
    block.dataset.index = index;  // ✅ 使用 dataset.index
    
    const inner = document.createElement('div');
    inner.className = 'color-block-inner';
    inner.style.backgroundColor = color.hex;
    
    const label = document.createElement('div');
    label.className = 'color-label';
    label.textContent = color.hex;
    
    block.appendChild(inner);
    block.appendChild(label);
    
    // 拖拽事件绑定
    block.addEventListener('dragstart', (e) => {
      this.draggedIndex = parseInt(block.dataset.index);
      e.dataTransfer.effectAllowed = 'move';
    });
    
    block.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    block.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(block.dataset.index);
      if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
        this.swapColors(this.draggedIndex, targetIndex);
      }
      this.draggedIndex = null;  // ✅ 修复
    });
    
    this.colorBlocksContainer.appendChild(block);
  });
}
```

---

### 4. `swapColors(fromIndex, toIndex)` - 🔧 已修复（问题2）

| 属性 | 内容 |
|------|------|
| **位置** | 第100-111行 |
| **触发** | 拖拽结束 |
| **回调** | `this.onColorsChange` |

**代码：**
```javascript
swapColors(fromIndex, toIndex) {
  const temp = this.colors[fromIndex];
  this.colors[fromIndex] = this.colors[toIndex];
  this.colors[toIndex] = temp;
  
  this.colors.forEach((c, i) => c.position = i);
  
  if (this.onColorsChange) {
    this.onColorsChange(this.colors);
  }
  this.renderColorBlocks();
}
```

**修复内容：** 使用 `parseInt(block.dataset.index)` 获取正确的索引。

---

## 📂 imageProcessor.js 详细分析

### 1. `setColors(colors)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第51-81行 |
| **参数** | `colors: Array` |

**代码：**
```javascript
setColors(colors) {
  this.colors = colors;
  const modeData = this.modePositions[this.displayMode];
  
  // 如果用户已自定义位置且颜色数量不变，不重置位置
  if (!modeData.userHasCustom || colors.length !== modeData.positions.length) {
    if (this.displayMode === 'vertical' && modeData.positions.length > 0) {
      // 纵向模式：保持中心X和Y位置不变，重新计算位置
      const centerX = modeData.positions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / modeData.positions.length;
      const centerY = modeData.positions.reduce((sum, p) => sum + p.y + p.height / 2, 0) / modeData.positions.length;
      const totalHeight = colors.length * this.blockSize;
      const newStartY = centerY - totalHeight / 2;
      
      this.blockPositions = [];
      colors.forEach((color, index) => {
        this.blockPositions.push({
          x: centerX - this.blockSize / 2,
          y: newStartY + index * this.blockSize,
          width: this.blockSize,
          height: this.blockSize
        });
      });
      modeData.positions = [...this.blockPositions];
    } else {
      this.initBlockPositions();
    }
  } else {
    // 使用保存的位置
    this.blockPositions = [...modeData.positions];
  }
}
```

**位置保护逻辑：**
- 如果 `userHasCustom` 为 true 且颜色数量不变，使用保存的位置
- 否则重新计算（纵向模式保持中心点，方格/边缘模式重新初始化）

---

### 2. `setDisplayMode(mode)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第83-97行 |
| **参数** | `mode: 'vertical' | 'grid' | 'edge'` |

**代码：**
```javascript
setDisplayMode(mode) {
  // 切换模式前保存当前位置到对应模式
  this.modePositions[this.displayMode].positions = [...this.blockPositions];
  
  this.displayMode = mode;
  
  // 如果新模式已有保存的位置，加载它
  const modeData = this.modePositions[mode];
  if (modeData.positions.length > 0 && modeData.userHasCustom) {
    this.blockPositions = [...modeData.positions];
    this.render();
  } else {
    this.initBlockPositions();
  }
}
```

---

### 3. `setEdgePosition(position)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第99行 |
| **参数** | `position: 'left' | 'right'` |

---

### 4. `setBlockSize(size)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第110行 |
| **参数** | `size: number` |

**设计要点：** 保持中心位置不变，重新计算大小。

---

### 5. `setupDragEvents()` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第299-384行 |
| **拖动模式** | 五个色块整体拖动 |

**关键逻辑：**
- `mousedown`: 检测点击是否在色块范围内，记录初始位置
- `mousemove`: 整体移动所有色块
- `mouseup` / `mouseleave`: 保存拖拽后的位置

---

### 6. `renderBlocks()` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第395行 |

**功能：** 根据当前模式和设置，绘制色块、标签、颜色名称。

---

## 📂 ControlPanel.js 详细分析

### 1. `setColors(colors)` - 🔧 设计

| 属性 | 内容 |
|------|------|
| **功能** | 更新底部颜色预览 |

---

### 2. `setCallback(event, callback)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **功能** | 注册事件回调 |

---

### 3. `setState(state)` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **功能** | 代码层面设置控件状态 |

---

### 4. `init()` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **功能** | 初始化事件绑定 |

---

## 🔧 已修复问题详情

### 问题1：首次开启颜色名称时自动设置为英文

| 项目 | 内容 |
|------|------|
| **文件** | `renderer.js` 第164-177行 |
| **问题** | 开启颜色名称后默认显示中文名称 |
| **修复** | 添加 `firstTimeShowColorName` 标志，首次开启自动设为英文 |

### 问题2：色块拖动后再次拖动失败

| 项目 | 内容 |
|------|------|
| **文件** | `ImagePreview.js` 第74-91行 |
| **问题** | 拖动后 `draggedIndex` 未正确重置 |
| **修复** | 在 `drop` 事件中重置 `draggedIndex` 为 null |

### 问题3：切换颜色数量逻辑

| 项目 | 内容 |
|------|------|
| **文件** | `renderer.js` 第122-138行 |
| **问题** | 切换为3个颜色时固定取原始排序的中间3个 |
| **修复** | 取当前 `extractedColors` 的中间3个 |

### 问题5：拖动后图片色块位置重置

| 项目 | 内容 |
|------|------|
| **文件** | `renderer.js` 第185-193行 |
| **问题** | 调用 `setColors()` 触发位置重置 |
| **修复** | 直接赋值 `imageProcessor.colors` |

### 问题6：方格模式控制面板只显示4个颜色

| 项目 | 内容 |
|------|------|
| **文件** | `renderer.js` 第97-102行 |
| **问题** | `controlPanel.setColors(gridColors)` 只传4个 |
| **修复** | 传递5个颜色 |

### 问题7：模式切换时无法记忆颜色排序

| 项目 | 内容 |
|------|------|
| **文件** | `renderer.js` 第84-114行 |
| **问题** | 切换模式时始终使用默认排序 |
| **修复** | 添加 `modeColors` 状态，保存/恢复每模式排序 |

---

## 📁 问题修复汇总

| 编号 | 问题 | 文件 | 状态 |
|------|------|------|------|
| 1 | 首次开启颜色名称自动英文 | renderer.js | ✅ 已修复 |
| 2 | 色块拖动后再次拖动失败 | ImagePreview.js | ✅ 已修复 |
| 3 | 切换颜色数量逻辑 | renderer.js | ✅ 已修复 |
| 4 | ControlPanel.setState | - | ✅ 设计 |
| 5 | 拖动后位置重置 | renderer.js | ✅ 已修复 |
| 6 | 方格模式显示4个颜色 | renderer.js | ✅ 已修复 |
| 7 | 模式切换不记忆排序 | renderer.js | ✅ 已修复 |

---

## 📈 统计

| 分类 | 数量 |
|------|------|
| 设计（无需修复） | 12 |
| 已修复问题 | 7 |
| **总计分析** | **19** |
