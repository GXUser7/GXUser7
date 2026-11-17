import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'file:///c:/Users/000/Documents/Projects/YouCloud/web/node_modules/playwright-core/index.mjs';
import { SHAPES } from 'file:///c:/Users/000/Documents/Projects/yumi_site/public/shapes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function toDataUri(filePath, mime) {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function shapePath(name) {
  const nums = SHAPES[name].split(' ');
  let d = `M${nums[0]} ${nums[1]}`;
  for (let i = 2; i < nums.length; i += 2) {
    d += `L${nums[i]} ${nums[i + 1]}`;
  }
  return d + 'Z';
}

function shapeSvg(name, className = '') {
  return `<svg class="${className}" viewBox="0 0 200 200" aria-hidden="true"><path d="${shapePath(name)}"/></svg>`;
}

const ASSETS = {
  fonts: {
    unbounded: toDataUri('c:/Users/000/Documents/Projects/YouCloud/app/src/main/res/font/unbounded.ttf', 'font/ttf'),
    onest: toDataUri('c:/Users/000/Documents/Projects/YouCloud/app/src/main/res/font/onest.ttf', 'font/ttf'),
    robotoLatin: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/fonts/roboto-flex-latin.woff2', 'font/woff2'),
    robotoCyrillic: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/fonts/roboto-flex-cyrillic.woff2', 'font/woff2'),
  },
  icons: {
    yumi: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/icons/yumi.svg', 'image/svg+xml'),
    youcloud: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/icons/youcloud.svg', 'image/svg+xml'),
    masaki: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/icons/masaki.png', 'image/png'),
  },
  screens: {
    masaki: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/screens/masaki-newtab.webp', 'image/webp'),
    youcloud: toDataUri('c:/Users/000/Documents/Projects/YouCloud/docs/screenshots/landscape-my-wave.jpg', 'image/jpeg'),
    yumiConnected: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/screens/yumi-connected.webp', 'image/webp'),
    yumiSpeed: toDataUri('c:/Users/000/Documents/Projects/yumi_site/public/assets/screens/yumi-speed.webp', 'image/webp'),
    yumiDesktop: toDataUri('c:/Users/000/Documents/Projects/yumi-desktop/docs/screenshots/connect.png', 'image/png'),
    youcloudWeb: toDataUri('c:/Users/000/Documents/Projects/Masaki/docs/screens/live/youcloud.webp', 'image/webp'),
  },
};

const BASE_CSS = `
@font-face {
  font-family: 'Unbounded';
  src: url('${ASSETS.fonts.unbounded}') format('truetype');
  font-weight: 200 900;
  font-display: block;
}
@font-face {
  font-family: 'Onest';
  src: url('${ASSETS.fonts.onest}') format('truetype');
  font-weight: 100 900;
  font-display: block;
}
@font-face {
  font-family: 'Roboto Flex';
  src: url('${ASSETS.fonts.robotoLatin}') format('woff2');
  font-weight: 200 1000;
  font-stretch: 35% 151%;
  font-display: block;
  unicode-range: U+0020-007E, U+00A0-00FF, U+2010-2027, U+2030-203A, U+2116, U+2191, U+2193, U+2212, U+20BD;
}
@font-face {
  font-family: 'Roboto Flex';
  src: url('${ASSETS.fonts.robotoCyrillic}') format('woff2');
  font-weight: 200 1000;
  font-stretch: 35% 151%;
  font-display: block;
  unicode-range: U+0400-045F, U+0490-0491;
}

:root {
  --d: 1;
  --h: 285;
}
:root[data-theme='light'] {
  --d: 0;
}
:root,
[data-hue] {
  --primary: oklch(calc(0.5 + 0.34 * var(--d)) calc(0.14 - 0.04 * var(--d)) var(--h));
  --on-primary: oklch(calc(1 - 0.73 * var(--d)) calc(0.08 * var(--d)) var(--h));
  --primary-container: oklch(calc(0.9 - 0.5 * var(--d)) calc(0.07 + 0.03 * var(--d)) var(--h));
  --on-primary-container: oklch(calc(0.28 + 0.65 * var(--d)) calc(0.1 - 0.05 * var(--d)) var(--h));
  --secondary-container: oklch(calc(0.91 - 0.54 * var(--d)) calc(0.035 + 0.005 * var(--d)) var(--h));
  --on-secondary-container: oklch(calc(0.27 + 0.64 * var(--d)) 0.035 var(--h));
  --surface: oklch(calc(0.985 - 0.797 * var(--d)) calc(0.006 + 0.004 * var(--d)) var(--h));
  --surface-container: oklch(calc(0.94 - 0.699 * var(--d)) calc(0.01 + 0.002 * var(--d)) var(--h));
  --surface-high: oklch(calc(0.92 - 0.635 * var(--d)) 0.012 var(--h));
  --surface-highest: oklch(calc(0.9 - 0.572 * var(--d)) calc(0.014 - 0.001 * var(--d)) var(--h));
  --on-surface: oklch(calc(0.2 + 0.74 * var(--d)) calc(0.02 - 0.008 * var(--d)) var(--h));
  --on-surface-variant: oklch(calc(0.42 + 0.39 * var(--d)) 0.025 var(--h));
  --pastel: oklch(0.83 0.1 var(--h));
}
[data-hue='32'] { --h: 32; }
[data-hue='40'] { --h: 40; }
[data-hue='72'] { --h: 72; }
[data-hue='168'] { --h: 168; }
[data-hue='262'] { --h: 262; }
[data-hue='280'] { --h: 280; }
[data-hue='285'] { --h: 285; }

* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: transparent;
  font-family: 'Onest', 'Roboto Flex', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, p { margin: 0; }
img, svg { display: block; }

.capture-root {
  display: inline-block;
  background: transparent;
}

/* ---------- BLOCK 1: HERO MOSAIC (920x336) ---------- */
.hero-mosaic {
  width: 920px;
  height: 336px;
  display: grid;
  grid-template-columns: 1.42fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  background: transparent;
}
.hero-brand {
  grid-row: 1 / 3;
  background: var(--surface-high);
  border-radius: 28px 12px 12px 28px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.eyebrow {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 14px 0 11px;
  border-radius: 15px;
  background: var(--surface-highest);
  color: var(--on-surface-variant);
  font-size: 12.2px;
  font-weight: 600;
}
.eyebrow .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex: none;
}
.hero-title-wrap {
  margin: 4px 0;
}
.hero-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--on-surface);
}
.hero-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero-glyph {
  width: 34px;
  height: 34px;
  fill: var(--pastel);
  flex: none;
}
.hero-lead {
  margin-top: 12px;
  font-size: 15.5px;
  line-height: 1.4;
  color: var(--on-surface-variant);
  max-width: 32ch;
}
.connected-pills {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
}
.pill-primary {
  height: 36px;
  padding: 0 15px;
  border-radius: 18px 7px 7px 18px;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 12.4px;
  font-weight: 700;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}
.pill-secondary {
  height: 36px;
  padding: 0 13px;
  border-radius: 7px 18px 18px 7px;
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font-size: 12.2px;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.peek-tile {
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px;
}
.peek-tile.tr { border-radius: 12px 28px 12px 12px; }
.peek-tile.br { border-radius: 12px 12px 28px 12px; }
.peek-shape {
  position: absolute;
  width: 148px;
  height: 148px;
  right: -24px;
  top: -28px;
  fill: var(--pastel);
  opacity: calc(0.9 - 0.34 * var(--d));
}
.peek-icon {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 24%;
}
.peek-text {
  position: relative;
}
.peek-name {
  font-family: 'Unbounded', sans-serif;
  font-size: 17.5px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.peek-sub {
  margin-top: 2px;
  font-size: 12.8px;
  font-weight: 500;
  opacity: 0.84;
}

/* ---------- BLOCKS 2-5: PROJECT CARDS (454x446) ---------- */
.project-card {
  width: 454px;
  height: 446px;
  display: grid;
  grid-template-rows: 214px 1fr;
  gap: 8px;
  background: transparent;
}
.stage-tile {
  position: relative;
  overflow: hidden;
  border-radius: 28px 28px 12px 12px;
  background: var(--surface-high);
  display: grid;
  place-items: center;
}
.stage-shape {
  position: absolute;
  width: 214px;
  height: 214px;
  fill: var(--pastel);
  opacity: calc(0.42 - 0.18 * var(--d));
}
.screen-frame {
  position: relative;
  width: 386px;
  height: 182px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
  background: var(--surface-highest);
}
.screen-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.phones-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.phone-frame {
  height: 170px;
  aspect-ratio: 560 / 1247;
  border-radius: 13px;
  overflow: hidden;
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1);
  background: var(--surface-highest);
}
.phone-frame.main {
  height: 188px;
  border-radius: 14px;
}
.phone-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-tile {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 28px 28px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.id-bg-shape {
  position: absolute;
  width: 160px;
  height: 160px;
  right: -42px;
  bottom: -48px;
  fill: var(--pastel);
  opacity: calc(0.35 - 0.16 * var(--d));
}
.id-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}
.badge {
  position: relative;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: none;
}
.badge svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--pastel);
}
.badge img {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 7px;
}
.id-title-group {
  flex: 1;
  min-width: 0;
}
.kicker {
  font-size: 10.8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.78;
}
.card-title {
  margin-top: 2px;
  font-family: 'Unbounded', sans-serif;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
}
.go-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: var(--on-primary-container);
  color: var(--primary-container);
  display: grid;
  place-items: center;
  flex: none;
}
.card-desc {
  position: relative;
  font-size: 13.7px;
  line-height: 1.42;
  font-weight: 450;
  opacity: 0.94;
}
.chip-strip {
  position: relative;
  display: flex;
  gap: 3px;
}
.tonal-chip {
  height: 26px;
  padding: 0 10px;
  border-radius: 5px;
  background: color-mix(in oklab, var(--on-primary-container) 11%, var(--primary-container));
  color: var(--on-primary-container);
  font-size: 11.6px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.tonal-chip:first-child { border-radius: 13px 5px 5px 13px; }
.tonal-chip:last-child { border-radius: 5px 13px 13px 5px; }

/* ---------- BLOCK 6: YOUCLOUD WEB (920x252) ---------- */
.web-card {
  width: 920px;
  height: 252px;
  display: grid;
  grid-template-columns: 1.22fr 1fr;
  gap: 10px;
  background: transparent;
}
.web-id {
  position: relative;
  overflow: hidden;
  border-radius: 28px 12px 12px 28px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.web-bg-shape {
  position: absolute;
  width: 172px;
  height: 172px;
  right: -36px;
  top: -44px;
  fill: var(--pastel);
  opacity: calc(0.42 - 0.18 * var(--d));
}
.web-stage {
  position: relative;
  overflow: hidden;
  border-radius: 12px 28px 28px 12px;
  background: var(--surface-high);
  display: grid;
  place-items: center;
  padding: 16px;
}
.web-stage-shape {
  position: absolute;
  width: 220px;
  height: 220px;
  fill: var(--pastel);
  opacity: calc(0.4 - 0.18 * var(--d));
}
.web-frame {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
  background: var(--surface-highest);
}
.web-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ---------- BLOCK 7: BENTO STACK (920x184) ---------- */
.bento-stack {
  width: 920px;
  height: 184px;
  display: grid;
  grid-template-rows: 1fr;
  background: transparent;
}
.stack-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.stack-tile {
  background: var(--surface-high);
  color: var(--on-surface);
  padding: 18px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.stack-tile.bl { border-radius: 28px 12px 12px 28px; }
.stack-tile.br { border-radius: 12px 28px 28px 12px; }
.stack-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stack-ico {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  display: grid;
  place-items: center;
  flex: none;
}
.stack-title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}
.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.stack-tag {
  background: var(--surface-highest);
  color: var(--on-surface-variant);
  border-radius: 8px;
  padding: 4px 8.5px;
  font-size: 11.4px;
  font-weight: 600;
  line-height: 1.25;
}
`;

function wrapDoc(bodyHtml, theme) {
  return `<!doctype html>
<html data-theme="${theme}">
<head>
<meta charset="utf-8">
<style>${BASE_CSS}</style>
</head>
<body>
  <div id="capture" class="capture-root">${bodyHtml}</div>
</body>
</html>`;
}

function arrowSvg() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 11.5L11.5 4.5M6 4.5H11.5V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function buildHeroHtml(lang) {
  const t = lang === 'ru'
    ? {
        eyebrow: 'Android · ТВ · Windows · macOS · Linux · Веб',
        lead: 'Независимые приложения в едином дизайне Material 3 Expressive.',
        masaki: 'Браузер · Win & Mac',
        youcloud: 'Плеер · Android & Веб',
        yumi: 'Xray VPN · Android & ТВ',
        desktop: 'Win · macOS · Linux',
      }
    : {
        eyebrow: 'Android · TV · Windows · macOS · Linux · Web',
        lead: 'Independent apps crafted in one Material 3 Expressive language.',
        masaki: 'Browser · Win & Mac',
        youcloud: 'Player · Android & Web',
        yumi: 'Xray VPN · Android & TV',
        desktop: 'Win · macOS · Linux',
      };

  return `<div class="hero-mosaic" data-hue="285">
  <div class="hero-brand">
    <div class="eyebrow"><span class="dot"></span><span>${t.eyebrow}</span></div>
    <div class="hero-title-wrap">
      <div class="hero-title">Danya</div>
      <div class="hero-title-row">
        <div class="hero-title">Kukich</div>
        ${shapeSvg('sunny8', 'hero-glyph')}
      </div>
      <p class="hero-lead">${t.lead}</p>
    </div>
    <div class="connected-pills">
      <span class="pill-primary">@GXUser7 · Yumi Group</span>
      <span class="pill-secondary">GPL-3.0</span>
    </div>
  </div>

  <div class="peek-tile" data-hue="168">
    ${shapeSvg('clover4', 'peek-shape')}
    <img class="peek-icon" src="${ASSETS.icons.masaki}" alt="">
    <div class="peek-text">
      <div class="peek-name">Masaki</div>
      <div class="peek-sub">${t.masaki}</div>
    </div>
  </div>

  <div class="peek-tile tr" data-hue="72">
    ${shapeSvg('sunny8', 'peek-shape')}
    <img class="peek-icon" src="${ASSETS.icons.youcloud}" alt="">
    <div class="peek-text">
      <div class="peek-name">YouCloud</div>
      <div class="peek-sub">${t.youcloud}</div>
    </div>
  </div>

  <div class="peek-tile" data-hue="40">
    ${shapeSvg('cookie12', 'peek-shape')}
    <img class="peek-icon" src="${ASSETS.icons.yumi}" alt="">
    <div class="peek-text">
      <div class="peek-name">Yumi</div>
      <div class="peek-sub">${t.yumi}</div>
    </div>
  </div>

  <div class="peek-tile br" data-hue="262">
    ${shapeSvg('flower6', 'peek-shape')}
    <img class="peek-icon" src="${ASSETS.icons.yumi}" alt="">
    <div class="peek-text">
      <div class="peek-name">Yumi Desktop</div>
      <div class="peek-sub">${t.desktop}</div>
    </div>
  </div>
</div>`;
}

const PROJECT_CARDS = [
  {
    id: 'masaki',
    hue: 168,
    shape: 'clover4',
    icon: ASSETS.icons.masaki,
    title: 'Masaki',
    chips: ['Electron 44', 'TS 7', 'React 19', 'Zustand 5', 'Playwright'],
    stageHtml: `<div class="screen-frame"><img src="${ASSETS.screens.masaki}" style="object-position: top center;" alt=""></div>`,
    ru: {
      kicker: 'Браузер на Chromium · Win / Mac',
      desc: 'Боковая панель из матового стекла, палитра команд, свои passkey (DPAPI), шифрованная синхронизация в Google Диск и порт 9222 для ИИ.',
    },
    en: {
      kicker: 'Chromium Browser · Win / Mac',
      desc: 'Frosted glass sidebar & dock, command palette, custom DPAPI passkeys, E2EE Google Drive sync & AI control port 9222.',
    },
  },
  {
    id: 'youcloud',
    hue: 72,
    shape: 'sunny8',
    icon: ASSETS.icons.youcloud,
    title: 'YouCloud',
    chips: ['Kotlin 2.1', 'Compose M3E', 'Media3', 'GRU DSP', 'Supabase'],
    stageHtml: `<div class="screen-frame"><img src="${ASSETS.screens.youcloud}" style="object-position: center;" alt=""></div>`,
    ru: {
      kicker: 'Музыкальный плеер · Android 14+',
      desc: 'SoundCloud, Яндекс Музыка и YouTube Music вместе: +AI восстановление частот (GRU), «Слушать вместе» по Bluetooth, клипы и эфиры.',
    },
    en: {
      kicker: 'Unified Player · Android 14+',
      desc: 'SoundCloud, Yandex Music & YouTube Music in one library: real-time +AI GRU audio upscaling, P2P Listen Together & VP9 clips.',
    },
  },
  {
    id: 'yumi',
    hue: 40,
    shape: 'cookie12',
    icon: ASSETS.icons.yumi,
    title: 'Yumi',
    chips: ['Kotlin 2.2', 'Compose M3E', 'Xray-core', 'REALITY', 'Android TV'],
    stageHtml: `<div class="phones-row">
      <div class="phone-frame main"><img src="${ASSETS.screens.yumiConnected}" alt=""></div>
      <div class="phone-frame"><img src="${ASSETS.screens.yumiSpeed}" alt=""></div>
    </div>`,
    ru: {
      kicker: 'Самочинимый VPN · Android и ТВ',
      desc: 'Каждые 20 с проверяет поток данных и DNS сквозь туннель и уходит с упавшего сервера без обрыва. Версия для ТВ с пультом.',
    },
    en: {
      kicker: 'Self-Healing VPN · Android & TV',
      desc: 'Probes live payload & DNS every 20s and hot-swaps dead servers inside Xray without dropping sessions. Android TV + phone remote.',
    },
  },
  {
    id: 'yumi-desktop',
    hue: 262,
    shape: 'flower6',
    icon: ASSETS.icons.yumi,
    title: 'Yumi Desktop',
    chips: ['Kotlin 2.3', 'Compose', 'Go 1.26', 'Xray-core', 'WFP / pf'],
    stageHtml: `<div class="screen-frame"><img src="${ASSETS.screens.yumiDesktop}" style="object-position: top left;" alt=""></div>`,
    ru: {
      kicker: 'Десктопный VPN · Win / Mac / Linux',
      desc: 'Матовое стекло с фигурами на пружинках и привилегированная Go-служба: килл-свитч (WFP / nftables / pf) и режим таймзоны сервера.',
    },
    en: {
      kicker: 'Desktop VPN · Win / Mac / Linux',
      desc: 'Frosted glass UI backed by a SID/UID-locked Go service: kernel Kill Switch (WFP / nftables / pf) & server-matched timezone.',
    },
  },
];

function buildProjectCardHtml(cfg, lang) {
  const c = cfg[lang];
  const chipsHtml = cfg.chips.map((ch) => `<span class="tonal-chip">${ch}</span>`).join('');
  return `<div class="project-card" data-hue="${cfg.hue}">
  <div class="stage-tile">
    ${shapeSvg(cfg.shape, 'stage-shape')}
    ${cfg.stageHtml}
  </div>
  <div class="identity-tile">
    ${shapeSvg(cfg.shape, 'id-bg-shape')}
    <div class="id-head">
      <div class="badge">
        ${shapeSvg(cfg.shape)}
        <img src="${cfg.icon}" alt="">
      </div>
      <div class="id-title-group">
        <div class="kicker">${c.kicker}</div>
        <div class="card-title">${cfg.title}</div>
      </div>
      <div class="go-btn">${arrowSvg()}</div>
    </div>
    <p class="card-desc">${c.desc}</p>
    <div class="chip-strip">${chipsHtml}</div>
  </div>
</div>`;
}

function buildYouCloudWebHtml(lang) {
  const c = lang === 'ru'
    ? {
        kicker: 'Веб-плеер · Cloudflare Edge',
        desc: 'Та же медиатека в браузере: реактивная басовая волна 40–130 Гц, переписывание HLS на воркере, домашний IP через MV3, Go-помощник с yt-dlp и нативный режим в Masaki.',
      }
    : {
        kicker: 'Edge Web Player · Svelte 5',
        desc: 'The same library in the browser: 40–130 Hz bass-reactive wave, Worker HLS rewriting, MV3 home-IP bridge, Go yt-dlp helper & native glass mode inside Masaki.',
      };
  const chips = ['Svelte 5', 'Vite 8', 'CF Workers', 'Web Audio', 'MV3', 'Go Helper']
    .map((ch) => `<span class="tonal-chip">${ch}</span>`)
    .join('');

  return `<div class="web-card" data-hue="72">
  <div class="web-id">
    ${shapeSvg('sunny8', 'web-bg-shape')}
    <div class="id-head">
      <div class="badge">
        ${shapeSvg('sunny8')}
        <img src="${ASSETS.icons.youcloud}" alt="">
      </div>
      <div class="id-title-group">
        <div class="kicker">${c.kicker}</div>
        <div class="card-title" style="font-size: 24px;">YouCloud Web</div>
      </div>
      <div class="go-btn">${arrowSvg()}</div>
    </div>
    <p class="card-desc">${c.desc}</p>
    <div class="chip-strip">${chips}</div>
  </div>
  <div class="web-stage">
    ${shapeSvg('cookie9', 'web-stage-shape')}
    <div class="web-frame">
      <img src="${ASSETS.screens.youcloudWeb}" alt="">
    </div>
  </div>
</div>`;
}

function buildBentoStackHtml(lang) {
  const ru = lang === 'ru';
  const categories = [
    {
      cls: 'bl',
      hue: 40,
      title: ru ? 'Android & ТВ' : 'Android & TV',
      tags: ['Kotlin 2.1–2.3', 'Jetpack Compose', 'M3 Expressive', 'Media3', 'Glance', 'Nearby'],
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="1.5" width="8" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="12" r="0.9"/></svg>`,
    },
    {
      cls: '',
      hue: 168,
      title: ru ? 'Браузер и веб' : 'Browser & Web',
      tags: ['TypeScript 7', 'Electron 44', 'React 19', 'Svelte 5', 'Vite 8', 'Zustand 5', 'Web Audio'],
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.8" y="2.5" width="12.4" height="11" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M1.8 6H14.2" stroke="currentColor" stroke-width="1.5"/></svg>`,
    },
    {
      cls: '',
      hue: 262,
      title: ru ? 'Системы и VPN' : 'Systems & VPN',
      tags: ['Go 1.26', 'Xray-core', 'WFP / nftables / pf', 'Passkeys', 'DPAPI', 'AES-GCM'],
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.8L13.2 4V7.8C13.2 11 10.9 13.4 8 14.4C5.1 13.4 2.8 11 2.8 7.8V4L8 1.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    },
    {
      cls: 'br',
      hue: 72,
      title: ru ? 'Облако и ML' : 'Edge, ML & QA',
      tags: ['Cloudflare Workers', 'Supabase', 'Python', 'GRU Audio DSP', 'yt-dlp', 'Playwright'],
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.5 12.2H11.8C13.2 12.2 14.2 11.2 14.2 9.9C14.2 8.7 13.3 7.7 12.1 7.6C11.7 5.5 9.9 4 7.8 4C5.5 4 3.7 5.7 3.6 7.9C2.5 8.1 1.8 9 1.8 10.1C1.8 11.3 2.8 12.2 4.5 12.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    },
  ];

  const stackHtml = categories
    .map(
      (cat) => `<div class="stack-tile ${cat.cls}">
  <div class="stack-head">
    <div class="stack-ico" data-hue="${cat.hue}">${cat.icon}</div>
    <div class="stack-title">${cat.title}</div>
  </div>
  <div class="stack-tags">${cat.tags.map((t) => `<span class="stack-tag">${t}</span>`).join('')}</div>
</div>`
    )
    .join('');

  return `<div class="bento-stack" data-hue="285">
  <div class="stack-row">${stackHtml}</div>
</div>`;
}

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext({
    viewport: { width: 1100, height: 600 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const jobs = [];
  for (const lang of ['ru', 'en']) {
    for (const theme of ['dark', 'light']) {
      jobs.push([`hero-${lang}-${theme}.png`, buildHeroHtml(lang), theme]);
      for (const card of PROJECT_CARDS) {
        jobs.push([`card-${card.id}-${lang}-${theme}.png`, buildProjectCardHtml(card, lang), theme]);
      }
      jobs.push([`card-youcloud-web-${lang}-${theme}.png`, buildYouCloudWebHtml(lang), theme]);
      jobs.push([`bento-stack-${lang}-${theme}.png`, buildBentoStackHtml(lang), theme]);
    }
  }

  for (const [filename, bodyHtml, theme] of jobs) {
    await page.setContent(wrapDoc(bodyHtml, theme), { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.decode().catch(() => {})
        )
      );
    });
    const outPath = path.join(OUT_DIR, filename);
    await page.locator('#capture').screenshot({ path: outPath, omitBackground: true });
    console.log('Generated:', filename);
  }

  await browser.close();
  console.log(`Done! Generated ${jobs.length} Retina M3 Expressive PNGs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
