/**
 * DropZone Component - 拖拽区域组件
 */

class DropZone {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.onFileSelect = options.onFileSelect || (() => {});
    this.fileInput = document.getElementById('fileInput');
    
    if (!this.element) {
      console.error('DropZone: element not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    // 点击事件
    this.element.addEventListener('click', () => {
      if (this.fileInput) {
        this.fileInput.click();
      }
    });
    
    // 文件选择事件
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && this.isValidImage(file)) {
          this.onFileSelect(file);
        }
      });
    }
    
    // 拖拽事件
    this.element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.add('drag-over');
    });
    
    this.element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.remove('drag-over');
    });
    
    this.element.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (this.isValidImage(file)) {
          this.onFileSelect(file);
        }
      }
    });
    
    // 阻止默认拖拽行为
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
  }
  
  isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type);
  }
  
  show() {
    this.element.style.display = 'flex';
  }
  
  hide() {
    this.element.style.display = 'none';
  }
}
