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
  showColorName: false,
  colorNameLanguage: 'en',
  firstTimeShowColorName: true,  // 首次显示颜色名称标志
  blockSize: 150,
  exifData: null,
  originalFilePath: null,
  // 每个模式独立的颜色排序状态
  modeColors: {
    vertical: [],
    grid: [],
    edge: []
  }
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
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(displayColors.slice(0, 5));
      controlPanel.setColors(displayColors.slice(0, 5));
    } else {
      const limitedColors = mode === 'vertical' && appState.colorCount < 5 
        ? displayColors.slice(0, appState.colorCount) 
        : displayColors;
      appState.extractedColors = limitedColors;
      imageProcessor.setColors(limitedColors);
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(displayColors.slice(0, 5));
      controlPanel.setColors(displayColors.slice(0, 5));
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
  
  controlPanel.setCallback('onColorNameLangChange', (lang) => {
    appState.colorNameLanguage = lang;
    imageProcessor.setColorNameLanguage(lang);
    renderImage();
  });
  
  imagePreview.setOnColorsChange((colors) => {
    appState.extractedColors = colors;
    // 直接更新 colors，不调用 setColors 以避免重置位置
    imageProcessor.colors = colors.slice(0, appState.colorCount);
    // 侧边栏显示全部5个颜色（保持用户拖动后的顺序）
    imagePreview.setColors(colors.slice(0, 5));
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
    // 导入新图片时重置所有模式的颜色排序状态
    appState.modeColors = {
      vertical: [],
      grid: [],
      edge: []
    };
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
    
    // 调试信息
    console.log('=== EXIF Export Debug ===');
    console.log('typeof piexif:', typeof piexif);
    console.log('appState.exifData:', appState.exifData);
    
    if (appState.exifData && typeof piexif !== 'undefined') {
      console.log('Attempting to embed EXIF...');
      exportData = exifHandler.embedExif(exportData, appState.exifData);
      console.log('EXIF embedded successfully');
    } else if (!appState.exifData) {
      console.log('No EXIF data available');
    } else {
      console.log('piexif is undefined');
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

// 处理关于按钮
const aboutBtn = document.getElementById('aboutBtn');
const modal = document.getElementById('aboutModal');
const closeBtn = document.getElementById('closeModal');

if (aboutBtn && modal && closeBtn) {
  aboutBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // 处理弹窗中的链接点击，在默认浏览器打开
  modal.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      if (href && window.electronAPI) {
        window.electronAPI.openExternal(href);
      }
    }
  });
}

// 处理文件拖入窗口
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

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
