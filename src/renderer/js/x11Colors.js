/**
 * X11颜色数据与匹配模块
 */

const X11_COLORS = [
  { hex: '#F0F8FF', en: 'AliceBlue', cn: '爱丽丝蓝', r: 240, g: 248, b: 255 },
  { hex: '#FAEBD7', en: 'AntiqueWhite', cn: '古董白', r: 250, g: 235, b: 215 },
  { hex: '#00FFFF', en: 'Aqua', cn: '浅绿色', r: 0, g: 255, b: 255 },
  { hex: '#7FFFD4', en: 'Aquamarine', cn: '碧绿色', r: 127, g: 255, b: 212 },
  { hex: '#F0FFFF', en: 'Azure', cn: '天蓝色', r: 240, g: 255, b: 255 },
  { hex: '#F5F5DC', en: 'Beige', cn: '米色', r: 245, g: 245, b: 220 },
  { hex: '#FFE4C4', en: 'Bisque', cn: '陶坯色', r: 255, g: 228, b: 196 },
  { hex: '#000000', en: 'Black', cn: '黑色', r: 0, g: 0, b: 0 },
  { hex: '#FFEBCD', en: 'BlanchedAlmond', cn: '杏仁白', r: 255, g: 235, b: 205 },
  { hex: '#0000FF', en: 'Blue', cn: '蓝色', r: 0, g: 0, b: 255 },
  { hex: '#8A2BE2', en: 'BlueViolet', cn: '蓝紫色', r: 138, g: 43, b: 226 },
  { hex: '#A52A2A', en: 'Brown', cn: '棕色', r: 165, g: 42, b: 42 },
  { hex: '#DEB887', en: 'Burlywood', cn: '硬木色', r: 222, g: 184, b: 135 },
  { hex: '#5F9EA0', en: 'CadetBlue', cn: '灰蓝色', r: 95, g: 158, b: 160 },
  { hex: '#7FFF00', en: 'Chartreuse', cn: '查特酒绿', r: 127, g: 255, b: 0 },
  { hex: '#D2691E', en: 'Chocolate', cn: '巧克力色', r: 210, g: 105, b: 30 },
  { hex: '#FF7F50', en: 'Coral', cn: '珊瑚色', r: 255, g: 127, b: 80 },
  { hex: '#6495ED', en: 'CornflowerBlue', cn: '矢车菊蓝', r: 100, g: 149, b: 237 },
  { hex: '#FFF8DC', en: 'Cornsilk', cn: '玉米丝色', r: 255, g: 248, b: 220 },
  { hex: '#DC143C', en: 'Crimson', cn: '深红色', r: 220, g: 20, b: 60 },
  { hex: '#00FFFF', en: 'Cyan', cn: '青色', r: 0, g: 255, b: 255 },
  { hex: '#00008B', en: 'DarkBlue', cn: '深蓝色', r: 0, g: 0, b: 139 },
  { hex: '#008B8B', en: 'DarkCyan', cn: '深青色', r: 0, g: 139, b: 139 },
  { hex: '#B8860B', en: 'DarkGoldenrod', cn: '深金黄色', r: 184, g: 134, b: 11 },
  { hex: '#A9A9A9', en: 'DarkGray', cn: '深灰色', r: 169, g: 169, b: 169 },
  { hex: '#006400', en: 'DarkGreen', cn: '深绿色', r: 0, g: 100, b: 0 },
  { hex: '#BDB76B', en: 'DarkKhaki', cn: '深卡其色', r: 189, g: 183, b: 107 },
  { hex: '#8B008B', en: 'DarkMagenta', cn: '深洋红色', r: 139, g: 0, b: 139 },
  { hex: '#556B2F', en: 'DarkOliveGreen', cn: '深橄榄绿', r: 85, g: 107, b: 47 },
  { hex: '#FF8C00', en: 'DarkOrange', cn: '深橙色', r: 255, g: 140, b: 0 },
  { hex: '#9932CC', en: 'DarkOrchid', cn: '深兰紫色', r: 153, g: 50, b: 204 },
  { hex: '#8B0000', en: 'DarkRed', cn: '深红色', r: 139, g: 0, b: 0 },
  { hex: '#E9967A', en: 'DarkSalmon', cn: '深鲑鱼色', r: 233, g: 150, b: 122 },
  { hex: '#8FBC8F', en: 'DarkSeaGreen', cn: '深海绿色', r: 143, g: 188, b: 143 },
  { hex: '#483D8B', en: 'DarkSlateBlue', cn: '深板岩蓝', r: 72, g: 61, b: 139 },
  { hex: '#2F4F4F', en: 'DarkSlateGray', cn: '深石板灰', r: 47, g: 79, b: 79 },
  { hex: '#00CED1', en: 'DarkTurquoise', cn: '深绿松石色', r: 0, g: 206, b: 209 },
  { hex: '#9400D3', en: 'DarkViolet', cn: '深紫色', r: 148, g: 0, b: 211 },
  { hex: '#FF1493', en: 'DeepPink', cn: '深粉色', r: 255, g: 20, b: 147 },
  { hex: '#00BFFF', en: 'DeepSkyBlue', cn: '深天蓝色', r: 0, g: 191, b: 255 },
  { hex: '#696969', en: 'DimGray', cn: '暗灰色', r: 105, g: 105, b: 105 },
  { hex: '#1E90FF', en: 'DodgerBlue', cn: '道奇蓝', r: 30, g: 144, b: 255 },
  { hex: '#B22222', en: 'Firebrick', cn: '耐火砖色', r: 178, g: 34, b: 34 },
  { hex: '#FFFAF0', en: 'FloralWhite', cn: '花白色', r: 255, g: 250, b: 240 },
  { hex: '#228B22', en: 'ForestGreen', cn: '森林绿', r: 34, g: 139, b: 34 },
  { hex: '#FF00FF', en: 'Fuchsia', cn: '品红色', r: 255, g: 0, b: 255 },
  { hex: '#DCDCDC', en: 'Gainsboro', cn: '烟白色', r: 220, g: 220, b: 220 },
  { hex: '#F8F8FF', en: 'GhostWhite', cn: '幽灵白', r: 248, g: 248, b: 255 },
  { hex: '#FFD700', en: 'Gold', cn: '金色', r: 255, g: 215, b: 0 },
  { hex: '#DAA520', en: 'Goldenrod', cn: '金麒麟色', r: 218, g: 165, b: 32 },
  { hex: '#808080', en: 'Gray', cn: '灰色', r: 128, g: 128, b: 128 },
  { hex: '#008000', en: 'Green', cn: '绿色', r: 0, g: 128, b: 0 },
  { hex: '#ADFF2F', en: 'GreenYellow', cn: '绿黄色', r: 173, g: 255, b: 47 },
  { hex: '#F0FFF0', en: 'Honeydew', cn: '蜜瓜色', r: 240, g: 255, b: 240 },
  { hex: '#FF69B4', en: 'HotPink', cn: '亮粉色', r: 255, g: 105, b: 180 },
  { hex: '#CD5C5C', en: 'IndianRed', cn: '印度红', r: 205, g: 92, b: 92 },
  { hex: '#4B0082', en: 'Indigo', cn: '靛蓝色', r: 75, g: 0, b: 130 },
  { hex: '#FFFFF0', en: 'Ivory', cn: '象牙色', r: 255, g: 255, b: 240 },
  { hex: '#F0E68C', en: 'Khaki', cn: '卡其色', r: 240, g: 230, b: 140 },
  { hex: '#E6E6FA', en: 'Lavender', cn: '薰衣草色', r: 230, g: 230, b: 250 },
  { hex: '#FFF0F5', en: 'LavenderBlush', cn: '薰衣草红', r: 255, g: 240, b: 245 },
  { hex: '#7CFC00', en: 'LawnGreen', cn: '草绿色', r: 124, g: 252, b: 0 },
  { hex: '#FFFACD', en: 'LemonChiffon', cn: '柠檬绸色', r: 255, g: 250, b: 205 },
  { hex: '#ADD8E6', en: 'LightBlue', cn: '浅蓝色', r: 173, g: 216, b: 230 },
  { hex: '#F08080', en: 'LightCoral', cn: '浅珊瑚色', r: 240, g: 128, b: 128 },
  { hex: '#E0FFFF', en: 'LightCyan', cn: '浅青色', r: 224, g: 255, b: 255 },
  { hex: '#FAFAD2', en: 'LightGoldenrodYellow', cn: '浅金黄色', r: 250, g: 250, b: 210 },
  { hex: '#90EE90', en: 'LightGreen', cn: '浅绿色', r: 144, g: 238, b: 144 },
  { hex: '#D3D3D3', en: 'LightGray', cn: '浅灰色', r: 211, g: 211, b: 211 },
  { hex: '#FFB6C1', en: 'LightPink', cn: '浅粉色', r: 255, g: 182, b: 193 },
  { hex: '#FFA07A', en: 'LightSalmon', cn: '浅鲑鱼色', r: 255, g: 160, b: 122 },
  { hex: '#20B2AA', en: 'LightSeaGreen', cn: '浅海绿色', r: 32, g: 178, b: 170 },
  { hex: '#87CEFA', en: 'LightSkyBlue', cn: '浅天蓝色', r: 135, g: 206, b: 250 },
  { hex: '#778899', en: 'LightSlateGray', cn: '浅石板灰', r: 119, g: 136, b: 153 },
  { hex: '#B0C4DE', en: 'LightSteelBlue', cn: '浅钢蓝色', r: 176, g: 196, b: 222 },
  { hex: '#FFFFE0', en: 'LightYellow', cn: '浅黄色', r: 255, g: 255, b: 224 },
  { hex: '#00FF00', en: 'Lime', cn: '酸橙色', r: 0, g: 255, b: 0 },
  { hex: '#32CD32', en: 'LimeGreen', cn: '浅绿色', r: 50, g: 205, b: 50 },
  { hex: '#FAF0E6', en: 'Linen', cn: '亚麻色', r: 250, g: 240, b: 230 },
  { hex: '#FF00FF', en: 'Magenta', cn: '洋红色', r: 255, g: 0, b: 255 },
  { hex: '#800000', en: 'Maroon', cn: '栗色', r: 128, g: 0, b: 0 },
  { hex: '#66CDAA', en: 'MediumAquamarine', cn: '中碧绿色', r: 102, g: 205, b: 170 },
  { hex: '#0000CD', en: 'MediumBlue', cn: '中蓝色', r: 0, g: 0, b: 205 },
  { hex: '#BA55D3', en: 'MediumOrchid', cn: '中兰紫色', r: 186, g: 85, b: 211 },
  { hex: '#9370DB', en: 'MediumPurple', cn: '中紫色', r: 147, g: 112, b: 219 },
  { hex: '#3CB371', en: 'MediumSeaGreen', cn: '中海绿色', r: 60, g: 179, b: 113 },
  { hex: '#7B68EE', en: 'MediumSlateBlue', cn: '中板岩蓝', r: 123, g: 104, b: 238 },
  { hex: '#00FA9A', en: 'MediumSpringGreen', cn: '中春绿色', r: 0, g: 250, b: 154 },
  { hex: '#48D1CC', en: 'MediumTurquoise', cn: '中绿松石色', r: 72, g: 209, b: 204 },
  { hex: '#C71585', en: 'MediumVioletRed', cn: '中紫红色', r: 199, g: 21, b: 133 },
  { hex: '#191970', en: 'MidnightBlue', cn: '午夜蓝色', r: 25, g: 25, b: 112 },
  { hex: '#F5FFFA', en: 'MintCream', cn: '薄荷奶油色', r: 245, g: 255, b: 250 },
  { hex: '#FFE4E1', en: 'MistyRose', cn: '雾玫瑰色', r: 255, g: 228, b: 225 },
  { hex: '#FFE4B5', en: 'Moccasin', cn: '鹿皮色', r: 255, g: 228, b: 181 },
  { hex: '#FFDEAD', en: 'NavajoWhite', cn: '纳瓦霍白', r: 255, g: 222, b: 173 },
  { hex: '#000080', en: 'Navy', cn: '海军蓝色', r: 0, g: 0, b: 128 },
  { hex: '#FDF5E6', en: 'OldLace', cn: '旧蕾丝色', r: 253, g: 245, b: 230 },
  { hex: '#808000', en: 'Olive', cn: '橄榄色', r: 128, g: 128, b: 0 },
  { hex: '#6B8E23', en: 'OliveDrab', cn: '橄榄褐色', r: 107, g: 142, b: 35 },
  { hex: '#FFA500', en: 'Orange', cn: '橙色', r: 255, g: 165, b: 0 },
  { hex: '#FF4500', en: 'OrangeRed', cn: '橙红色', r: 255, g: 69, b: 0 },
  { hex: '#DA70D6', en: 'Orchid', cn: '兰紫色', r: 218, g: 112, b: 214 },
  { hex: '#EEE8AA', en: 'PaleGoldenrod', cn: '灰金黄色', r: 238, g: 232, b: 170 },
  { hex: '#98FB98', en: 'PaleGreen', cn: '苍绿色', r: 152, g: 251, b: 152 },
  { hex: '#AFEEEE', en: 'PaleTurquoise', cn: '苍绿松石色', r: 175, g: 238, b: 238 },
  { hex: '#DB7093', en: 'PaleVioletRed', cn: '苍紫罗蓝色', r: 219, g: 112, b: 147 },
  { hex: '#FFEFD5', en: 'PapayaWhip', cn: '番木瓜色', r: 255, g: 239, b: 213 },
  { hex: '#FFDAB9', en: 'PeachPuff', cn: '桃子色', r: 255, g: 218, b: 185 },
  { hex: '#CD853F', en: 'Peru', cn: '秘鲁色', r: 205, g: 133, b: 63 },
  { hex: '#FFC0CB', en: 'Pink', cn: '粉色', r: 255, g: 192, b: 203 },
  { hex: '#DDA0DD', en: 'Plum', cn: '李子色', r: 221, g: 160, b: 221 },
  { hex: '#B0E0E6', en: 'PowderBlue', cn: '粉末蓝色', r: 176, g: 224, b: 230 },
  { hex: '#800080', en: 'Purple', cn: '紫色', r: 128, g: 0, b: 128 },
  { hex: '#663399', en: 'RebeccaPurple', cn: '丽贝卡紫', r: 102, g: 51, b: 153 },
  { hex: '#FF0000', en: 'Red', cn: '红色', r: 255, g: 0, b: 0 },
  { hex: '#BC8F8F', en: 'RosyBrown', cn: '玫瑰褐色', r: 188, g: 143, b: 143 },
  { hex: '#4169E1', en: 'RoyalBlue', cn: '皇家蓝色', r: 65, g: 105, b: 225 },
  { hex: '#8B4513', en: 'SaddleBrown', cn: '马鞍棕色', r: 139, g: 69, b: 19 },
  { hex: '#FA8072', en: 'Salmon', cn: '鲑鱼色', r: 250, g: 128, b: 114 },
  { hex: '#F4A460', en: 'SandyBrown', cn: '沙褐色', r: 244, g: 164, b: 96 },
  { hex: '#2E8B57', en: 'SeaGreen', cn: '海绿色', r: 46, g: 139, b: 87 },
  { hex: '#FFF5EE', en: 'Seashell', cn: '海贝色', r: 255, g: 245, b: 238 },
  { hex: '#A0522D', en: 'Sienna', cn: '赭色', r: 160, g: 82, b: 45 },
  { hex: '#C0C0C0', en: 'Silver', cn: '银色', r: 192, g: 192, b: 192 },
  { hex: '#87CEEB', en: 'SkyBlue', cn: '天蓝色', r: 135, g: 206, b: 235 },
  { hex: '#6A5ACD', en: 'SlateBlue', cn: '石板蓝色', r: 106, g: 90, b: 205 },
  { hex: '#708090', en: 'SlateGray', cn: '石板灰色', r: 112, g: 128, b: 144 },
  { hex: '#FFFAFA', en: 'Snow', cn: '雪白色', r: 255, g: 250, b: 250 },
  { hex: '#00FF7F', en: 'SpringGreen', cn: '春绿色', r: 0, g: 255, b: 127 },
  { hex: '#4682B4', en: 'SteelBlue', cn: '钢蓝色', r: 70, g: 130, b: 180 },
  { hex: '#D2B48C', en: 'Tan', cn: '棕褐色', r: 210, g: 180, b: 140 },
  { hex: '#008080', en: 'Teal', cn: '蓝绿色', r: 0, g: 128, b: 128 },
  { hex: '#D8BFD8', en: 'Thistle', cn: '蓟色', r: 216, g: 191, b: 216 },
  { hex: '#FF6347', en: 'Tomato', cn: '番茄色', r: 255, g: 99, b: 71 },
  { hex: '#40E0D0', en: 'Turquoise', cn: '绿松石色', r: 64, g: 224, b: 208 },
  { hex: '#EE82EE', en: 'Violet', cn: '紫罗兰色', r: 238, g: 130, b: 238 },
  { hex: '#F5DEB3', en: 'Wheat', cn: '小麦色', r: 245, g: 222, b: 179 },
  { hex: '#FFFFFF', en: 'White', cn: '白色', r: 255, g: 255, b: 255 },
  { hex: '#F5F5F5', en: 'WhiteSmoke', cn: '白烟色', r: 245, g: 245, b: 245 },
  { hex: '#FFFF00', en: 'Yellow', cn: '黄色', r: 255, g: 255, b: 0 },
  { hex: '#9ACD32', en: 'YellowGreen', cn: '黄绿色', r: 154, g: 205, b: 50 }
];

/**
 * 将十六进制颜色转换为RGB对象
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 计算两个颜色之间的欧几里得距离
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

/**
 * 找到最接近的X11颜色
 * @param {string} hex - 十六进制颜色值
 * @returns {object} - 匹配的X11颜色对象
 */
function findClosestColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  let closest = X11_COLORS[0];
  let minDistance = Infinity;
  
  for (const color of X11_COLORS) {
    const distance = colorDistance(rgb.r, rgb.g, rgb.b, color.r, color.g, color.b);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }
  
  return closest;
}

/**
 * 根据语言设置获取颜色名称
 * @param {string} hex - 十六进制颜色值
 * @param {string} language - 'cn' 或 'en'
 * @returns {string} - 颜色名称
 */
function getColorName(hex, language = 'cn') {
  const closest = findClosestColor(hex);
  if (!closest) return '';
  return language === 'en' ? closest.en : closest.cn;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { X11_COLORS, hexToRgb, findClosestColor, getColorName };
}
