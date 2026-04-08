/**
 * ImageProcessor - 图片处理模块
 * 负责渲染色块和处理图片导出
 */

class ImageProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
    this.colors = [];
    this.displayMode = 'vertical'; // vertical | edge
    this.edgePosition = 'right';
    this.blockSize = 150;
    this.showLabel = true;
    this.showColorName = true;
    this.colorNameLanguage = 'cn';
    
    // 拖拽状态（五个色块整体拖动）
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.initialPositions = [];
    
    // 色块位置数组
    this.blockPositions = [];
  }

  initCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupDragEvents();
  }

  setImage(img) {
    this.originalImage = img;
    if (this.canvas) {
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.initBlockPositions();
    }
  }

  setColors(colors) {
    this.colors = colors;
    this.initBlockPositions();
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    this.initBlockPositions();
  }

  setEdgePosition(position) {
    this.edgePosition = position;
  }

  setBlockSize(size) {
    this.blockSize = size;
    this.initBlockPositions();
  }

  setShowLabel(show) {
    this.showLabel = show;
  }

  setShowColorName(show) {
    this.showColorName = show;
  }

  setColorNameLanguage(lang) {
    this.colorNameLanguage = lang;
  }

  // 初始化色块位置
  initBlockPositions() {
    if (!this.canvas || !this.colors.length) return;
    
    const imgWidth = this.canvas.width;
    const imgHeight = this.canvas.height;
    
    this.blockPositions = [];
    
    if (this.displayMode === 'vertical') {
      // 纵向模式：色块在图片左侧
      const startX = 10;
      const blockCount = this.colors.length;
      const totalHeight = blockCount * this.blockSize;
      const startY = Math.max(0, (imgHeight - totalHeight) / 2);
      
      this.colors.forEach((color, index) => {
        this.blockPositions.push({
          x: startX,
          y: startY + index * this.blockSize,
          width: this.blockSize,
          height: this.blockSize
        });
      });
    } else if (this.displayMode === 'grid') {
      // 方格模式：2x2布局，仅使用前4个颜色
      const gridColors = this.colors.slice(0, 4);
      const startX = 10;
      const startY = 10;
      
      gridColors.forEach((color, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        this.blockPositions.push({
          x: startX + col * this.blockSize,
          y: startY + row * this.blockSize,
          width: this.blockSize,
          height: this.blockSize
        });
      });
    } else {
      // 边缘模式
      this.updateEdgePositions();
    }
  }

  // 更新边缘位置
  updateEdgePositions() {
    if (!this.canvas) return;
    
    const imgWidth = this.canvas.width;
    const imgHeight = this.canvas.height;
    const isHorizontal = this.edgePosition === 'top' || this.edgePosition === 'bottom';
    
    let blockLen, blockThick, startX, startY;
    
    if (isHorizontal) {
      blockLen = imgWidth / this.colors.length;
      blockThick = this.blockSize;
      startX = 0;
      startY = this.edgePosition === 'top' ? 0 : imgHeight - blockThick;
    } else {
      blockLen = imgHeight / this.colors.length;
      blockThick = this.blockSize;
      startX = this.edgePosition === 'left' ? 0 : imgWidth - blockThick;
      startY = 0;
    }
    
    this.blockPositions = [];
    this.colors.forEach((color, index) => {
      if (isHorizontal) {
        this.blockPositions.push({
          x: index * blockLen,
          y: startY,
          width: blockLen,
          height: blockThick
        });
      } else {
        this.blockPositions.push({
          x: startX,
          y: index * blockLen,
          width: blockThick,
          height: blockLen
        });
      }
    });
  }

  // 设置拖拽事件（五个色块整体拖动）
  setupDragEvents() {
    if (!this.canvas) return;
    
    const getCanvasCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };
    
    // 查找色块（检测任何色块）
    const findBlockAt = (x, y) => {
      for (let i = 0; i < this.blockPositions.length; i++) {
        const pos = this.blockPositions[i];
        if (x >= pos.x && x <= pos.x + pos.width &&
            y >= pos.y && y <= pos.y + pos.height) {
          return i;
        }
      }
      return -1;
    };
    
    this.canvas.addEventListener('mousedown', (e) => {
      // 边缘模式不允许拖动
      if (this.displayMode === 'edge') return;
      
      const coords = getCanvasCoords(e);
      const index = findBlockAt(coords.x, coords.y);
      if (index >= 0) {
        this.isDragging = true;
        this.dragOffsetX = coords.x - this.blockPositions[0].x;
        this.dragOffsetY = coords.y - this.blockPositions[0].y;
        // 保存初始位置用于计算相对偏移
        this.initialPositions = this.blockPositions.map(p => ({ x: p.x, y: p.y }));
        this.canvas.style.cursor = 'grabbing';
      }
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const coords = getCanvasCoords(e);
        const deltaX = coords.x - this.dragOffsetX - this.initialPositions[0].x;
        const deltaY = coords.y - this.dragOffsetY - this.initialPositions[0].y;
        
        // 整体移动所有色块到任意位置
        this.blockPositions.forEach((pos, i) => {
          pos.x = this.initialPositions[i].x + deltaX;
          pos.y = this.initialPositions[i].y + deltaY;
        });
        
        this.render();
      } else {
        if (this.displayMode !== 'vertical') {
          this.canvas.style.cursor = 'default';
          return;
        }
        const coords = getCanvasCoords(e);
        const index = findBlockAt(coords.x, coords.y);
        this.canvas.style.cursor = index >= 0 ? 'grab' : 'default';
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
      }
    });
  }

  render() {
    if (!this.canvas || !this.ctx || !this.originalImage) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.originalImage, 0, 0);

    this.renderBlocks();
  }

  renderBlocks() {
    const { ctx, colors, blockSize, showLabel, showColorName, colorNameLanguage, displayMode, edgePosition } = this;
    
    // 方格模式只使用前4个颜色
    const renderColors = displayMode === 'grid' ? colors.slice(0, 4) : colors;
    
    renderColors.forEach((color, index) => {
      const pos = this.blockPositions[index] || { x: 0, y: 0, width: blockSize, height: blockSize };
      
      // 绘制色块
      ctx.fillStyle = color.hex;
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
      
      // 纵向和边缘模式添加描边，方格模式不描边
      if (displayMode !== 'grid') {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
      }

      // 绘制色号
      if (showLabel) {
        const text = color.hex;
        
        if (displayMode === 'vertical') {
          // 纵向模式：色号在色块右侧，无背景，字体至少是色块高度的三分之一
          const labelX = pos.x + pos.width + 5;
          const labelY = pos.y;
          const labelHeight = pos.height;
          
          // 字体至少是色块高度的三分之一
          const fontSize = Math.max(24, labelHeight / 3);
          ctx.font = `bold ${fontSize}px 'MiSans', monospace`;
          
          // 动态计算描边线宽（字体大小的6%）
          const strokeWidth = Math.max(1, fontSize * 0.06);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = strokeWidth;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.strokeText(text, labelX, labelY + labelHeight / 2);
          ctx.fillStyle = color.hex;
          ctx.fillText(text, labelX, labelY + labelHeight / 2);
          
          // 绘制颜色名称（在色号下方），中文去掉结尾的"色"字
          if (showColorName) {
            let colorName = getColorName(color.hex, colorNameLanguage);
            if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
              colorName = colorName.slice(0, -1);
            }
            const nameY = labelY + labelHeight / 2 + fontSize + 5;
            ctx.strokeText(colorName, labelX, nameY);
            ctx.fillStyle = color.hex;
            ctx.fillText(colorName, labelX, nameY);
          }
          
        } else if (displayMode === 'grid') {
          // 方格模式：色号沿底边居中，颜色名称在左上角
          const text = color.hex;
          const nameOffset = pos.width * 0.05; // 距离边缘5%
          const nameFontSize = pos.width / 5; // 颜色名称字体为色块的1/5
          
          // 绘制颜色名称（位于色块左上角）
          if (showColorName) {
            let colorName = getColorName(color.hex, colorNameLanguage);
            if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
              colorName = colorName.slice(0, -1);
            }
            
            ctx.font = `bold ${nameFontSize}px 'MiSans', monospace`;
            const nameStrokeWidth = Math.max(1, nameFontSize * 0.08);
            const nameX = pos.x + nameOffset;
            const maxWidth = pos.width - nameOffset * 2;
            
            // 英文智能换行：允许两次换行
            if (colorNameLanguage === 'en' && ctx.measureText(colorName).width > maxWidth) {
              const lines = [];
              let uppercaseBreaks = [];
              
              // 找到所有大写字母位置（跳过第一个字符后的位置）
              for (let i = 1; i < colorName.length; i++) {
                if (colorName[i] >= 'A' && colorName[i] <= 'Z') {
                  uppercaseBreaks.push(i);
                }
              }
              
              if (uppercaseBreaks.length >= 2) {
                // 两次换行
                const break1 = uppercaseBreaks[Math.floor(uppercaseBreaks.length / 3)];
                const break2 = uppercaseBreaks[Math.floor(uppercaseBreaks.length * 2 / 3)];
                const line1 = colorName.substring(0, break1);
                const line2 = colorName.substring(break1, break2);
                const line3 = colorName.substring(break2);
                if (line1) lines.push(line1);
                if (line2) lines.push(line2);
                if (line3) lines.push(line3);
              } else if (uppercaseBreaks.length === 1) {
                // 一次换行
                const break1 = uppercaseBreaks[0];
                const line1 = colorName.substring(0, break1);
                const line2 = colorName.substring(break1);
                if (ctx.measureText(line1).width < maxWidth) {
                  if (line1) lines.push(line1);
                  if (line2) lines.push(line2);
                } else {
                  lines.push(colorName);
                }
              } else {
                lines.push(colorName);
              }
              
              // 绘制多行
              ctx.strokeStyle = '#000';
              ctx.lineWidth = nameStrokeWidth;
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              lines.forEach((line, idx) => {
                if (line) {
                  const y = pos.y + nameOffset + idx * nameFontSize;
                  ctx.strokeText(line, nameX, y);
                  ctx.fillStyle = color.hex;
                  ctx.fillText(line, nameX, y);
                }
              });
            } else {
              ctx.strokeStyle = '#000';
              ctx.lineWidth = nameStrokeWidth;
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              ctx.strokeText(colorName, nameX, pos.y + nameOffset);
              ctx.fillStyle = color.hex;
              ctx.fillText(colorName, nameX, pos.y + nameOffset);
            }
          }
          
          // 绘制色号（沿底边居中，7个字符宽度为色块的4/5）
          const hexTargetWidth = pos.width * 0.8;
          ctx.font = `bold 24px 'MiSans', monospace`;
          const baseWidth = ctx.measureText(text).width;
          const hexFontSize = Math.floor(24 * hexTargetWidth / baseWidth);
          const hexActualFontSize = Math.max(12, hexFontSize);
          
          ctx.font = `bold ${hexActualFontSize}px 'MiSans', monospace`;
          const outerStrokeWidth = Math.max(1, hexActualFontSize * 0.08);
          const innerStrokeWidth = outerStrokeWidth / 2;
          
          const hexX = pos.x + pos.width / 2;
          const hexY = pos.y + pos.height - nameOffset;
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          // 外层描边（LightGray或白色）
          const outerStrokeColor = color.hex.toUpperCase() === '#D3D3D3' ? '#fff' : '#D3D3D3';
          ctx.strokeStyle = outerStrokeColor;
          ctx.lineWidth = outerStrokeWidth;
          ctx.strokeText(text, hexX, hexY);
          
          // 内层描边（黑色）
          ctx.strokeStyle = '#000';
          ctx.lineWidth = innerStrokeWidth;
          ctx.strokeText(text, hexX, hexY);
          
          // 字体颜色与色块颜色相同
          ctx.fillStyle = color.hex;
          ctx.fillText(text, hexX, hexY);
          
        } else {
          // 边缘模式：色号在色块内部居中，无衬底，白色文字
          const centerX = pos.x + pos.width / 2;
          const centerY = pos.y + pos.height / 2;
          
          // 字体大小是色块短边的三分之一
          const shortSide = Math.min(pos.width, pos.height);
          const fontSize = shortSide / 3;
          const strokeWidth = Math.max(1, fontSize * 0.06);
          
          ctx.font = `bold ${fontSize}px 'MiSans', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const isVerticalLabel = edgePosition === 'left' || edgePosition === 'right';
          
          if (isVerticalLabel) {
            // 竖向显示（旋转90度）
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, 0, 0);
            ctx.fillStyle = '#fff';
            ctx.fillText(text, 0, 0);
            ctx.restore();
          } else {
            // 横向显示
            ctx.strokeStyle = '#000';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, centerX, centerY);
            ctx.fillStyle = '#fff';
            ctx.fillText(text, centerX, centerY);
          }
        }
      }
    });
  }

  exportToDataUrl() {
    if (!this.canvas) return null;
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  getImageSize() {
    if (!this.originalImage) return { width: 0, height: 0 };
    return {
      width: this.originalImage.width,
      height: this.originalImage.height
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessor;
}
