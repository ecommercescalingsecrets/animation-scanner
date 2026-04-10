const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.get('/', (req, res) => {
  const filter = req.query.filter || 'ALL';
  const filtered = filter === 'ALL' ? data.results : data.results.filter(r => r.classification === filter);
  
  const cards = filtered.map(r => `
    <div class="card ${r.classification.toLowerCase()}">
      <img src="${r.thumbnail}" loading="lazy" onerror="this.src='https://placehold.co/300x300?text=No+Image'" />
      <div class="info">
        <div class="badge ${r.classification.toLowerCase()}">${r.classification}</div>
        <div class="brand">${r.brand}</div>
        <div class="perf">${r.perf || 'N/A'}</div>
        <div class="body">${(r.body || '').substring(0, 80)}${r.body && r.body.length > 80 ? '...' : ''}</div>
        <div class="ad-id">ID: ${r.id}</div>
      </div>
    </div>
  `).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Animation Ad Scanner — Gethookd</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; }
    .header { padding: 24px 32px; background: #111; border-bottom: 1px solid #222; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { color: #888; font-size: 14px; }
    .stats { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
    .stat { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px 24px; text-align: center; min-width: 120px; }
    .stat .num { font-size: 32px; font-weight: 700; }
    .stat .label { font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase; }
    .stat.animated .num { color: #f59e0b; }
    .stat.live .num { color: #10b981; }
    .stat.hybrid .num { color: #8b5cf6; }
    .stat.total .num { color: #3b82f6; }
    .filters { display: flex; gap: 8px; margin: 20px 32px; flex-wrap: wrap; }
    .filters a { 
      padding: 8px 20px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500;
      background: #1a1a1a; color: #888; border: 1px solid #333; transition: all 0.2s;
    }
    .filters a:hover { background: #222; color: #fff; }
    .filters a.active { background: #fff; color: #000; border-color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 16px 32px 60px; }
    .card { background: #151515; border: 1px solid #222; border-radius: 12px; overflow: hidden; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); border-color: #444; }
    .card img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .info { padding: 12px 16px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
    .badge.animated { background: #f59e0b22; color: #f59e0b; border: 1px solid #f59e0b44; }
    .badge.live-action { background: #10b98122; color: #10b981; border: 1px solid #10b98144; }
    .badge.hybrid { background: #8b5cf622; color: #8b5cf6; border: 1px solid #8b5cf644; }
    .brand { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
    .perf { font-size: 12px; color: #888; margin-bottom: 6px; }
    .body { font-size: 13px; color: #666; line-height: 1.4; margin-bottom: 6px; }
    .ad-id { font-size: 11px; color: #444; }
    .cost-note { padding: 16px 32px; background: #0d1117; border-top: 1px solid #222; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎬 Animation Ad Scanner</h1>
    <p>Health, Beauty & Supplement video ads classified via Gemini 2.5 Flash</p>
    <div class="stats">
      <div class="stat total"><div class="num">${data.total}</div><div class="label">Total Scanned</div></div>
      <div class="stat animated"><div class="num">${data.counts.ANIMATED || 0}</div><div class="label">Animated</div></div>
      <div class="stat hybrid"><div class="num">${data.counts.HYBRID || 0}</div><div class="label">Hybrid</div></div>
      <div class="stat live"><div class="num">${data.counts['LIVE-ACTION'] || 0}</div><div class="label">Live-Action</div></div>
    </div>
    <p style="margin-top:8px; color:#f59e0b;">
      ${((data.counts.ANIMATED || 0) / data.total * 100).toFixed(1)}% animated · 
      ${((data.counts.HYBRID || 0) / data.total * 100).toFixed(1)}% hybrid · 
      ${(((data.counts.ANIMATED || 0) + (data.counts.HYBRID || 0)) / data.total * 100).toFixed(1)}% non-live-action total
    </p>
  </div>
  <div class="filters">
    <a href="/" class="${filter === 'ALL' ? 'active' : ''}">All (${data.total})</a>
    <a href="/?filter=ANIMATED" class="${filter === 'ANIMATED' ? 'active' : ''}">Animated (${data.counts.ANIMATED || 0})</a>
    <a href="/?filter=HYBRID" class="${filter === 'HYBRID' ? 'active' : ''}">Hybrid (${data.counts.HYBRID || 0})</a>
    <a href="/?filter=LIVE-ACTION" class="${filter === 'LIVE-ACTION' ? 'active' : ''}">Live-Action (${data.counts['LIVE-ACTION'] || 0})</a>
  </div>
  <div class="grid">${cards}</div>
  <div class="cost-note">
    Scan cost: ~$0.06 for ${data.total} ads via Gemini 2.5 Flash · ~277 input tokens + ~1 output token per ad · Scan still running (targeting 1,000)
  </div>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`Animation scanner preview on port ${PORT}`));
