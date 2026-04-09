/**
 * ColorPhoto - Main Renderer
 * 主渲染进程入口文件
 */

// 全局状态
const appState = {
  originalImage: null,
  processedImage: null,
  extractedColors: [],
  allExtractedColors: [],
  displayMode: 'vertical',
  edgePosition: 'right',
  colorCount: 5,
  colorSort: 'brightness',
  showLabel: true,
  showColorName: true,
  colorNameLanguage: 'cn',
  blockSize: 150,
  exifData: null,
  originalFilePath: null
};

// 组件实例
let colorExtractor;
let imageProcessor;
let exifHandler;
let imagePreview;
let controlPanel;

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  console.log('ColorPhoto initializing...');
  initComponents();
  setupCallbacks();
  console.log('ColorPhoto initialized');
});

// 初始化组件
function initComponents() {
  colorExtractor = new ColorExtractor(appState.colorCount);
  imageProcessor = new ImageProcessor();
  imageProcessor.initCanvas(document.getElementById('previewCanvas'));
  exifHandler = new ExifHandler();
  imagePreview = new ImagePreview('previewCanvas', 'colorBlocks');
  controlPanel = new ControlPanel();
  
  // 拖拽区域组件
  const dropZone = new DropZone('dropZone', {
    onFileSelect: handleDropZoneFileSelect
  });
}

// 处理拖拽区域的文件选择
async function handleDropZoneFileSelect(file) {
  try {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target.result;
      await loadImage({
        path: file.path || file.name,
        data: data
      });
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error reading file:', error);
    alert('读取文件失败: ' + error.message);
  }
}

// 设置回调函数
function setupCallbacks() {
  controlPanel.setCallback('onImport', handleImport);
  controlPanel.setCallback('onExport', handleExport);
  
  controlPanel.setCallback('onDisplayModeChange', (mode) => {
    appState.displayMode = mode;
    imageProcessor.setDisplayMode(mode);
    const sortedColors = colorExtractor.sortColors(appState.allExtractedColors, appState.colorSort);
    // 方格模式始终使用前4个颜色
    if (mode === 'grid') {
      const gridColors = sortedColors.slice(0, 4);
      imageProcessor.setColors(gridColors);
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(sortedColors.slice(0, 5));
      controlPanel.setColors(gridColors);
    } else {
      const limitedColors = mode === 'vertical' && appState.colorCount < 5 
        ? sortedColors.slice(0, appState.colorCount) 
        : sortedColors;
      imageProcessor.setColors(limitedColors);
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(sortedColors.slice(0, 5));
      controlPanel.setColors(limitedColors);
    }
    renderImage();
  });
  
  controlPanel.setCallback('onEdgePositionChange', (position) => {
    appState.edgePosition = position;
    imageProcessor.setEdgePosition(position);
    renderImage();
  });
  
  controlPanel.setCallback('onColorCountChange', (count) => {
    appState.colorCount = count;
    colorExtractor.colorCount = count;
    if (appState.allExtractedColors.length >= 5) {
      const sortedColors = colorExtractor.sortColors(appState.allExtractedColors, appState.colorSort);
      let limitedColors;
      if (count === 3) {
        // 取5个的中间3个（index 1, 2, 3）
        limitedColors = [sortedColors[1], sortedColors[2], sortedColors[3]];
      } else {
        limitedColors = sortedColors.slice(0, count);
      }
      appState.extractedColors = limitedColors;
      imageProcessor.setColors(limitedColors);
      // 侧边栏预览始终显示全部5个颜色
      imagePreview.setColors(sortedColors.slice(0, 5));
      controlPanel.setColors(limitedColors);
      renderImage();
    }
  });
  
  controlPanel.setCallback('onBlockSizeChange', (size) => {
    appState.blockSize = size;
    imageProcessor.setBlockSize(size);
    renderImage();
  });
  
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
  
  controlPanel.setCallback('onShowLabelChange', (show) => {
    appState.showLabel = show;
    imageProcessor.setShowLabel(show);
    renderImage();
  });
  
  controlPanel.setCallback('onShowColorNameChange', (show) => {
    appState.showColorName = show;
    imageProcessor.setShowColorName(show);
    renderImage();
  });
  
  controlPanel.setCallback('onColorNameLangChange', (lang) => {
    appState.colorNameLanguage = lang;
    imageProcessor.setColorNameLanguage(lang);
    renderImage();
  });
  
  imagePreview.setOnColorsChange((colors) => {
    appState.extractedColors = colors;
    imageProcessor.setColors(colors);
    // 侧边栏显示全部5个颜色（保持排序后的顺序）
    const sortedColors = colorExtractor.sortColors(appState.allExtractedColors, appState.colorSort);
    imagePreview.setColors(sortedColors.slice(0, 5));
    controlPanel.setColors(colors);
    renderImage();
  });
}

// 重新提取颜色
async function reExtractColors() {
  const canvas = imagePreview.getCanvas();
  if (!canvas) return;
  
  const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  const colors = colorExtractor.extract(imageData);
  appState.allExtractedColors = colors;
  
  const displayColors = colorExtractor.sortColors(colors, appState.colorSort);
  const limitedColors = displayColors.slice(0, appState.colorCount);
  
  appState.extractedColors = limitedColors;
  imageProcessor.setColors(limitedColors);
  imagePreview.setColors(limitedColors);
  controlPanel.setColors(limitedColors);
  renderImage();
}

// 处理图片导入
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

// 加载图片
async function loadImage(result) {
  const { path, data } = result;
  
  try {
    appState.originalFilePath = path;
    
    const exifData = await window.electronAPI.getExif(path);
    appState.exifData = exifData;
    if (exifData) {
      exifHandler.setExifData(exifData);
    }
    
    await imagePreview.loadImage(data);
    
    const canvas = imagePreview.getCanvas();
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const colors = colorExtractor.extract(imageData);
    appState.allExtractedColors = colors;
    
    const sortedColors = colorExtractor.sortColors(colors, appState.colorSort);
    const displayColors = sortedColors.slice(0, appState.colorCount);
    
    appState.extractedColors = displayColors;
    imageProcessor.setImage(imagePreview.getImage());
    imageProcessor.setColors(displayColors);
    imagePreview.setColors(displayColors);
    controlPanel.setColors(displayColors);
    controlPanel.setExportEnabled(true);
    renderImage();
    
    document.getElementById('dropZone').style.display = 'none';
    imagePreview.show();
    
  } catch (error) {
    console.error('Error loading image:', error);
    alert('加载图片失败: ' + error.message);
  }
}

// 渲染图片
function renderImage() {
  imageProcessor.setDisplayMode(appState.displayMode);
  imageProcessor.setEdgePosition(appState.edgePosition);
  imageProcessor.setBlockSize(appState.blockSize);
  imageProcessor.setShowLabel(appState.showLabel);
  imageProcessor.setShowColorName(appState.showColorName);
  imageProcessor.setColorNameLanguage(appState.colorNameLanguage);
  imageProcessor.render();
}

// 处理导出
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

// 处理文件拖入窗口
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
