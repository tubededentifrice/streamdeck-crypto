#!/usr/bin/env node
/**
 * Simple script to generate a native SVG of a crypto ticker
 * Default: BTCUSDT on Binance, transparent background, white colors
 *
 * Usage:
 *   node generate-svg.js
 */

const fs = require('fs');

// Configuration - easily modifiable
const CONFIG = {
  pair: 'BTCUSDT',
  provider: 'BINANCE',
  fromCurrency: 'USD',
  backgroundColor: 'transparent',
  textColor: '#ffffff',
  positiveColor: '#ffffff',  // Color for positive changes (default: green)
  negativeColor: '#ffffff',  // Color for negative changes (default: red)
  width: 144,
  height: 144,
  outputFile: 'ticker.svg',
  displayHighLow: 'on',
  displayHighLowBar: 'on',
  displayDailyChange: 'on',
  font: 'Lato'
};

// Setup minimal global environment for the plugin
global.window = {};
global.document = {};
global.self = global.window;
global.WebSocket = function() { this.send = function() {}; };
global.DestinationEnum = { HARDWARE_AND_SOFTWARE: 0 };

// Load ticker module
const tickerAction = require('./com.courcelle.cryptoticker-dev.sdPlugin/js/ticker.js');

async function generateSVG() {
  console.log('Generating native SVG:');
  console.log(`  Pair: ${CONFIG.pair}`);
  console.log(`  Provider: ${CONFIG.provider}`);
  console.log(`  Colors: ${CONFIG.textColor} (positive: ${CONFIG.positiveColor}, negative: ${CONFIG.negativeColor})`);
  console.log('');

  // Connect and fetch data
  tickerAction.connect();
  const settings = tickerAction.applyDefaultSettings({
    pair: CONFIG.pair,
    exchange: CONFIG.provider,
    fromCurrency: CONFIG.fromCurrency,
    mode: 'ticker'
  });

  const tickerValues = await tickerAction.getTickerValue(
    CONFIG.pair,
    null,
    CONFIG.provider,
    CONFIG.fromCurrency
  );

  console.log(`Price: ${tickerValues.last || 'N/A'}`);
  console.log(`24h Change: ${tickerValues.changeDailyPercent ? (tickerValues.changeDailyPercent * 100).toFixed(2) + '%' : 'N/A'}`);
  console.log('');

  // Generate SVG
  const svg = renderTickerSVG(settings, tickerValues);

  fs.writeFileSync(CONFIG.outputFile, svg);
  console.log(`✓ SVG saved to ${CONFIG.outputFile}`);
  process.exit(0);
}

function renderTickerSVG(settings, values) {
  const formatters = require('./com.courcelle.cryptoticker-dev.sdPlugin/js/formatters.js');

  const width = CONFIG.width;
  const height = CONFIG.height;
  const sizeMultiplier = Math.max(width / 144, height / 144);
  const textPadding = 10 * sizeMultiplier;

  const pair = values.pairDisplay || values.pair || settings.pair;
  const priceValue = typeof values.last === 'number' ? values.last : null;
  const highValue = typeof values.high === 'number' ? values.high : null;
  const lowValue = typeof values.low === 'number' ? values.low : null;
  const changePercent = typeof values.changeDailyPercent === 'number' ? values.changeDailyPercent * 100 : null;

  const baseFontSize = 25 * sizeMultiplier;
  const priceFontSize = 35 * sizeMultiplier;
  const highLowFontSize = 25 * sizeMultiplier;
  const changeFontSize = 19 * sizeMultiplier;

  let svgElements = [];

  // Background
  if (CONFIG.backgroundColor !== 'transparent') {
    svgElements.push(`<rect width="${width}" height="${height}" fill="${CONFIG.backgroundColor}"/>`);
  }

  // Pair name
  svgElements.push(`<text x="${textPadding}" y="${25 * sizeMultiplier}" fill="${CONFIG.textColor}" font-family="${CONFIG.font}" font-size="${baseFontSize}" text-anchor="start">${escapeXml(pair)}</text>`);

  // Price
  if (priceValue !== null) {
    const priceText = formatters.getRoundedValue(priceValue, 2, 1, 'compact');
    svgElements.push(`<text x="${textPadding}" y="${60 * sizeMultiplier}" fill="${CONFIG.textColor}" font-family="${CONFIG.font}" font-size="${priceFontSize}" font-weight="bold" text-anchor="start">${escapeXml(priceText)}</text>`);
  }

  // Low price (left side)
  if (CONFIG.displayHighLow !== 'off' && lowValue !== null) {
    const lowText = formatters.getRoundedValue(lowValue, 2, 1, 'compact');
    svgElements.push(`<text x="${textPadding}" y="${90 * sizeMultiplier}" fill="${CONFIG.textColor}" font-family="${CONFIG.font}" font-size="${highLowFontSize}" text-anchor="start">${escapeXml(lowText)}</text>`);
  }

  // High price (right side)
  if (CONFIG.displayHighLow !== 'off' && highValue !== null) {
    const highText = formatters.getRoundedValue(highValue, 2, 1, 'compact');
    svgElements.push(`<text x="${width - textPadding}" y="${135 * sizeMultiplier}" fill="${CONFIG.textColor}" font-family="${CONFIG.font}" font-size="${highLowFontSize}" text-anchor="end">${escapeXml(highText)}</text>`);
  }

  // Daily change percentage (right side, above high)
  if (CONFIG.displayDailyChange !== 'off' && changePercent !== null) {
    let digitsPercent = 2;
    if (Math.abs(changePercent) >= 100) digitsPercent = 0;
    else if (Math.abs(changePercent) >= 10) digitsPercent = 1;

    let changePercentDisplay = formatters.getRoundedValue(changePercent, digitsPercent, 1, 'plain');
    if (changePercent > 0) changePercentDisplay = '+' + changePercentDisplay;

    const changeColor = changePercent > 0 ? CONFIG.positiveColor : changePercent < 0 ? CONFIG.negativeColor : CONFIG.textColor;
    svgElements.push(`<text x="${width - textPadding}" y="${90 * sizeMultiplier}" fill="${changeColor}" font-family="${CONFIG.font}" font-size="${changeFontSize}" text-anchor="end">${escapeXml(changePercentDisplay)}</text>`);
  }

  // High/Low bar
  if (CONFIG.displayHighLowBar !== 'off' && highValue !== null && lowValue !== null && priceValue !== null) {
    const lineY = 104 * sizeMultiplier;
    const padding = 5 * sizeMultiplier;
    const lineWidth = 6 * sizeMultiplier;

    const range = highValue - lowValue;
    const percent = range > 0 ? Math.min(Math.max((priceValue - lowValue) / range, 0), 1) : 0.5;
    const lineLength = width - (padding * 2);
    const cursorPositionX = padding + Math.round(lineLength * percent);

    // Green line (low to cursor)
    svgElements.push(`<line x1="${padding}" y1="${lineY}" x2="${cursorPositionX}" y2="${lineY}" stroke="${CONFIG.positiveColor}" stroke-width="${lineWidth}" stroke-linecap="round"/>`);

    // Red line (cursor to high)
    svgElements.push(`<line x1="${cursorPositionX}" y1="${lineY}" x2="${width - padding}" y2="${lineY}" stroke="${CONFIG.negativeColor}" stroke-width="${lineWidth}" stroke-linecap="round"/>`);

    // Triangle cursor
    const triangleSide = 12 * sizeMultiplier;
    const triangleHeight = Math.sqrt(0.75) * triangleSide;
    const x1 = cursorPositionX - triangleSide / 2;
    const x2 = cursorPositionX + triangleSide / 2;
    const x3 = cursorPositionX;
    const y1 = lineY - triangleHeight / 3;
    const y2 = lineY + triangleHeight * 2 / 3;
    svgElements.push(`<polygon points="${x1},${y1} ${x2},${y1} ${x3},${y2}" fill="${CONFIG.textColor}"/>`);
  }

  // Build final SVG
  const svgHeader = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add web font if using Lato
  if (CONFIG.font === 'Lato') {
    svgElements.unshift(`<defs><style>@import url('https://fonts.googleapis.com/css?family=Lato&amp;display=swap');</style></defs>`);
  }

  const svgFooter = `</svg>`;

  return svgHeader + '\n  ' + svgElements.join('\n  ') + '\n' + svgFooter;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Run
generateSVG().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
