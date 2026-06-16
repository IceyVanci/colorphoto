# Implementation Plan

[Overview]
完成两项任务：1. 更新 update.md 到 1.08 版本；2. 编写当前项目增加 PNG 支持的详细方案。

update.md 需要添加 v1.08 版本的所有变更记录，包括多选导入、关闭按钮修复、UI优化和性能优化。

PNG 支持方案需要分析当前项目中所有限制为 JPG 的代码位置，评估 PNG 特性（透明通道、无 EXIF）对现有功能的影响，并提供详细的修改方案。

[Types]
无需类型定义变更。

[Files]
**任务1：更新 update.md**

1. **`update.md`** - 在文件开头插入 v1.08 版本更新日志

**任务2：PNG 支持方案（需修改的文件）**

1. **`src/renderer/index.html`**
   - 第26行：提示文字从"JPG图片"改为"JPG/PNG图片"
   - 第27行：`accept="image/jpeg"` → `accept="image/jpeg,image/png"`

2. **`src/main/main.js`**
   - 第52行：文件对话框 filters 添加 `'png'`
   - 第59行：mimeType 需根据文件扩展名动态判断
   - 第95行：保存对话框 filters 添加 `'png'`
   - 导出时需根据原始文件类型决定输出格式

3. **`src/renderer/js/components/DropZone.js`**
   - 第70行：`isValidImage` 添加 `image/png` 类型

4. **`src/renderer/js/renderer.js`**
   - 第391行：drop 事件过滤器添加 `image/png`
   - `handleExport` 函数需支持 PNG 导出

5. **`src/renderer/js/imageProcessor.js`**
   - `exportToDataUrl` 需支持 PNG 格式输出

6. **`src/renderer/js/exifHandler.js`**
   - PNG 无标准 EXIF，需跳过 EXIF 处理

[Functions]
**PNG 支持涉及的函数：**

1. **`open-file-dialog`** - `src/main/main.js:48`
   - 修改：filters 添加 png 支持
   - 修改：mimeType 根据文件扩展名动态判断

2. **`save-file`** - `src/main/main.js:89`
   - 修改：保存 filters 添加 png
   - 修改：默认文件名根据原始类型生成

3. **`isValidImage(file)`** - `src/renderer/js/components/DropZone.js:69`
   - 修改：添加 image/png 类型

4. **`exportToDataUrl()`** - `src/renderer/js/imageProcessor.js:695`
   - 修改：支持传入格式参数（jpeg/png）

5. **`handleExport()`** - `src/renderer/js/renderer.js`
   - 修改：根据原始文件类型选择导出格式
   - PNG 文件不嵌入 EXIF

6. **`embedExif(dataUrl, exifObj)`** - `src/renderer/js/exifHandler.js:39`
   - 修改：检测是否为 PNG，若是则跳过 EXIF 嵌入

[Classes]
无需新增或修改类。

[Dependencies]
无需新增依赖。piexifjs 仅用于 JPEG，PNG 不需要 EXIF 处理。

[Testing]
**测试方案：**

1. **PNG 导入测试**
   - 点击导入按钮选择 PNG 文件
   - 拖拽 PNG 文件到拖拽区域
   - 混合拖拽 JPG 和 PNG 文件

2. **PNG 显示测试**
   - 验证透明背景的 PNG 正确显示
   - 验证颜色提取功能正常

3. **PNG 导出测试**
   - 导入 PNG 后导出，验证格式正确
   - 验证导出文件名后缀正确

4. **EXIF 兼容性测试**
   - PNG 文件不出现 EXIF 相关错误
   - JPG 文件 EXIF 功能不受影响

[Implementation Order]
1. 更新 update.md 到 1.08 版本
2. 创建 PNG 支持方案文档 png_support_plan.md