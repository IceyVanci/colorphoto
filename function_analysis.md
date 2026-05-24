# ColorPhoto 函数动作分析总结

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 设计/使用中 | 50+ | 按设计预期运行，无需修改 |
| 🔧 已修复 | 12 | 存在逻辑问题，已修复 |
| ⚠️ 已完成 | 1 | 队列功能已完成 |

---

## 📁 项目文件结构

```
colorphoto/
├── src/
│   ├── main/
│   │   └── main.js              # Electron 主进程
│   ├── preload/
│   │   └── preload.js           # 安全桥接
│   └── renderer/
│       ├── index.html           # 主页面
│       ├── index.css            # 全局样式
│       ├── js/
│       │   ├── renderer.js          # 主逻辑入口
│       │   ├── colorExtractor.js    # 颜色提取算法 (K-Means)
│       │   ├── exifHandler.js       # EXIF 读写处理
│       │   ├── imageProcessor.js    # 图片处理与渲染
│       │   ├── x11Colors.js         # X11 颜色数据库
│       │   └── components/
│       │       ├── DropZone.js       # 拖拽区域组件
│       │       ├── ImagePreview.js   # 图片预览组件
│       │       └── ControlPanel.js  # 控制面板组件
│       └── assets/
│           ├── piexif.js            # EXIF 处理库
│           └── MiSans-Medium.ttf     # 字体文件
├── package.json                     # 项目配置
└── electron-builder.json           # 构建配置
```

---

## 📋 模块职责表

### 核心处理模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **主入口** | `renderer.js` | 应用初始化、状态管理、事件协调 | 全局状态 appState |
| **颜色提取** | `colorExtractor.js` | K-Means 聚类算法提取主色 | 支持亮度/色相/饱和度排序 |
| **图片处理** | `imageProcessor.js` | Canvas 渲染、色块定位、拖动 | 三种显示模式 |
| **EXIF处理** | `exifHandler.js` | EXIF 读取与嵌入 | 使用 piexifjs |

### 组件模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **拖拽区域** | `DropZone.js` | 文件拖入、点击导入 | 验证 JPG 类型 |
| **图片预览** | `ImagePreview.js` | 侧边栏颜色预览、拖动排序 | 使用 HTML5 Drag API |
| **控制面板** | `ControlPanel.js` | UI 控件绑定、状态同步 | 回调驱动 |

### 工具模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **颜色名称** | `x11Colors.js` | HEX 转颜色名称 | 支持中英文 |

---

## 📋 机制汇总表

### renderer.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `initComponents` | ✅ | DOMContentLoaded | 初始化所有组件实例 | 全局 |
| `handleDropZoneFileSelect` | ✅ | 点击/拖入文件 | FileReader → loadImage | 全局 |
| `setupCallbacks` | ✅ | 初始化 | 绑定控制面板回调 | 全局 |
| `reExtractColors` | ✅ | 预留 | 从 Canvas 重新提取颜色 | 颜色 |
| `handleImport` | ✅ | 点击导入按钮 | IPC 打开文件对话框 | 全局 |
| `loadImage` | 🔧 | 文件选择完成 | 加载图片、提取颜色、重置状态 | 图片、颜色、UI |
| `renderImage` | ✅ | 任意参数变化 | 同步状态到 imageProcessor | 图片 |
| `handleExport` | 🔧 | 点击导出按钮 | Canvas 导出 → 嵌入 EXIF | 文件系统 |

### colorExtractor.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `extract(imageData)` | ✅ | 从 ImageData 提取主色 |
| `getPixelArray(imageData)` | ✅ | 获取像素数组 |
| `kMeansClustering(pixels, k, maxIterations)` | ✅ | K-Means 聚类 |
| `initializeCentroids(pixels, k)` | ✅ | K-Means++ 初始化 |
| `colorDistance(c1, c2)` | ✅ | 欧几里得距离 |
| `calculateCentroid(pixels)` | ✅ | 计算簇中心 |
| `formatColors(centroids)` | ✅ | 格式化颜色数组 |
| `rgbToHex(r, g, b)` | ✅ | RGB 转 HEX |
| `getBrightness(rgb)` | ✅ | 计算亮度 |
| `getHue(rgb)` | ✅ | 计算色相 |
| `getSaturation(rgb)` | ✅ | 计算饱和度 |
| `sortColors(colors, sortType)` | ✅ | 按类型排序 |

### exifHandler.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 说明 |
|--------|------|----------|----------|------|
| `extractFromDataUrl(dataUrl)` | ✅ | loadImage | piexif.load() | 读取 EXIF |
| `embedExif(dataUrl, exifObj)` | 🔧 | handleExport | 清除略缩图后 piexif.insert() | 嵌入 EXIF |
| `removeExif(dataUrl)` | ✅ | 预留 | piexif.remove() | 清除 EXIF |
| `getExifData` | ✅ | - | 返回 exifData | Getter |
| `setExifData(exifObj)` | ✅ | - | 设置 exifData | Setter |

### imageProcessor.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `initCanvas(canvas)` | ✅ | 初始化 | 获取 Canvas 上下文 | Canvas |
| `setImage(img)` | 🔧 | loadImage | 重置位置状态、加载图片 | Canvas |
| `setColors(colors)` | 🔧 | 颜色更新 | 位置保护逻辑 | 色块 |
| `setDisplayMode(mode)` | 🔧 | 模式切换 | 保存/加载位置 | 色块 |
| `setEdgePosition(position)` | ✅ | 位置切换 | 更新边缘位置 | 色块 |
| `setBlockSize(newSize)` | ✅ | 大小调整 | 保持中心点 | 色块 |
| `setShowLabel(show)` | ✅ | 标签切换 | 更新标签显示 | 标签 |
| `setShowColorName(show)` | ✅ | 名称切换 | 更新颜色名称 | 名称 |
| `setColorNameLanguage(lang)` | ✅ | 语言切换 | 中/英文切换 | 名称 |
| `initBlockPositions()` | ✅ | 初始化/重置 | 初始化各模式位置 | 位置 |
| `setupDragEvents()` | ✅ | 初始化 | 绑定拖动事件 | 交互 |
| `render()` | ✅ | 渲染时 | 调用 renderBlocks | Canvas |
| `renderBlocks()` | ✅ | render() | 绘制色块和标签 | Canvas |
| `exportToDataUrl()` | ✅ | 导出时 | Canvas → DataURL | 导出 |

### DropZone.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 说明 |
|--------|------|----------|----------|------|
| `init()` | ✅ | 构造 | 绑定点击、拖拽事件 | 初始化 |
| `isValidImage(file)` | ✅ | 文件选择 | 验证 image/jpeg | 校验 |
| `show()` | ✅ | - | 显示 dropZone | UI |
| `hide()` | ✅ | - | 隐藏 dropZone | UI |

### ImagePreview.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `loadImage(src)` | ✅ | loadImage | 加载到 Canvas | Canvas |
| `setColors(colors)` | ✅ | 颜色更新 | 更新颜色数组 → 渲染 | 侧边栏 |
| `renderColorBlocks()` | ✅ | setColors | 创建拖动元素 → 绑定事件 | 侧边栏 |
| `swapColors(fromIndex, toIndex)` | 🔧 | 拖动结束 | dataset.index 交换 → 回调 | 全部 |
| `setOnColorsChange(callback)` | 🔧 | 初始化 | 侧边栏拖动 → 回调 | 全部 |
| `show()` | ✅ | - | 显示预览区 | UI |
| `hide()` | ✅ | - | 隐藏预览区 | UI |
| `getCanvas()` | ✅ | - | 返回 Canvas 元素 | - |
| `getImage()` | ✅ | - | 返回图片元素 | - |

### ControlPanel.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `init()` | ✅ | 初始化 | 绑定 UI 控件事件 | UI |
| `updateEdgePositionVisibility()` | ✅ | 模式切换 | 显示/隐藏边缘位置 | UI |
| `setColors(colors)` | ✅ | 颜色更新 | 渲染颜色列表 | 侧边栏 |
| `renderColorList()` | ✅ | setColors | 创建颜色项 | UI |
| `setExportEnabled(enabled)` | ✅ | loadImage/导出 | 启用/禁用导出按钮 | UI |
| `setCallback(name, callback)` | ✅ | setupCallbacks | 注册回调 | 事件 |
| `getState()` | ✅ | - | 返回控件状态 | 状态 |
| `setState(newState)` | ✅ | - | 设置控件状态 | UI |

### x11Colors.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `hexToRgb(hex)` | ✅ | HEX 转 RGB |
| `colorDistance(r1, g1, b1, r2, g2, b2)` | ✅ | 颜色距离计算 |
| `findClosestColor(hex)` | ✅ | 查找最接近的 X11 颜色 |
| `getColorName(hex, language)` | ✅ | 获取颜色名称（中/英） |

---

## 🔧 问题修复历史

| 编号 | 问题 | 状态 | 版本 |
|------|------|------|------|
| 1 | 首次开启颜色名称自动英文 | ✅ | 1.05 |
| 2 | 色块拖动后再次拖动失败 | ✅ | 1.05 |
| 3 | 切换颜色数量逻辑 | ✅ | 1.05 |
| 4 | ControlPanel.setState | ✅ 设计 | 1.05 |
| 5 | 拖动后位置重置 | ✅ | 1.05 |
| 6 | 方格模式显示4个颜色 | ✅ | 1.05 |
| 7 | 模式切换不记忆排序 | ✅ | 1.05 |
| 8 | 导出图片EXIF信息丢失 | ✅ | 1.05 |
| 9 | 导入新图片时使用旧位置 | ✅ | 1.06 |
| 10 | 导入新图片时使用旧排序 | ✅ | 1.06 |
| 11 | 导出JPG保留原图略缩图 | ✅ | 1.07 |
| 12 | 无法拖入新图片 | ✅ | 1.07 |

---

## 📝 已实现功能

### 队列功能 (V3)

| 功能 | 说明 | 状态 |
|------|------|------|
| 关闭按钮 | 侧边栏底部，始终显示，点击关闭当前/返回初始 | ✅ |
| 底部队列面板 | 仅画布区域下方显示，不影响侧边栏 | ✅ |
| 队列管理 | 多图片拖入自动加入队列 | ✅ |
| 队列切换 | 点击缩略图切换，自动切换下一张 | ✅ |

---

## 📝 备注

### 显示模式
- **纵向色块 (vertical)**：色块在图片左侧纵向排列
- **边缘色块 (edge)**：色块环绕图片四边
- **方格色块 (grid)**：2x2 网格布局

### 颜色排序
- **按亮度**：亮度从高到低/低到高
- **按色相**：HSL 色相排序
- **按饱和度**：饱和度排序
- **按提取顺序**：K-Means 聚类顺序

### 状态管理
全局状态 `appState` 包含：
- 图片状态：`originalImage`, `processedImage`
- 显示设置：`displayMode`, `edgePosition`, `blockSize`
- 颜色状态：`extractedColors`, `allExtractedColors`, `modeColors`
- UI 设置：`showLabel`, `showColorName`, `colorNameLanguage`