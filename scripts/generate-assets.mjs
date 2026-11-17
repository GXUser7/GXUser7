import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const UI_FONT = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO_FONT = "ui-monospace, 'Cascadia Code', 'JetBrains Mono', SFMono-Regular, Consolas, monospace";

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function measureText(str, fontSize, isMono = false) {
  if (isMono) {
    return str.length * fontSize * 0.615;
  }
  let width = 0;
  for (const ch of str) {
    if ('шщжюмфдШЩЖЮМФДWM@#%'.includes(ch)) {
      width += fontSize * 0.78;
    } else if ("iIl1.,:;|·!()[]' ".includes(ch)) {
      width += fontSize * 0.34;
    } else if (ch >= 'А' && ch <= 'Я' || ch >= 'A' && ch <= 'Z' || ch === 'Ё') {
      width += fontSize * 0.60;
    } else {
      width += fontSize * 0.555;
    }
  }
  return width * 1.06;
}

function wrapLines(text, maxWidth, fontSize, isMono = false) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measureText(candidate, fontSize, isMono) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderLines(lines, x, y, lineHeight, attrs = '') {
  return lines
    .map((line, i) => `<text x="${x}" y="${(y + i * lineHeight).toFixed(1)}" ${attrs}>${esc(line)}</text>`)
    .join('\n');
}

function layoutPills(items, startX, startY, maxWidth, {
  fontSize = 11.5,
  padX = 10,
  height = 24,
  gapX = 7,
  gapY = 7,
  isMono = true,
  fill = '#1E1B2E',
  stroke = '#383254',
  textColor = '#E6E1F9',
  rx = 999,
  fontWeight = '600',
  maxRows = 3,
} = {}) {
  let x = startX;
  let y = startY;
  let row = 1;
  const placed = [];

  for (const item of items) {
    const label = typeof item === 'string' ? item : item.label;
    const itemFill = (typeof item === 'object' && item.fill) || fill;
    const itemStroke = (typeof item === 'object' && item.stroke) || stroke;
    const itemText = (typeof item === 'object' && item.textColor) || textColor;
    const w = Math.ceil(measureText(label, fontSize, isMono) + padX * 2);

    if (x > startX && x + w > startX + maxWidth) {
      if (row >= maxRows) continue;
      x = startX;
      y += height + gapY;
      row += 1;
    }

    placed.push({
      label,
      x,
      y,
      w,
      h: height,
      fill: itemFill,
      stroke: itemStroke,
      textColor: itemText,
    });
    x += w + gapX;
  }

  const svg = placed
    .map((p) => {
      const r = rx === 999 ? p.h / 2 : rx;
      const textY = (p.y + p.h / 2 + fontSize * 0.35).toFixed(1);
      return `<g>
  <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${r}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1"/>
  <text x="${(p.x + p.w / 2).toFixed(1)}" y="${textY}" text-anchor="middle" font-family="${isMono ? MONO_FONT : UI_FONT}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${p.textColor}">${esc(p.label)}</text>
</g>`;
    })
    .join('\n');

  return { svg, rows: row, endY: y + height };
}

// Parametric Material 3 Expressive polygon generator
function m3Polygon(radiusFn, cx, cy, scale = 1, N = 180) {
  let d = '';
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = radiusFn(t) * scale;
    const x = (cx + r * Math.cos(t)).toFixed(1);
    const y = (cy + r * Math.sin(t)).toFixed(1);
    d += (i ? 'L' : 'M') + x + ' ' + y;
  }
  return d + 'Z';
}

const SHAPE_FNS = {
  cookie9: (t) => 90 + 7 * Math.cos(9 * t),
  cookie12: (t) => 90 + 5.5 * Math.cos(12 * t),
  sunny8: (t) => 86 + 9 * Math.cos(8 * t),
  clover4: (t) => 82 + 16 * Math.cos(4 * t),
  flower6: (t) => 78 + 16 * Math.cos(6 * t),
  masakiFlake: (t) => 40 + 15 * Math.cos(6 * t),
};

// Authentic app icons
function masakiIcon(x, y, size = 52, gradId = 'masakiGrad') {
  const s = size / 200;
  const cookie = m3Polygon(SHAPE_FNS.cookie9, 100, 100, 1, 180);
  const flake = m3Polygon(SHAPE_FNS.masakiFlake, 100, 100, 1, 180);
  return {
    defs: `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#9EF2E4"/>
  <stop offset="100%" stop-color="#5FB8C9"/>
</linearGradient>`,
    body: `<g transform="translate(${x} ${y}) scale(${s.toFixed(5)})">
  <path d="${cookie}" fill="url(#${gradId})"/>
  <path d="${flake}" fill="#00504A"/>
  <circle cx="100" cy="100" r="11" fill="#9EF2E4"/>
</g>`,
  };
}

function yumiIcon(x, y, size = 52) {
  const s = size / 366;
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(5)})">
  <rect width="366" height="366" rx="71" fill="#5052B7"/>
  <rect x="81" y="65" width="79" height="79" rx="11" fill="#FEFEFE"/>
  <rect x="208.219" y="65.3521" width="79" height="79" rx="11" fill="#FEFEFE"/>
  <path d="M130.219 252.352C130.219 258.427 135.144 263.352 141.219 263.352H169.219V291.352C169.219 297.427 164.294 302.352 158.219 302.352H101.219C95.144 302.352 90.2191 297.427 90.2191 291.352V234.352C90.2191 228.277 95.144 223.352 101.219 223.352H130.219V252.352ZM169.219 212.352C169.219 218.427 174.144 223.352 180.219 223.352H209.219V252.352C209.219 258.427 204.294 263.352 198.219 263.352H169.219V234.352C169.219 228.277 164.294 223.352 158.219 223.352H130.219V195.352C130.219 189.277 135.144 184.352 141.219 184.352H169.219V212.352ZM208.219 173.352C208.219 179.427 213.144 184.352 219.219 184.352H248.219V212.352C248.219 218.427 243.294 223.352 237.219 223.352H209.219V195.352C209.219 189.277 204.294 184.352 198.219 184.352H169.219V155.352C169.219 149.277 174.144 144.352 180.219 144.352H208.219V173.352ZM276.219 105.352C282.294 105.352 287.219 110.277 287.219 116.352L287.219 173.352C287.219 179.427 282.294 184.352 276.219 184.352H248.219V155.352C248.219 149.277 243.294 144.352 237.219 144.352H208.219V116.352C208.219 110.277 213.144 105.352 219.219 105.352H276.219Z" fill="#FEFEFE"/>
</g>`;
}

function yumiDesktopIcon(x, y, size = 52, isDark = true) {
  const base = yumiIcon(x, y, size * 0.88);
  const bx = x + size * 0.56;
  const by = y + size * 0.56;
  const bw = size * 0.44;
  const bh = size * 0.44;
  const badgeBg = isDark ? '#181C30' : '#FFFFFF';
  const badgeStroke = isDark ? '#A8B1FF' : '#3B45AD';
  return `${base}
<g>
  <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="6" fill="${badgeBg}" stroke="${badgeStroke}" stroke-width="1.6"/>
  <rect x="${(bx + bw * 0.22).toFixed(1)}" y="${(by + bh * 0.24).toFixed(1)}" width="${(bw * 0.56).toFixed(1)}" height="${(bh * 0.36).toFixed(1)}" rx="1.5" fill="none" stroke="${badgeStroke}" stroke-width="1.5"/>
  <path d="M${(bx + bw * 0.35).toFixed(1)} ${(by + bh * 0.74).toFixed(1)} H${(bx + bw * 0.65).toFixed(1)}" stroke="${badgeStroke}" stroke-width="1.6" stroke-linecap="round"/>
</g>`;
}

function youcloudIcon(x, y, size = 52) {
  const s = size / 88;
  const tx = (x - 10 * s).toFixed(2);
  const ty = (y - 10 * s).toFixed(2);
  return `<g transform="translate(${tx} ${ty}) scale(${s.toFixed(5)})">
  <rect x="10" y="10" width="88" height="88" rx="26" fill="#DDAE7A"/>
  <g transform="translate(14.24 15.5) scale(0.16812)">
    <path fill="#9E7349" d="M133.03 346.16 c-17.04 -2.49 -32.47 -10.16 -44.99 -22.31 -12.75 -12.43 -19.95 -26.24 -22.96 -44.02 -0.88 -4.99 -0.97 -6.97 -0.74 -16.31 0.23 -10.99 0.69 -14.23 3.37 -22.63 2.45 -7.58 7.67 -17.28 12.80 -23.56 4.16 -5.17 11.92 -12.47 16.63 -15.66 9.15 -6.10 21.02 -10.99 30.53 -12.52 5.03 -0.83 6.88 -1.57 7.76 -3.14 0.32 -0.55 0.69 -3.97 0.92 -7.94 0.37 -8.31 1.66 -13.63 4.76 -19.59 6.42 -12.43 17.97 -20.88 32.01 -23.37 7.48 -1.34 18.38 -0.65 25.50 1.71 3.19 1.02 8.68 3.60 10.72 5.03 0.65 0.51 1.43 0.88 1.76 0.88 0.28 0 2.36 -1.66 4.57 -3.74 9.38 -8.64 20.56 -14.92 32.61 -18.38 8.50 -2.40 10.30 -2.59 24.94 -2.59 13.58 0 13.95 0.05 19.35 1.29 16.17 3.88 28.73 10.72 39.54 21.53 6.93 6.97 10.62 12.10 14.60 20.14 3.37 6.93 5.27 12.43 6.74 19.72 0.97 4.67 1.06 6.51 1.02 17 0 9.70 -0.18 12.66 -0.92 16.72 -1.29 7.02 -0.79 7.71 6.28 8.68 11.50 1.57 21.53 6.28 29.84 14 8.91 8.31 14.50 18.38 17.37 31.27 0.92 4.20 1.06 6.05 1.02 14.32 0 7.99 -0.14 10.21 -1.02 14.18 -5.31 24.57 -23.97 42.77 -49.89 48.73 l-4.48 1.02 -107.63 0.09 c-89.57 0.09 -108.37 0 -112.01 -0.55z m81.85 -34.32 c6.51 -2.49 11.41 -7.34 13.40 -13.35 1.02 -3 1.02 -3.70 1.20 -27.67 0.14 -20.28 0.28 -24.62 0.79 -24.62 0.32 0 7.76 -2.63 16.49 -5.82 36.86 -13.49 42.40 -15.43 44.48 -15.43 l2.08 0 0 19.40 0 19.40 -1.48 0 c-0.79 0 -2.77 -0.55 -4.43 -1.20 -10.35 -4.16 -23.10 0.97 -27.95 11.22 -1.29 2.73 -1.48 3.65 -1.48 6.88 0 3.33 0.18 4.02 1.76 7.21 4.16 8.50 13.95 13.58 23.10 12.01 6.97 -1.20 14.09 -6.37 16.72 -12.19 2.08 -4.62 2.12 -6.10 1.99 -48.18 -0.18 -43.05 -0.14 -41.80 -2.73 -47.21 -2.40 -4.94 -7.67 -8.64 -13.12 -9.19 -3.97 -0.37 -8.87 1.02 -25.87 7.34 -29.19 10.81 -32.10 12.19 -35.20 16.68 -3.19 4.67 -3.09 3.51 -3.28 38.52 l-0.14 31.50 -1.29 0 c-0.74 0 -2.45 -0.51 -3.79 -1.11 -6.05 -2.82 -12.29 -2.59 -18.85 0.69 -3.97 1.99 -7.99 5.77 -9.75 9.15 -5.13 10.12 0.79 22.13 12.98 26.19 4.34 1.43 10.21 1.34 14.37 -0.23z m-38.66 -57.97 c4.11 -1.06 7.76 -3.14 10.76 -6.14 3.42 -3.37 5.40 -7.25 6.10 -11.92 0.23 -1.76 0.46 -10.85 0.46 -20.19 l0 -17 2.17 0 c1.29 0 3.05 0.42 4.57 1.15 2.59 1.25 7.44 2.54 9.52 2.54 1.85 0 3.60 -0.92 4.34 -2.36 1.34 -2.59 -0.46 -3.93 -6.56 -4.80 -8.50 -1.29 -12.84 -5.22 -14.13 -12.84 -0.51 -3.19 -1.25 -4.57 -2.86 -5.68 -1.02 -0.65 -1.25 -0.65 -2.54 0.05 -2.82 1.43 -2.82 1.48 -2.82 22.68 l0 19.22 -1.71 -0.23 c-0.97 -0.09 -3.09 -0.79 -4.76 -1.52 -4.02 -1.76 -10.30 -1.89 -14.55 -0.28 -3.51 1.29 -8.41 4.62 -10.35 7.02 -2.12 2.68 -4.20 7.39 -4.53 10.25 -0.65 6.51 4.94 14.92 12.33 18.48 4.67 2.17 10.07 2.77 14.55 1.57z"/>
    <path fill="#DDAE7A" d="M132.66 353.09 c-28.08 -4.06 -53.77 -22.54 -66.38 -47.76 -11.73 -23.42 -12.47 -50.76 -1.94 -74.18 8.22 -18.25 23.23 -33.40 41.66 -42.03 5.31 -2.45 15.20 -5.82 19.68 -6.65 l3 -0.55 0.55 -5.59 c1.15 -12.01 4.71 -20.83 11.78 -29.65 6.84 -8.50 16.86 -14.78 28.45 -17.83 5.13 -1.39 16.86 -1.71 22.40 -0.69 5.50 1.06 10.85 2.82 15.06 4.90 l3.51 1.76 4.11 -3.46 c8.18 -6.79 16.35 -11.59 25.82 -15.15 23.70 -8.82 50.39 -7.58 73.03 3.42 28.18 13.77 46.01 40.19 48.22 71.55 0.46 6.19 0.05 16.12 -0.88 20.83 -0.79 4.11 -0.83 4.02 2.68 4.67 9.56 1.76 19.82 6.56 27.58 12.93 11.69 9.56 19.45 22.73 22.96 38.99 0.88 3.97 1.02 6.10 1.02 14.37 0 9.01 -0.09 10.07 -1.29 15.24 -4.94 21.06 -17.88 37.60 -37.23 47.53 -7.11 3.65 -12.33 5.50 -19.63 6.97 l-5.68 1.15 -107.07 -0.05 c-87.30 -0.05 -107.90 -0.18 -111.41 -0.69z m223.10 -8.87 c19.68 -4.53 35.61 -16.40 44.16 -32.84 5.03 -9.65 6.74 -16.91 6.74 -28.68 0 -6.79 -0.14 -8.87 -1.06 -12.93 -2.82 -12.84 -8.41 -22.96 -17.32 -31.27 -8.31 -7.71 -18.34 -12.43 -29.84 -14 -4.53 -0.60 -5.73 -1.15 -6.70 -2.96 -0.79 -1.48 -0.79 -1.76 0.28 -7.94 0.92 -5.45 1.11 -7.94 1.11 -16.35 0 -10.99 -0.74 -16.12 -3.51 -24.62 -1.89 -5.82 -6.65 -15.43 -10.16 -20.42 -4.39 -6.19 -13.44 -15.06 -19.54 -19.12 -8.82 -5.87 -18.01 -9.84 -28.73 -12.33 -5.31 -1.29 -5.91 -1.34 -17.97 -1.34 -10.35 0 -13.12 0.14 -16.40 0.83 -8.96 1.94 -14.69 3.93 -22.17 7.81 -6.42 3.28 -11.92 7.16 -17.83 12.52 -4.80 4.39 -5.77 4.76 -8.27 3.05 -2.40 -1.62 -8.18 -4.39 -11.32 -5.40 -21.66 -7.07 -44.57 2.03 -54.74 21.66 -3.09 5.96 -4.39 11.27 -4.76 19.59 -0.23 3.97 -0.60 7.39 -0.92 7.94 -0.88 1.57 -2.73 2.31 -7.76 3.14 -9.52 1.52 -21.39 6.42 -30.53 12.52 -4.71 3.19 -12.47 10.49 -16.63 15.66 -5.13 6.28 -10.35 15.98 -12.80 23.56 -2.49 7.94 -3.14 11.82 -3.37 21.25 -0.23 7.99 -0.09 10.02 0.74 14.92 3.05 17.83 10.21 31.59 22.96 44.02 12.52 12.15 27.95 19.82 44.99 22.31 3.65 0.55 22.22 0.65 110.63 0.55 l106.24 -0.09 4.48 -1.02z"/>
  </g>
</g>`;
}

function youcloudWebIcon(x, y, size = 50, isDark = true) {
  const base = youcloudIcon(x, y, size * 0.88);
  const cx = x + size * 0.78;
  const cy = y + size * 0.78;
  const r = size * 0.23;
  const bg = isDark ? '#1D151B' : '#FFFFFF';
  const stroke = isDark ? '#FF8B6A' : '#C04524';
  return `${base}
<g>
  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${bg}" stroke="${stroke}" stroke-width="1.6"/>
  <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.66).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="1.3"/>
  <line x1="${(cx - r * 0.66).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + r * 0.66).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${stroke}" stroke-width="1.3"/>
  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.66).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="1.3"/>
</g>`;
}

// 1) HERO BANNER (1200x350)
function buildHero(lang, theme) {
  const isDark = theme === 'dark';
  const c = isDark
    ? {
        bg0: '#12111C',
        bg1: '#1B182A',
        border: '#322C4D',
        tile: '#1C192C',
        tileStroke: '#383157',
        text: '#F3F0FF',
        muted: '#B5AFD1',
        eyebrowBg: '#1E1B30',
        eyebrowBorder: '#3C355E',
        eyebrowText: '#C9C2EB',
        dot: '#5FD4B4',
        handleBg: '#27223E',
        handleBorder: '#473E73',
        handleText: '#D2CBFF',
        pillBg: '#201C32',
        pillBorder: '#3B345B',
        pillText: '#E2DCFA',
        glow: '#6C5CE7',
      }
    : {
        bg0: '#F7F5FF',
        bg1: '#ECE8FE',
        border: '#CFC6F7',
        tile: '#FFFFFF',
        tileStroke: '#D9D2FA',
        text: '#1C1830',
        muted: '#4E476E',
        eyebrowBg: '#FFFFFF',
        eyebrowBorder: '#D2C9F8',
        eyebrowText: '#3F3766',
        dot: '#0D755D',
        handleBg: '#E6E0FC',
        handleBorder: '#C0B5F5',
        handleText: '#322670',
        pillBg: '#FFFFFF',
        pillBorder: '#D2C9F8',
        pillText: '#2E2754',
        glow: '#7A68F0',
      };

  const t = lang === 'ru'
    ? {
        eyebrow: 'ANDROID · TV · WINDOWS · MACOS · LINUX · WEB',
        bio: 'Независимые приложения в едином дизайне Material 3 Expressive: браузер на Chromium, самовосстанавливающийся VPN на Xray и музыкальная экосистема из трёх стримингов.',
        highlights: [
          'Material 3 Expressive',
          'Системная архитектура',
          'AI-Native инжиниринг',
          'Open Source (GPL-3.0)',
        ],
        tiles: [
          { name: 'Masaki', sub: 'Chromium · Win / Mac', hue: isDark ? '#5FD4B4' : '#0D755D', bg: isDark ? '#122220' : '#EAF8F4', stroke: isDark ? '#254C44' : '#A9DFD0', shape: 'clover4', icon: 'masaki' },
          { name: 'YouCloud', sub: 'Android 14+ · Web', hue: isDark ? '#E5B882' : '#8A551C', bg: isDark ? '#221B13' : '#FCF4EA', stroke: isDark ? '#4E3B25' : '#E7C8A4', shape: 'sunny8', icon: 'youcloud' },
          { name: 'Yumi', sub: 'Xray · Android & TV', hue: isDark ? '#F2B8A0' : '#9A3F1E', bg: isDark ? '#221613' : '#FDF1EC', stroke: isDark ? '#52342C' : '#ECC3B2', shape: 'cookie12', icon: 'yumi' },
          { name: 'Yumi Desktop', sub: 'Win · macOS · Linux', hue: isDark ? '#A8B1FF' : '#3B45AD', bg: isDark ? '#15182B' : '#EEF1FD', stroke: isDark ? '#323A69' : '#BEC6F7', shape: 'flower6', icon: 'yumiDesktop' },
        ],
      }
    : {
        eyebrow: 'ANDROID · TV · WINDOWS · MACOS · LINUX · WEB',
        bio: 'Independent apps united by Material 3 Expressive: a frosted-glass Chromium browser, a self-healing Xray VPN suite, and a unified three-service music ecosystem.',
        highlights: [
          'Material 3 Expressive',
          'Systems & UI Craft',
          'AI-Native Engineering',
          'Open Source (GPL-3.0)',
        ],
        tiles: [
          { name: 'Masaki', sub: 'Chromium · Win / Mac', hue: isDark ? '#5FD4B4' : '#0D755D', bg: isDark ? '#122220' : '#EAF8F4', stroke: isDark ? '#254C44' : '#A9DFD0', shape: 'clover4', icon: 'masaki' },
          { name: 'YouCloud', sub: 'Android 14+ · Web', hue: isDark ? '#E5B882' : '#8A551C', bg: isDark ? '#221B13' : '#FCF4EA', stroke: isDark ? '#4E3B25' : '#E7C8A4', shape: 'sunny8', icon: 'youcloud' },
          { name: 'Yumi', sub: 'Xray · Android & TV', hue: isDark ? '#F2B8A0' : '#9A3F1E', bg: isDark ? '#221613' : '#FDF1EC', stroke: isDark ? '#52342C' : '#ECC3B2', shape: 'cookie12', icon: 'yumi' },
          { name: 'Yumi Desktop', sub: 'Win · macOS · Linux', hue: isDark ? '#A8B1FF' : '#3B45AD', bg: isDark ? '#15182B' : '#EEF1FD', stroke: isDark ? '#323A69' : '#BEC6F7', shape: 'flower6', icon: 'yumiDesktop' },
        ],
      };

  const eyebrowW = Math.ceil(measureText(t.eyebrow, 11.5, true) + 42);
  const handleLabel = '@GXUser7 · Yumi Group';
  const handleW = Math.ceil(measureText(handleLabel, 13.5, true) + 28);
  const bioLines = wrapLines(t.bio, 700, 17.5, false);
  const bioSvg = renderLines(
    bioLines,
    44,
    182,
    26,
    `font-family="${UI_FONT}" font-size="17.5" font-weight="450" fill="${c.muted}"`
  );

  const pills = layoutPills(t.highlights, 44, 278, 730, {
    fontSize: 12,
    padX: 11,
    height: 31,
    gapX: 7,
    gapY: 8,
    isMono: false,
    fill: c.pillBg,
    stroke: c.pillBorder,
    textColor: c.pillText,
    fontWeight: '600',
    maxRows: 2,
  });

  const mIcon = masakiIcon(0, 0, 40, `heroMasaki_${lang}_${theme}`);

  const tileGrid = t.tiles
    .map((tile, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tx = 790 + col * 190;
      const ty = 34 + row * 144;
      const tw = 176;
      const th = 132;
      const bgShape = m3Polygon(SHAPE_FNS[tile.shape], tx + 132, ty + 48, 0.56, 140);
      let iconSvg = '';
      if (tile.icon === 'masaki') {
        iconSvg = `<g transform="translate(${tx + 16} ${ty + 16})">${mIcon.body}</g>`;
      } else if (tile.icon === 'youcloud') {
        iconSvg = youcloudIcon(tx + 16, ty + 16, 40);
      } else if (tile.icon === 'yumi') {
        iconSvg = yumiIcon(tx + 16, ty + 16, 40);
      } else {
        iconSvg = yumiDesktopIcon(tx + 16, ty + 16, 40, isDark);
      }
      return `<g>
  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="22" fill="${tile.bg}" stroke="${tile.stroke}" stroke-width="1.2"/>
  <path d="${bgShape}" fill="${tile.hue}" opacity="${isDark ? '0.13' : '0.16'}">
    <animateTransform attributeName="transform" type="rotate" from="0 ${tx + 132} ${ty + 48}" to="360 ${tx + 132} ${ty + 48}" dur="70s" repeatCount="indefinite"/>
  </path>
  ${iconSvg}
  <text x="${tx + 16}" y="${ty + 86}" font-family="${UI_FONT}" font-size="16" font-weight="750" fill="${c.text}">${esc(tile.name)}</text>
  <text x="${tx + 16}" y="${ty + 109}" font-family="${MONO_FONT}" font-size="11.2" font-weight="600" fill="${tile.hue}">${esc(tile.sub)}</text>
</g>`;
    })
    .join('\n');

  const ambientShape = m3Polygon(SHAPE_FNS.sunny8, 690, 290, 1.35, 160);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 350" width="1200" height="350" role="img" aria-label="DanyaKukich — Yumi Group">
  <defs>
    <linearGradient id="heroBg_${lang}_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg0}"/>
      <stop offset="100%" stop-color="${c.bg1}"/>
    </linearGradient>
    <radialGradient id="heroGlow_${lang}_${theme}" cx="22%" cy="18%" r="65%">
      <stop offset="0%" stop-color="${c.glow}" stop-opacity="${isDark ? '0.18' : '0.10'}"/>
      <stop offset="100%" stop-color="${c.glow}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="heroClip_${lang}_${theme}">
      <rect x="0" y="0" width="1200" height="350" rx="28"/>
    </clipPath>
    ${mIcon.defs}
  </defs>
  <g clip-path="url(#heroClip_${lang}_${theme})">
    <rect width="1200" height="350" rx="28" fill="url(#heroBg_${lang}_${theme})"/>
    <rect width="1200" height="350" rx="28" fill="url(#heroGlow_${lang}_${theme})"/>
    <path d="${ambientShape}" fill="${c.glow}" opacity="${isDark ? '0.07' : '0.08'}">
      <animateTransform attributeName="transform" type="rotate" from="0 690 290" to="360 690 290" dur="80s" repeatCount="indefinite"/>
    </path>

    <!-- Eyebrow -->
    <rect x="44" y="34" width="${eyebrowW}" height="28" rx="14" fill="${c.eyebrowBg}" stroke="${c.eyebrowBorder}" stroke-width="1"/>
    <circle cx="62" cy="48" r="4.5" fill="${c.dot}"/>
    <text x="76" y="52" font-family="${MONO_FONT}" font-size="11.5" font-weight="600" letter-spacing="0.4" fill="${c.eyebrowText}">${esc(t.eyebrow)}</text>

    <!-- Main Name + Handle -->
    <text x="44" y="128" font-family="${UI_FONT}" font-size="48" font-weight="800" letter-spacing="-0.8" fill="${c.text}">DanyaKukich</text>
    <rect x="358" y="94" width="${handleW}" height="34" rx="17" fill="${c.handleBg}" stroke="${c.handleBorder}" stroke-width="1.2"/>
    <text x="${(358 + handleW / 2).toFixed(1)}" y="115.5" text-anchor="middle" font-family="${MONO_FONT}" font-size="13.5" font-weight="700" fill="${c.handleText}">${esc(handleLabel)}</text>

    <!-- Bio -->
    ${bioSvg}

    <!-- Highlights -->
    ${pills.svg}

    <!-- Right 2x2 Mosaic -->
    ${tileGrid}
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="348.5" rx="27.25" fill="none" stroke="${c.border}" stroke-width="1.5"/>
</svg>`;
}

// 2-5) PROJECT CARDS (590x370)
function buildProjectCard(cfg, lang, theme) {
  const isDark = theme === 'dark';
  const pal = isDark ? cfg.dark : cfg.light;
  const copy = cfg[lang];

  const watermark = m3Polygon(SHAPE_FNS[cfg.shape], 515, 305, 1.35, 160);
  let defs = '';
  let iconBody = '';
  if (cfg.icon === 'masaki') {
    const ic = masakiIcon(28, 26, 50, `icon_${cfg.id}_${lang}_${theme}`);
    defs = ic.defs;
    iconBody = ic.body;
  } else if (cfg.icon === 'youcloud') {
    iconBody = youcloudIcon(28, 26, 50);
  } else if (cfg.icon === 'yumi') {
    iconBody = yumiIcon(28, 26, 50);
  } else if (cfg.icon === 'yumiDesktop') {
    iconBody = yumiDesktopIcon(28, 26, 50, isDark);
  }

  const summaryLines = wrapLines(copy.summary, 530, 14.8, false);
  const summarySvg = renderLines(
    summaryLines,
    28,
    114,
    20.5,
    `font-family="${UI_FONT}" font-size="14.8" font-weight="500" fill="${pal.text}"`
  );

  const dividerY = 104 + summaryLines.length * 20.5 + 10;

  let bulletY = dividerY + 20;
  const bulletBlocks = copy.bullets.map((b) => {
    const lines = wrapLines(b, 506, 13.8, false);
    const dotY = bulletY - 4.5;
    const textSvg = renderLines(
      lines,
      48,
      bulletY,
      18.5,
      `font-family="${UI_FONT}" font-size="13.8" font-weight="430" fill="${pal.muted}"`
    );
    const block = `<circle cx="34" cy="${dotY.toFixed(1)}" r="3.5" fill="${pal.accent}"/>\n${textSvg}`;
    bulletY += lines.length * 18.5 + 8;
    return block;
  }).join('\n');

  // Bottom pills (compute row count so pills always sit cleanly at bottom)
  const pillOpts = {
    fontSize: 10.4,
    padX: 7,
    height: 24,
    gapX: 5,
    gapY: 6,
    isMono: true,
    maxRows: 2,
  };
  const testLayout = layoutPills(cfg.chips, 28, 0, 534, pillOpts);
  const pillStartY = testLayout.rows === 1 ? 320 : 290;
  const pills = layoutPills(cfg.chips, 28, pillStartY, 534, {
    ...pillOpts,
    fill: pal.chipBg,
    stroke: pal.chipBorder,
    textColor: pal.chipText,
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 590 370" width="590" height="370" role="img" aria-label="${esc(cfg.title)}">
  <defs>
    <linearGradient id="cardBg_${cfg.id}_${lang}_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.bg0}"/>
      <stop offset="100%" stop-color="${pal.bg1}"/>
    </linearGradient>
    <radialGradient id="cardGlow_${cfg.id}_${lang}_${theme}" cx="15%" cy="15%" r="70%">
      <stop offset="0%" stop-color="${pal.accent}" stop-opacity="${isDark ? '0.14' : '0.09'}"/>
      <stop offset="100%" stop-color="${pal.accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="cardClip_${cfg.id}_${lang}_${theme}">
      <rect x="0" y="0" width="590" height="370" rx="26"/>
    </clipPath>
    ${defs}
  </defs>
  <g clip-path="url(#cardClip_${cfg.id}_${lang}_${theme})">
    <rect width="590" height="370" rx="26" fill="url(#cardBg_${cfg.id}_${lang}_${theme})"/>
    <rect width="590" height="370" rx="26" fill="url(#cardGlow_${cfg.id}_${lang}_${theme})"/>
    <path d="${watermark}" fill="${pal.accent}" opacity="${isDark ? '0.08' : '0.10'}">
      <animateTransform attributeName="transform" type="rotate" from="0 515 305" to="360 515 305" dur="65s" repeatCount="indefinite"/>
    </path>

    <!-- Header -->
    ${iconBody}
    <text x="92" y="48" font-family="${UI_FONT}" font-size="24" font-weight="800" letter-spacing="-0.3" fill="${pal.text}">${esc(cfg.title)}</text>
    <text x="92" y="70" font-family="${MONO_FONT}" font-size="12" font-weight="600" fill="${pal.accent}">${esc(copy.kicker)}</text>

    <!-- Arrow Badge -->
    <rect x="526" y="26" width="36" height="36" rx="18" fill="${pal.chipBg}" stroke="${pal.chipBorder}" stroke-width="1"/>
    <path d="M539 49 L549 39 M541 39 H549 V47" fill="none" stroke="${pal.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Summary -->
    ${summarySvg}

    <line x1="28" y1="${dividerY.toFixed(1)}" x2="562" y2="${dividerY.toFixed(1)}" stroke="${pal.border}" stroke-width="1" opacity="0.7"/>

    <!-- Bullets -->
    ${bulletBlocks}

    <!-- Stack Chips -->
    ${pills.svg}
  </g>
  <rect x="0.75" y="0.75" width="588.5" height="368.5" rx="25.25" fill="none" stroke="${pal.border}" stroke-width="1.5"/>
</svg>`;
}

const PROJECT_CARDS = [
  {
    id: 'masaki',
    title: 'Masaki',
    shape: 'clover4',
    icon: 'masaki',
    chips: ['TypeScript 7', 'Electron 44', 'React 19', 'Zustand 5', 'M3 Expressive', 'Playwright'],
    dark: {
      bg0: '#0F1C1A',
      bg1: '#152724',
      border: '#274B44',
      accent: '#5FD4B4',
      text: '#EDFDF8',
      muted: '#B4D7CE',
      chipBg: '#162D28',
      chipBorder: '#2C594F',
      chipText: '#B7F4E3',
    },
    light: {
      bg0: '#F1FBF8',
      bg1: '#E3F6F0',
      border: '#ABDED0',
      accent: '#0B735B',
      text: '#0E241F',
      muted: '#2D524A',
      chipBg: '#FFFFFF',
      chipBorder: '#B1E2D4',
      chipText: '#0A5E4B',
    },
    ru: {
      kicker: 'Браузер на Chromium · Win / macOS',
      summary: 'Матовое стекло поверх обоев, тихая панель и док, единая палитра команд и часы с Pixel.',
      bullets: [
        'Свой менеджер паролей и WebAuthn passkey без Windows Hello (DPAPI)',
        'E2EE-синхронизация (AES-256-GCM) через личный Google Диск',
        'Встроенный мост YouCloud и порт 9222 для ИИ-агентов (MCP)',
      ],
    },
    en: {
      kicker: 'Chromium Browser · Win / macOS',
      summary: 'Frosted glass over your wallpaper, sidebar & bottom dock, command palette & Pixel clocks.',
      bullets: [
        'Built-in passwords & custom WebAuthn passkey manager (DPAPI)',
        'AES-256-GCM encrypted sync stored on your own Google Drive',
        'Native YouCloud bridge & port 9222 for AI agents (DevTools MCP)',
      ],
    },
  },
  {
    id: 'youcloud',
    title: 'YouCloud',
    shape: 'sunny8',
    icon: 'youcloud',
    chips: ['Kotlin 2.1', 'Jetpack Compose', 'Media3', 'GRU DSP', 'Supabase', 'Glance'],
    dark: {
      bg0: '#1C1610',
      bg1: '#261D14',
      border: '#4A3925',
      accent: '#E5B882',
      text: '#FFF6EC',
      muted: '#DEC8AF',
      chipBg: '#2B2016',
      chipBorder: '#57422A',
      chipText: '#F5D5AF',
    },
    light: {
      bg0: '#FDF7F0',
      bg1: '#F7ECE0',
      border: '#E5C6A3',
      accent: '#8C5418',
      text: '#291B0C',
      muted: '#5D442B',
      chipBg: '#FFFFFF',
      chipBorder: '#E5C7A6',
      chipText: '#754512',
    },
    ru: {
      kicker: 'Музыкальный плеер · Android 14+',
      summary: 'SoundCloud, Яндекс Музыка и YouTube Music в одной медиатеке с цветами обложки и Ambilight.',
      bullets: [
        '+AI в аудиоцепочке: своя GRU-модель на Kotlin достраивает верхние частоты',
        '«Слушать вместе» по Bluetooth / Wi-Fi Direct со сверкой часов телефонов',
        'Офлайн-кэш, клипы VP9, эфиры с чатом, друзья в Supabase и Google Cast',
      ],
    },
    en: {
      kicker: 'Unified Music Player · Android 14+',
      summary: 'SoundCloud, Yandex Music & YouTube Music in one library with cover palettes & Ambilight.',
      bullets: [
        'Real-time +AI audio restoration via custom pure-Kotlin GRU neural DSP',
        'Offline P2P Listen Together over Nearby Connections with clock sync',
        'VP9 clips, live stream chat, Dual-ExoPlayer crossfade, Supabase & Cast',
      ],
    },
  },
  {
    id: 'yumi',
    title: 'Yumi',
    shape: 'cookie12',
    icon: 'yumi',
    chips: ['Kotlin 2.2', 'Jetpack Compose', 'M3 Expressive', 'Xray-core', 'Android TV'],
    dark: {
      bg0: '#1D1310',
      bg1: '#271A15',
      border: '#50342B',
      accent: '#F2B8A0',
      text: '#FFF4F0',
      muted: '#DEC0B6',
      chipBg: '#2C1D18',
      chipBorder: '#5D3C32',
      chipText: '#FAD2C2',
    },
    light: {
      bg0: '#FDF5F2',
      bg1: '#F9E8E1',
      border: '#E8BEB0',
      accent: '#9A3F1E',
      text: '#29140E',
      muted: '#623D31',
      chipBg: '#FFFFFF',
      chipBorder: '#E8C0B2',
      chipText: '#823417',
    },
    ru: {
      kicker: 'VPN на ядре Xray · Android и ТВ',
      summary: 'Туннель, который чинится сам: проверяет реальный поток данных и меняет сервер без обрыва.',
      bullets: [
        'VLESS, REALITY, Vision, XHTTP, Hysteria2, WireGuard; Clash YAML и JSON',
        'Проверка живого DNS внутри туннеля с автопереходом на 1.1.1.1',
        'Отдельное приложение для Android TV и телефон-пульт по сети',
      ],
    },
    en: {
      kicker: 'Self-Healing Xray VPN · Android & TV',
      summary: 'Verifies real traffic every 20s and hot-swaps dead nodes inside Xray without dropping state.',
      bullets: [
        'VLESS (REALITY / Vision / XHTTP), Hysteria2, WireGuard, Clash & JSON',
        'In-tunnel DNS health probes with automatic 1.1.1.1 failover & RU routing',
        'Dedicated Android TV app with QR pairing & LAN Phone-as-Remote',
      ],
    },
  },
  {
    id: 'yumi-desktop',
    title: 'Yumi Desktop',
    shape: 'flower6',
    icon: 'yumiDesktop',
    chips: ['Kotlin 2.3', 'Compose Desktop', 'Go 1.26', 'Xray-core', 'WFP / nftables / pf'],
    dark: {
      bg0: '#121524',
      bg1: '#191E33',
      border: '#323A66',
      accent: '#A8B1FF',
      text: '#F2F4FF',
      muted: '#BDC3E6',
      chipBg: '#1B2038',
      chipBorder: '#3C467A',
      chipText: '#CED4FF',
    },
    light: {
      bg0: '#F4F6FE',
      bg1: '#E8ECFC',
      border: '#BEC6F7',
      accent: '#3B45AD',
      text: '#131630',
      muted: '#3D4470',
      chipBg: '#FFFFFF',
      chipBorder: '#C1C9F7',
      chipText: '#2F3894',
    },
    ru: {
      kicker: 'Десктопный VPN · Win / macOS / Linux',
      summary: 'Матовое стекло с фигурами на пружинках и разделение прав: интерфейс + служба на Go.',
      bullets: [
        'Килл-свитч и DNS-замок на уровне ядра ОС: динамический WFP, nftables и pf',
        '«Местоположение — как у сервера» (таймзона + блок геолокации ОС)',
        'Раздельное туннелирование приложений, RU-обход и QR-импорт с телефона',
      ],
    },
    en: {
      kicker: 'Desktop VPN & Daemon · Win / Mac / Linux',
      summary: 'Frosted glass UI with spring-driven shapes backed by a SID/UID-locked Go tunnel daemon.',
      bullets: [
        'Kernel-level Kill Switch & DNS lock via Windows WFP, nftables & macOS pf',
        '"Location as Server" mode: live timezone sync & OS location silencing',
        'Per-app split tunneling, geoip/geosite direct rules & LAN QR import',
      ],
    },
  },
];

// 6) YOUCLOUD WEB PANORAMIC CARD (1200x285)
function buildYouCloudWeb(lang, theme) {
  const isDark = theme === 'dark';
  const c = isDark
    ? {
        bg0: '#16131C',
        bg1: '#221A24',
        border: '#493748',
        accent: '#E5B882',
        coral: '#FF8B6A',
        mint: '#5FD4B4',
        text: '#FCF5F2',
        muted: '#D5C3CC',
        panelBg: '#1D1724',
        panelBorder: '#3F3047',
        nodeBg: '#251E2E',
        nodeBorder: '#4D3B56',
        chipBg: '#231B26',
        chipBorder: '#4B394D',
        chipText: '#F0D3B4',
      }
    : {
        bg0: '#FCF7FA',
        bg1: '#F5ECF4',
        border: '#DEC4D6',
        accent: '#8C5418',
        coral: '#C04524',
        mint: '#0B735B',
        text: '#261722',
        muted: '#573F4E',
        panelBg: '#FFFFFF',
        panelBorder: '#E0C8D9',
        nodeBg: '#F9F4F8',
        nodeBorder: '#D8BDD0',
        chipBg: '#FFFFFF',
        chipBorder: '#DFC5D7',
        chipText: '#6F3E12',
      };

  const t = lang === 'ru'
    ? {
        live: 'youcloud.inkerror67.workers.dev ↗',
        summary: 'Вся медиатека YouCloud в браузере: Svelte 5 SPA + прокси на Cloudflare с переписыванием HLS, живая волна от бочки (40–130 Гц) и предзагрузка очереди.',
        bullets: [
          'Расширение MV3: Яндекс и YouTube с домашнего IP + автопродление сессий',
          'Go-помощник (Native Messaging): потоки yt-dlp + Deno и Rich Presence в Discord',
          'В браузере Masaki работает нативно на стекле окна — без расширения',
        ],
        nodes: [
          { title: 'Svelte 5 SPA + Web Audio DSP', sub: 'Бочка 40–130 Гц · предзагрузка очереди', color: c.coral },
          { title: 'Cloudflare Edge Worker (/x/*)', sub: 'Прокси запросов + переписывание HLS-плейлистов', color: c.accent },
          { title: 'MV3 Bridge + Go Helper / Masaki', sub: 'Домашний IP · yt-dlp + Deno · Discord IPC', color: c.mint },
        ],
        chips: ['Svelte 5', 'Vite 8', 'TypeScript', 'CF Workers', 'Web Audio', 'HLS.js', 'MV3', 'Go Helper'],
      }
    : {
        live: 'youcloud.inkerror67.workers.dev ↗',
        summary: 'Full YouCloud library in the browser: Svelte 5 SPA + Cloudflare Edge Worker with HLS rewriting, 40–130 Hz bass-reactive Web Audio wave & track prebuffering.',
        bullets: [
          'MV3 Extension: residential-IP Yandex/YouTube requests, SAPISIDHASH & OAuth renewal',
          'Go Native Messaging Helper: yt-dlp + Deno stream fetch & Discord Rich Presence',
          'Zero-extension native glass integration inside the Masaki browser',
        ],
        nodes: [
          { title: 'Svelte 5 SPA + Web Audio DSP', sub: '40–130 Hz kick detector · 2-track prebuffer', color: c.coral },
          { title: 'Cloudflare Edge Worker (/x/*)', sub: 'Stateless proxy + live HLS playlist rewriter', color: c.accent },
          { title: 'MV3 Bridge + Go Helper / Masaki', sub: 'Residential IP · yt-dlp + Deno · Discord IPC', color: c.mint },
        ],
        chips: ['Svelte 5', 'Vite 8', 'TypeScript', 'CF Workers', 'Web Audio', 'HLS.js', 'MV3', 'Go Helper'],
      };

  const liveW = Math.ceil(measureText(t.live, 11.5, true) + 34);
  const summaryLines = wrapLines(t.summary, 690, 14.3, false);
  const summarySvg = renderLines(
    summaryLines,
    34,
    102,
    19.5,
    `font-family="${UI_FONT}" font-size="14.3" font-weight="480" fill="${c.text}"`
  );

  let bulletY = 148;
  const bulletsSvg = t.bullets
    .map((b) => {
      const html = `<circle cx="40" cy="${bulletY - 4}" r="3.4" fill="${c.coral}"/>
<text x="53" y="${bulletY}" font-family="${UI_FONT}" font-size="13.4" font-weight="430" fill="${c.muted}">${esc(b)}</text>`;
      bulletY += 21.5;
      return html;
    })
    .join('\n');

  const chips = layoutPills(t.chips, 34, 232, 705, {
    fontSize: 10.8,
    padX: 8.5,
    height: 24,
    gapX: 5.5,
    gapY: 6,
    isMono: true,
    fill: c.chipBg,
    stroke: c.chipBorder,
    textColor: c.chipText,
    maxRows: 1,
  });

  const nodesSvg = t.nodes
    .map((n, i) => {
      const ny = 36 + i * 74;
      const arrow = i < 2
        ? `<line x1="955" y1="${ny + 58}" x2="955" y2="${ny + 74}" stroke="${c.accent}" stroke-width="1.6" stroke-dasharray="3 2"/>`
        : '';
      // Equalizer bars on node 0
      const eq = i === 0
        ? `<g transform="translate(1105 ${ny + 18})">
  <rect x="0" y="10" width="4" height="14" rx="2" fill="${c.coral}">
    <animate attributeName="height" values="14;22;8;14" dur="1.4s" repeatCount="indefinite"/>
    <animate attributeName="y" values="10;2;16;10" dur="1.4s" repeatCount="indefinite"/>
  </rect>
  <rect x="7" y="4" width="4" height="20" rx="2" fill="${c.accent}">
    <animate attributeName="height" values="20;10;22;20" dur="1.1s" repeatCount="indefinite"/>
    <animate attributeName="y" values="4;14;2;4" dur="1.1s" repeatCount="indefinite"/>
  </rect>
  <rect x="14" y="8" width="4" height="16" rx="2" fill="${c.mint}">
    <animate attributeName="height" values="16;22;10;16" dur="1.6s" repeatCount="indefinite"/>
    <animate attributeName="y" values="8;2;14;8" dur="1.6s" repeatCount="indefinite"/>
  </rect>
  <rect x="21" y="12" width="4" height="12" rx="2" fill="${c.coral}">
    <animate attributeName="height" values="12;19;7;12" dur="1.3s" repeatCount="indefinite"/>
    <animate attributeName="y" values="12;5;17;12" dur="1.3s" repeatCount="indefinite"/>
  </rect>
</g>`
        : `<circle cx="1126" cy="${ny + 29}" r="5" fill="${n.color}" opacity="0.85"/>`;

      return `<g>
  <rect x="766" y="${ny}" width="382" height="58" rx="15" fill="${c.nodeBg}" stroke="${c.nodeBorder}" stroke-width="1.2"/>
  <rect x="778" y="${ny + 14}" width="4" height="30" rx="2" fill="${n.color}"/>
  <text x="792" y="${ny + 25}" font-family="${UI_FONT}" font-size="13.8" font-weight="750" fill="${c.text}">${esc(n.title)}</text>
  <text x="792" y="${ny + 44}" font-family="${MONO_FONT}" font-size="10.8" font-weight="500" fill="${c.muted}">${esc(n.sub)}</text>
  ${eq}
</g>
${arrow}`;
    })
    .join('\n');

  const watermark = m3Polygon(SHAPE_FNS.sunny8, 695, 255, 1.15, 160);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 285" width="1200" height="285" role="img" aria-label="YouCloud Web">
  <defs>
    <linearGradient id="ycwBg_${lang}_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg0}"/>
      <stop offset="100%" stop-color="${c.bg1}"/>
    </linearGradient>
    <clipPath id="ycwClip_${lang}_${theme}">
      <rect x="0" y="0" width="1200" height="285" rx="26"/>
    </clipPath>
  </defs>
  <g clip-path="url(#ycwClip_${lang}_${theme})">
    <rect width="1200" height="285" rx="26" fill="url(#ycwBg_${lang}_${theme})"/>
    <path d="${watermark}" fill="${c.accent}" opacity="${isDark ? '0.07' : '0.09'}">
      <animateTransform attributeName="transform" type="rotate" from="0 695 255" to="360 695 255" dur="70s" repeatCount="indefinite"/>
    </path>

    <!-- Header -->
    ${youcloudWebIcon(34, 24, 48, isDark)}
    <text x="96" y="45" font-family="${UI_FONT}" font-size="24" font-weight="800" fill="${c.text}">YouCloud Web</text>
    <rect x="96" y="54" width="${liveW}" height="22" rx="11" fill="${c.nodeBg}" stroke="${c.nodeBorder}" stroke-width="1"/>
    <circle cx="109" cy="65" r="3.5" fill="${c.mint}"/>
    <text x="119" y="69" font-family="${MONO_FONT}" font-size="11.2" font-weight="600" fill="${c.accent}">${esc(t.live)}</text>

    ${summarySvg}
    ${bulletsSvg}
    ${chips.svg}

    <!-- Right Architecture Panel -->
    <rect x="748" y="20" width="418" height="245" rx="20" fill="${c.panelBg}" stroke="${c.panelBorder}" stroke-width="1.2"/>
    ${nodesSvg}
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="283.5" rx="25.25" fill="none" stroke="${c.border}" stroke-width="1.5"/>
</svg>`;
}

// 7) AI-NATIVE WORKFLOW (1200x320)
function buildAiWorkflow(lang, theme) {
  const isDark = theme === 'dark';
  const c = isDark
    ? {
        bg0: '#13131E',
        bg1: '#1A1828',
        border: '#322E4B',
        text: '#F3F1FF',
        muted: '#B6B1D1',
        eyebrow: '#A8B1FF',
        pipeBg: '#1D1B2D',
        pipeBorder: '#3B365C',
        agents: [
          {
            name: 'Claude Code',
            role: 'CLAUDE.md · DevTools MCP',
            accent: '#E89274',
            bg: '#211819',
            border: '#4E342E',
            chipBg: '#2B1E1C',
            chipBorder: '#5D3C34',
            chipText: '#FAD2C2',
            glyph: 'terminal',
          },
          {
            name: 'OpenAI Codex',
            role: 'AGENTS.md · Sandboxed QA',
            accent: '#5FD4B4',
            bg: '#13201E',
            border: '#274B44',
            chipBg: '#182D28',
            chipBorder: '#2D5C51',
            chipText: '#B7F4E3',
            glyph: 'braces',
          },
          {
            name: 'Google Antigravity',
            role: 'Orchestrator · Custom Skills',
            accent: '#B8B0FF',
            bg: '#19172A',
            border: '#3A3463',
            chipBg: '#221E3A',
            chipBorder: '#49417B',
            chipText: '#DCD7FF',
            glyph: 'spark',
          },
        ],
      }
    : {
        bg0: '#F7F6FC',
        bg1: '#EFEBF9',
        border: '#CFC9EC',
        text: '#1B182E',
        muted: '#4C4669',
        eyebrow: '#4B3EB8',
        pipeBg: '#FFFFFF',
        pipeBorder: '#D2CBEE',
        agents: [
          {
            name: 'Claude Code',
            role: 'CLAUDE.md · DevTools MCP',
            accent: '#9E4224',
            bg: '#FDF5F2',
            border: '#E9C2B5',
            chipBg: '#FFFFFF',
            chipBorder: '#E7C0B3',
            chipText: '#85351A',
            glyph: 'terminal',
          },
          {
            name: 'OpenAI Codex',
            role: 'AGENTS.md · Sandboxed QA',
            accent: '#0B735B',
            bg: '#F1FBF8',
            border: '#ADE0D1',
            chipBg: '#FFFFFF',
            chipBorder: '#AEDFD1',
            chipText: '#0A5E4B',
            glyph: 'braces',
          },
          {
            name: 'Google Antigravity',
            role: 'Orchestrator · Custom Skills',
            accent: '#4B3EB8',
            bg: '#F4F2FE',
            border: '#C6BFFA',
            chipBg: '#FFFFFF',
            chipBorder: '#C7C0FA',
            chipText: '#3A2E9C',
            glyph: 'spark',
          },
        ],
      };

  const t = lang === 'ru'
    ? {
        eyebrow: 'AI-NATIVE ИНЖИНИРИНГ · АГЕНТНЫЙ ПАЙПЛАЙН РАЗРАБОТКИ',
        title: 'Инструменты и оркестрация ИИ',
        cols: [
          {
            desc: 'Архитектура сложных модулей, контракты CLAUDE.md и живая отладка во вкладках Masaki через chrome-devtools-mcp (:9222).',
            chips: ['CLAUDE.md', 'DevTools MCP', 'Port 9222'],
          },
          {
            desc: 'Автономная реализация задач по AGENTS.md, кроссплатформенные сетевые демоны и прогон регрессионных тестов.',
            chips: ['AGENTS.md', 'Sandboxed QA', 'Playwright E2E'],
          },
          {
            desc: 'Двухфазное планирование и исполнение (Orchestrator), исследование многих репозиториев и единый дизайн.',
            chips: ['Orchestrator', 'Multi-Repo', 'Custom Skills'],
          },
        ],
        pipeline: 'Дизайн M3 Expressive  →  Контракты CLAUDE.md / AGENTS.md  →  Claude Code · Codex · Antigravity + MCP  →  20+ автотестов',
      }
    : {
        eyebrow: 'AI-NATIVE ENGINEERING · MULTI-AGENT WORKFLOW',
        title: 'AI Agents & Orchestration',
        cols: [
          {
            desc: 'Deep multi-module architecture, CLAUDE.md contracts, and live tab automation inside Masaki via chrome-devtools-mcp (:9222).',
            chips: ['CLAUDE.md', 'DevTools MCP', 'Port 9222'],
          },
          {
            desc: 'Autonomous task execution governed by AGENTS.md, cross-platform Go tunnel daemons, and E2E regression suites.',
            chips: ['AGENTS.md', 'Sandboxed QA', 'Playwright E2E'],
          },
          {
            desc: 'Two-phase Plan & Execute orchestration, cross-repository research, and unified Material 3 Expressive craft.',
            chips: ['Orchestrator', 'Multi-Repo', 'Custom Skills'],
          },
        ],
        pipeline: 'M3 Expressive Craft  →  CLAUDE.md / AGENTS.md Specs  →  Claude Code · Codex · Antigravity + MCP  →  20+ Automated Suites',
      };

  const colSvg = c.agents
    .map((ag, idx) => {
      const x = 32 + idx * 386;
      const y = 88;
      const w = 364;
      const h = 164;
      const descLines = wrapLines(t.cols[idx].desc, 326, 13.5, false);
      const descSvg = renderLines(
        descLines,
        x + 18,
        y + 72,
        18.2,
        `font-family="${UI_FONT}" font-size="13.5" font-weight="440" fill="${c.muted}"`
      );
      const chips = layoutPills(t.cols[idx].chips, x + 18, y + 128, 328, {
        fontSize: 11,
        padX: 9,
        height: 23,
        gapX: 6,
        gapY: 6,
        isMono: true,
        fill: ag.chipBg,
        stroke: ag.chipBorder,
        textColor: ag.chipText,
        maxRows: 1,
      });

      let glyph = '';
      const gx = x + 18;
      const gy = y + 16;
      if (ag.glyph === 'terminal') {
        glyph = `<rect x="${gx}" y="${gy}" width="34" height="34" rx="10" fill="${ag.chipBg}" stroke="${ag.chipBorder}"/>
<path d="M${gx + 10} ${gy + 12} L${gx + 16} ${gy + 17} L${gx + 10} ${gy + 22} M${gx + 18} ${gy + 22} H${gx + 25}" fill="none" stroke="${ag.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (ag.glyph === 'braces') {
        glyph = `<rect x="${gx}" y="${gy}" width="34" height="34" rx="10" fill="${ag.chipBg}" stroke="${ag.chipBorder}"/>
<text x="${gx + 17}" y="${gy + 22}" text-anchor="middle" font-family="${MONO_FONT}" font-size="15" font-weight="800" fill="${ag.accent}">{}</text>`;
      } else {
        glyph = `<rect x="${gx}" y="${gy}" width="34" height="34" rx="10" fill="${ag.chipBg}" stroke="${ag.chipBorder}"/>
<path d="M${gx + 17} ${gy + 7} L${gx + 19.6} ${gy + 14.4} L${gx + 27} ${gy + 17} L${gx + 19.6} ${gy + 19.6} L${gx + 17} ${gy + 27} L${gx + 14.4} ${gy + 19.6} L${gx + 7} ${gy + 17} L${gx + 14.4} ${gy + 14.4} Z" fill="${ag.accent}"/>`;
      }

      return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${ag.bg}" stroke="${ag.border}" stroke-width="1.2"/>
  ${glyph}
  <text x="${x + 62}" y="${y + 31}" font-family="${UI_FONT}" font-size="17" font-weight="800" fill="${c.text}">${esc(ag.name)}</text>
  <text x="${x + 62}" y="${y + 49}" font-family="${MONO_FONT}" font-size="10.8" font-weight="600" fill="${ag.accent}">${esc(ag.role)}</text>
  ${descSvg}
  ${chips.svg}
</g>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" width="1200" height="320" role="img" aria-label="${esc(t.title)}">
  <defs>
    <linearGradient id="aiBg_${lang}_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg0}"/>
      <stop offset="100%" stop-color="${c.bg1}"/>
    </linearGradient>
    <clipPath id="aiClip_${lang}_${theme}">
      <rect x="0" y="0" width="1200" height="320" rx="26"/>
    </clipPath>
  </defs>
  <g clip-path="url(#aiClip_${lang}_${theme})">
    <rect width="1200" height="320" rx="26" fill="url(#aiBg_${lang}_${theme})"/>

    <text x="32" y="38" font-family="${MONO_FONT}" font-size="11.5" font-weight="700" letter-spacing="0.6" fill="${c.eyebrow}">${esc(t.eyebrow)}</text>
    <text x="32" y="68" font-family="${UI_FONT}" font-size="24" font-weight="800" fill="${c.text}">${esc(t.title)}</text>

    ${colSvg}

    <!-- Pipeline Footer Strip -->
    <rect x="32" y="266" width="1136" height="34" rx="17" fill="${c.pipeBg}" stroke="${c.pipeBorder}" stroke-width="1"/>
    <text x="600" y="287" text-anchor="middle" font-family="${MONO_FONT}" font-size="12" font-weight="600" fill="${c.muted}">${esc(t.pipeline)}</text>
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="318.5" rx="25.25" fill="none" stroke="${c.border}" stroke-width="1.5"/>
</svg>`;
}

// 8) TECH STACK MATRIX (1200x360)
function buildTechStack(lang, theme) {
  const isDark = theme === 'dark';
  const c = isDark
    ? {
        bg0: '#12131B',
        bg1: '#181A26',
        border: '#2D3248',
        text: '#F2F4FC',
        eyebrow: '#A8B1FF',
        tiles: [
          { accent: '#F2B8A0', bg: '#1D1412', border: '#4A312A', chipBg: '#281B18', chipBorder: '#593B32', chipText: '#FAD2C2' },
          { accent: '#5FD4B4', bg: '#101C1A', border: '#254740', chipBg: '#162925', chipBorder: '#2C564D', chipText: '#B7F4E3' },
          { accent: '#A8B1FF', bg: '#131624', border: '#2E365E', chipBg: '#1B2036', chipBorder: '#3A4475', chipText: '#CED4FF' },
          { accent: '#E5B882', bg: '#1B1611', border: '#473724', chipBg: '#271F17', chipBorder: '#57432B', chipText: '#F5D5AF' },
        ],
      }
    : {
        bg0: '#F7F8FC',
        bg1: '#EEF0F8',
        border: '#CDD2E6',
        text: '#161826',
        eyebrow: '#3B45AD',
        tiles: [
          { accent: '#9A3F1E', bg: '#FDF5F2', border: '#E8BEB0', chipBg: '#FFFFFF', chipBorder: '#E8C0B2', chipText: '#823417' },
          { accent: '#0B735B', bg: '#F1FBF8', border: '#ABDED0', chipBg: '#FFFFFF', chipBorder: '#B1E2D4', chipText: '#0A5E4B' },
          { accent: '#3B45AD', bg: '#F4F6FE', border: '#BEC6F7', chipBg: '#FFFFFF', chipBorder: '#C1C9F7', chipText: '#2F3894' },
          { accent: '#8C5418', bg: '#FDF7F0', border: '#E5C6A3', chipBg: '#FFFFFF', chipBorder: '#E5C7A6', chipText: '#754512' },
        ],
      };

  const t = lang === 'ru'
    ? {
        eyebrow: 'СТЕК ТЕХНОЛОГИЙ · ОТ ЯДРА ОС ДО EDGE И НЕЙРОСЕТЕВОГО АУДИО',
        title: 'Полная матрица технологий',
        groups: [
          {
            name: 'Android, ТВ и Multiplatform',
            pills: ['Kotlin 2.1–2.3', 'Jetpack Compose', 'Compose Multiplatform', 'Material 3 Expressive', 'Media3 ExoPlayer', 'Jetpack Glance', 'Nearby Connections', 'Google Cast'],
          },
          {
            name: 'Браузер, десктоп и веб',
            pills: ['TypeScript 7', 'Electron 44 (Chromium)', 'React 19', 'Svelte 5', 'Vite 8', 'Zustand 5', 'Web Audio API', 'HLS.js', 'Manifest V3'],
          },
          {
            name: 'Системные службы, сеть и защита',
            pills: ['Go 1.26', 'Xray-core', 'VLESS / REALITY / XHTTP / Hysteria2', 'Windows WFP', 'nftables & pf', 'WebAuthn Passkeys', 'DPAPI & AES-256-GCM', 'Named Pipes & Unix Sockets'],
          },
          {
            name: 'Облако, аудио-ML и автотесты',
            pills: ['Cloudflare Workers & Wrangler', 'Supabase (Auth / PostgREST / Realtime)', 'Python', 'On-Device GRU Audio DSP', 'yt-dlp', 'Playwright', 'Gradle & GitHub Actions'],
          },
        ],
      }
    : {
        eyebrow: 'TECHNOLOGY STACK · FROM OS KERNEL DAEMONS TO EDGE & AUDIO DSP',
        title: 'Full Technology Matrix',
        groups: [
          {
            name: 'Android, TV & Multiplatform',
            pills: ['Kotlin 2.1–2.3', 'Jetpack Compose', 'Compose Multiplatform', 'Material 3 Expressive', 'Media3 ExoPlayer', 'Jetpack Glance', 'Nearby Connections', 'Google Cast'],
          },
          {
            name: 'Browser, Desktop & Web',
            pills: ['TypeScript 7', 'Electron 44 (Chromium)', 'React 19', 'Svelte 5', 'Vite 8', 'Zustand 5', 'Web Audio API', 'HLS.js', 'Manifest V3'],
          },
          {
            name: 'Systems, Networking & Security',
            pills: ['Go 1.26', 'Xray-core', 'VLESS / REALITY / XHTTP / Hysteria2', 'Windows WFP', 'nftables & pf', 'WebAuthn Passkeys', 'DPAPI & AES-256-GCM', 'Named Pipes & Unix Sockets'],
          },
          {
            name: 'Edge, Backend, Audio ML & QA',
            pills: ['Cloudflare Workers & Wrangler', 'Supabase (Auth / PostgREST / Realtime)', 'Python', 'On-Device GRU Audio DSP', 'yt-dlp', 'Playwright', 'Gradle & GitHub Actions'],
          },
        ],
      };

  const grid = t.groups
    .map((g, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tx = 32 + col * 575;
      const ty = 86 + row * 126;
      const tw = 561;
      const th = 114;
      const style = c.tiles[idx];
      const pills = layoutPills(g.pills, tx + 18, ty + 46, tw - 36, {
        fontSize: 11.2,
        padX: 9,
        height: 24,
        gapX: 6,
        gapY: 6,
        isMono: true,
        fill: style.chipBg,
        stroke: style.chipBorder,
        textColor: style.chipText,
        maxRows: 2,
      });

      return `<g>
  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="18" fill="${style.bg}" stroke="${style.border}" stroke-width="1.2"/>
  <circle cx="${tx + 24}" cy="${ty + 25}" r="4.5" fill="${style.accent}"/>
  <text x="${tx + 36}" y="${ty + 29.5}" font-family="${UI_FONT}" font-size="15" font-weight="800" fill="${c.text}">${esc(g.name)}</text>
  ${pills.svg}
</g>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 356" width="1200" height="356" role="img" aria-label="${esc(t.title)}">
  <defs>
    <linearGradient id="tsBg_${lang}_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg0}"/>
      <stop offset="100%" stop-color="${c.bg1}"/>
    </linearGradient>
    <clipPath id="tsClip_${lang}_${theme}">
      <rect x="0" y="0" width="1200" height="356" rx="26"/>
    </clipPath>
  </defs>
  <g clip-path="url(#tsClip_${lang}_${theme})">
    <rect width="1200" height="356" rx="26" fill="url(#tsBg_${lang}_${theme})"/>
    <text x="32" y="38" font-family="${MONO_FONT}" font-size="11.5" font-weight="700" letter-spacing="0.6" fill="${c.eyebrow}">${esc(t.eyebrow)}</text>
    <text x="32" y="68" font-family="${UI_FONT}" font-size="24" font-weight="800" fill="${c.text}">${esc(t.title)}</text>
    ${grid}
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="354.5" rx="25.25" fill="none" stroke="${c.border}" stroke-width="1.5"/>
</svg>`;
}

const files = [];
for (const lang of ['ru', 'en']) {
  for (const theme of ['dark', 'light']) {
    files.push([`hero-${lang}-${theme}.svg`, buildHero(lang, theme)]);
    for (const card of PROJECT_CARDS) {
      files.push([`card-${card.id}-${lang}-${theme}.svg`, buildProjectCard(card, lang, theme)]);
    }
    files.push([`card-youcloud-web-${lang}-${theme}.svg`, buildYouCloudWeb(lang, theme)]);
    files.push([`ai-workflow-${lang}-${theme}.svg`, buildAiWorkflow(lang, theme)]);
    files.push([`tech-stack-${lang}-${theme}.svg`, buildTechStack(lang, theme)]);
  }
}

for (const [name, content] of files) {
  fs.writeFileSync(path.join(OUT_DIR, name), content, 'utf8');
}

console.log(`Generated ${files.length} SVG assets in ${OUT_DIR}`);
