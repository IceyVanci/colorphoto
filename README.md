# ColorPhoto - 图片颜色提取工具

一个基于 Electron 的图片颜色提取工具，可从 JPG 图片中提取主要颜色并以多种方式可视化显示。

## 功能特性

- **颜色提取**：从 JPG 图片中智能提取主要颜色
- **多种显示模式**：
  - 纵向色块：色块在图片左侧纵向排列
  - 边缘色块：色块环绕图片四边
  - 方格色块：2x2 网格布局
- **颜色名称显示**：支持中英文颜色名称
- **色块拖拽**：支持拖动色块到任意位置，调整参数后保持位置
- **EXIF 信息**：支持读取图片的 EXIF 元数据
- **导出功能**：将处理后的图片导出为 JPEG 格式
- **拖拽支持**：支持直接拖拽 JPG 文件到窗口

## 技术栈

- **框架**：Electron 28.3.3
- **语言**：JavaScript (ES6+)
- **字体**：MiSans (小米字体) - Medium 字重
- **依赖**：
  - piexifjs - EXIF 信息读取

## 字体说明

本项目使用 **MiSans** 字体

## X11 颜色列表

本工具使用完整的 X11/CSS 颜色系统
## 项目结构

```
colorphoto/
├── src/
│   ├── assets/
│   │   └── MiSans-Medium.ttf    # 字体文件
│   ├── main/
│   │   └── main.js              # Electron 主进程
│   ├── preload/
│   │   └── preload.js            # 预加载脚本
│   └── renderer/
│       ├── index.html            # 主页面
│       ├── index.css             # 样式表
│       └── js/
│           ├── renderer.js       # 渲染器入口
│           ├── colorExtractor.js # 颜色提取算法
│           ├── imageProcessor.js # 图片处理与渲染
│           ├── exifHandler.js   # EXIF 信息处理
│           ├── x11Colors.js     # X11 颜色数据库
│           └── components/
│               ├── DropZone.js   # 拖拽区域组件
│               ├── ImagePreview.js # 图片预览组件
│               └── ControlPanel.js # 控制面板组件
├── package.json
├── electron-builder.json
└── dist/                         # 编译输出目录
```

## 安装与运行

### 开发模式
```bash
npm install
npm run dev
```

### 构建发布
```bash
npm run build
```

编译后的可执行文件位于 `dist/ColorPhoto.exe`。

## 使用说明

1. **导入图片**：点击"导入图片"按钮或直接拖拽 JPG 文件到窗口
2. **选择显示模式**：纵向、边缘或方格色块
3. **调整设置**：
   - 色块大小：50-2000px 可调
   - 色块数量：3个或5个
   - 颜色排序：按亮度、色相、饱和度等
   - 色号显示：显示/隐藏十六进制颜色值
   - 颜色名称：显示/隐藏颜色名称（中英文）
4. **导出图片**：点击"导出图片"保存处理结果

## 许可证

MIT License
