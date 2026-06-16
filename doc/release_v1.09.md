# ColorPhoto v1.09

## 🎉 新功能

### PNG 格式支持
- 支持导入 PNG 文件（点击导入、拖拽导入）
- 支持导出 PNG 文件（根据原始文件类型自动选择格式）
- PNG 透明通道正确处理（透明像素不参与颜色提取）
- PNG 文件不进行 EXIF 处理（PNG 不支持标准 EXIF）

---

## 📋 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/renderer/index.html` | accept 属性添加 image/png、提示文字更新 |
| `src/main/main.js` | 文件对话框 filters、mimeType 动态判断、EXIF 跳过、保存 filters |
| `src/renderer/js/components/DropZone.js` | isValidImage 添加 image/png |
| `src/renderer/js/renderer.js` | drop 过滤器、handleExport 支持 PNG 导出 |
| `src/renderer/js/imageProcessor.js` | exportToDataUrl 支持 format 参数 |

---

## 📦 下载

| 平台 | 文件 |
|------|------|
| Windows x64 | `ColorPhoto.exe` |

---

## 🙏 致谢

感谢 **Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划** 的支持。

---

**Full Changelog**: https://github.com/IceyVanci/colorphoto/commits/v1.09