const { createCanvas } = require('@napi-rs/canvas');

const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 渐变背景（深蓝到紫色）
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#1a1a2e');
gradient.addColorStop(1, '#16213e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// 主标题
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 72px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('ClearMind PDF', width / 2, height / 2 - 40);

// 副标题
ctx.fillStyle = '#a0aec0';
ctx.font = '32px Arial, sans-serif';
ctx.fillText('PDF转Markdown，快速、精准、免费', width / 2, height / 2 + 30);

// 底部标语
ctx.fillStyle = '#718096';
ctx.font = '24px Arial, sans-serif';
ctx.fillText('上传PDF，即刻转换', width / 2, height - 80);

// 保存
const fs = require('fs');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/og-image.png', buffer);
console.log('OG image generated: public/og-image.png');
