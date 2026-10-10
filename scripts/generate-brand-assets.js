const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. App Icon SVG (Royal Blue Squircle + Crisp White NQ Emblem)
const appIconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
  </defs>

  <!-- Squircle Background -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  
  <!-- Subtle Inner Border -->
  <rect width="500" height="500" x="6" y="6" rx="122" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.2"/>

  <!-- NQ Emblem Group - Explicit Left-to-Right: N then Q -->
  <g transform="translate(56, 136)">
    <!-- N Letter (White Bold Geometric) -->
    <path d="M 12 240 L 12 10 C 12 4.5 16.5 0 22 0 L 52 0 C 56.5 0 60.5 2.5 62.5 6.5 L 148 175 L 148 10 C 148 4.5 152.5 0 158 0 L 186 0 C 191.5 0 196 4.5 196 10 L 196 240 C 196 245.5 191.5 250 186 250 L 156 250 C 151.5 250 147.5 247.5 145.5 243.5 L 60 85 L 60 240 C 60 245.5 55.5 250 50 250 L 22 250 C 16.5 250 12 245.5 12 240 Z" fill="#FFFFFF"/>

    <!-- Q Letter (White Ring + Bold Tail) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 285 0 C 218.7 0 165 53.7 165 125 C 165 196.3 218.7 250 285 250 C 311.5 250 335.9 241.4 355.7 226.8 L 386.5 257.6 C 391.2 262.3 398.8 262.3 403.5 257.6 L 419.4 241.7 C 424.1 237 424.1 229.4 419.4 224.7 L 389.8 195.1 C 399.5 176.2 405 153.7 405 125 C 405 53.7 351.3 0 285 0 Z M 285 52 C 323.7 52 355 83.3 355 122 C 355 160.7 323.7 192 285 192 C 246.3 192 215 160.7 215 122 C 215 83.3 246.3 52 285 52 Z" fill="#E0F2FE"/>
    
    <!-- Q Inner Dot Accent -->
    <circle cx="285" cy="122" r="28" fill="#E0F2FE"/>
  </g>
</svg>`;

// 2. Full Brand Logo (NQ Symbol + Iraq Text + Slogan)
const fullLogoSvg = `<svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- NQ Emblem -->
  <g transform="translate(190, 70) scale(1.1)">
    <!-- N Letter (Dark Navy) -->
    <path d="M 12 230 L 12 10 C 12 4.5 16.5 0 22 0 L 52 0 C 56.5 0 60.5 2.5 62.5 6.5 L 148 165 L 148 10 C 148 4.5 152.5 0 158 0 L 186 0 C 191.5 0 196 4.5 196 10 L 196 230 C 196 235.5 191.5 240 186 240 L 156 240 C 151.5 240 147.5 237.5 145.5 233.5 L 60 75 L 60 230 C 60 235.5 55.5 240 50 240 L 22 240 C 16.5 240 12 235.5 12 230 Z" fill="#0F172A"/>

    <!-- Q Letter (Royal Blue) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 280 0 C 213.7 0 160 53.7 160 120 C 160 186.3 213.7 240 280 240 C 306.5 240 330.9 231.4 350.7 216.8 L 381.5 247.6 C 386.2 252.3 393.8 252.3 398.5 247.6 L 414.4 231.7 C 419.1 227 419.1 219.4 414.4 214.7 L 384.8 185.1 C 394.5 166.2 400 143.7 400 120 C 400 53.7 346.3 0 280 0 Z M 280 50 C 318.7 50 350 81.3 350 120 C 350 158.7 318.7 190 280 190 C 241.3 190 210 158.7 210 120 C 210 81.3 241.3 50 280 50 Z" fill="#2563EB"/>
    
    <!-- Q Inner Circle Accent -->
    <circle cx="280" cy="120" r="30" fill="#2563EB"/>
  </g>

  <!-- Iraq Text -->
  <text x="400" y="415" font-family="'Inter', 'SF Pro Display', sans-serif" font-weight="800" font-size="78" fill="#2563EB" text-anchor="middle" letter-spacing="-1">Iraq</text>

  <!-- Slogan Divider Line Left -->
  <line x1="210" y1="480" x2="310" y2="480" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Slogan Text in Arabic -->
  <text x="400" y="488" font-family="'Cairo', 'Tajawal', sans-serif" font-weight="700" font-size="28" fill="#0F172A" text-anchor="middle">احجز قبل لا توصل</text>
  
  <!-- Slogan Divider Line Right -->
  <line x1="490" y1="480" x2="590" y2="480" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>
</svg>`;

// 3. Compact Header Logo SVG
const headerLogoSvg = `<svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0, 5) scale(0.18)">
    <path d="M 12 230 L 12 10 C 12 4.5 16.5 0 22 0 L 52 0 C 56.5 0 60.5 2.5 62.5 6.5 L 148 165 L 148 10 C 148 4.5 152.5 0 158 0 L 186 0 C 191.5 0 196 4.5 196 10 L 196 230 C 196 235.5 191.5 240 186 240 L 156 240 C 151.5 240 147.5 237.5 145.5 233.5 L 60 75 L 60 230 C 60 235.5 55.5 240 50 240 L 22 240 C 16.5 240 12 235.5 12 230 Z" fill="#0F172A"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 280 0 C 213.7 0 160 53.7 160 120 C 160 186.3 213.7 240 280 240 C 306.5 240 330.9 231.4 350.7 216.8 L 381.5 247.6 C 386.2 252.3 393.8 252.3 398.5 247.6 L 414.4 231.7 C 419.1 227 419.1 219.4 414.4 214.7 L 384.8 185.1 C 394.5 166.2 400 143.7 400 120 C 400 53.7 346.3 0 280 0 Z M 280 50 C 318.7 50 350 81.3 350 120 C 350 158.7 318.7 190 280 190 C 241.3 190 210 158.7 210 120 C 210 81.3 241.3 50 280 50 Z" fill="#2563EB"/>
    <circle cx="280" cy="120" r="30" fill="#2563EB"/>
  </g>
  <text x="82" y="36" font-family="'Inter', sans-serif" font-weight="900" font-size="28" fill="#0F172A">NoQ</text>
  <text x="146" y="36" font-family="'Inter', sans-serif" font-weight="700" font-size="22" fill="#2563EB">Iraq</text>
  <text x="83" y="52" font-family="'Cairo', sans-serif" font-weight="700" font-size="10" fill="#2563EB">احجز قبل لا توصل</text>
</svg>`;

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Save SVG assets
  fs.writeFileSync(path.join(publicDir, 'app-icon.svg'), appIconSvg);
  fs.writeFileSync(path.join(publicDir, 'logo-full.svg'), fullLogoSvg);
  fs.writeFileSync(path.join(publicDir, 'logo-header.svg'), headerLogoSvg);

  console.log('✓ Created SVG Brand Assets in public/');

  // Convert SVG to PNG High-Res App Icons
  const appIconBuffer = Buffer.from(appIconSvg);

  // 1. Public Web Icons
  await sharp(appIconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'app-icon.png'));
  await sharp(appIconBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon.png'));
  await sharp(appIconBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.png'));

  console.log('✓ Created Web High-Res PNG App Icons');

  // 2. Android Mipmap Launcher Icons
  const androidResDir = path.join(__dirname, '..', 'android-project', 'app', 'src', 'main', 'res');
  
  const mipmapSizes = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 }
  ];

  for (const item of mipmapSizes) {
    const targetFolder = path.join(androidResDir, item.dir);
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });
    
    await sharp(appIconBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));
      
    await sharp(appIconBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));
  }

  console.log('✓ Generated Android Mipmap Launcher Icons (ic_launcher.png & ic_launcher_round.png)');
}

main().catch(console.error);
