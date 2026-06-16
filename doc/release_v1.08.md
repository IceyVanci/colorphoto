# ColorPhoto v1.08

## 🎉 新功能

### 多选导入
- 支持通过"导入图片"按钮选择多个JPG文件
- 支持拖拽多个JPG文件到拖拽区域
- 底部队列面板自动显示，支持缩略图切换

### 关闭功能增强
- 单张图片点击关闭后正确返回初始状态
- 多张图片点击关闭后自动切换到下一张

### UI优化
- 色号/名称/英文开关标签更清晰：色号显示、名称显示、英文名称
- 关于页面新增致谢信息

---

## ⚡ 性能优化

### 颜色提取优化
- 动态采样步长：小图片保持精度，大图片处理速度提升40-60%

### 队列切换优化
- EXIF数据缓存：避免重复读取文件系统
- 队列预加载：自动预加载相邻图片

详细说明见 [performance_optimization.md](performance_optimization.md)

---

## 🐛 修复

- 修复多选导入无法选择多个文件的问题
- 修复单文件关闭后未恢复初始状态的问题
- 修复imageProcessor.setImage(null)导致的错误

---

## 📋 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/renderer/index.html` | 添加multiple属性、UI标签修改、版本号更新、致谢 |
| `src/renderer/js/renderer.js` | 多文件处理、队列优化、EXIF缓存、预加载 |
| `src/renderer/js/colorExtractor.js` | 动态采样步长 |
| `src/renderer/js/imageProcessor.js` | setImage null检查 |
| `src/renderer/js/components/DropZone.js` | 多文件支持 |
| `src/main/main.js` | 文件对话框调试日志 |

---

## 🙏 致谢

感谢 **Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划** 的支持。

---

**Full Changelog**: https://github.com/IceyVanci/colorphoto/commits/v1.08