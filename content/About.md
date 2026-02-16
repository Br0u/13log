---
title: "About"
date: 2024-03-15T02:30:00-04:00
draft: false
aliases:
  - /cards/links/
  - /links/
  - /blogroll/
---

<figure class="about-hero-wrap">
  {{< about_hero src="/images/aboutme.png" alt="About me" >}}
  <em class="about-hero-caption">竹影潭下绿，荷花镜里香。</em>
</figure>

<style>
  .post-content {
    font-family: "SimSun", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif;
  }
  .post-single {
    background:
      linear-gradient(180deg, rgba(240, 225, 190, 0.68), rgba(240, 225, 190, 0.62));
    backdrop-filter: blur(1.8px);
  }
  .post-single .post-content {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .dark .post-single {
    background:
      linear-gradient(180deg, rgba(36, 33, 28, 0.66), rgba(36, 33, 28, 0.58));
  }
  .about-hero-caption {
    display: block;
    margin: 0.6rem 0 1.4rem;
    text-align: center;
    font-style: normal;
    color: var(--secondary);
  }
</style>

<section class="about-blog about-me">
  <h2>关于我 Aboutme</h2>
  <img src="/pics/about/tx.jpg" alt="avatar" style="width: 10rem; height: 10rem; border-radius: 100%; margin: 1rem 0 0 0;">
  <blockquote class="about-blog__quote">
    <ul>
      <li>喜欢胡思乱想</li>
      <li>无业游民（应届）、悲观主义者。</li>
      <li>偏好雨夜、沙滩、大海、树下、月光、昏黄光源、低饱和色调。</li>
      <li>喜欢健身、摄影、写代码、做 side project；沉迷于构建系统、拆解问题、把混乱整理成结构。</li>
      <li>凌晨效率最高，白天基本废人。</li>
      <li>长期反复出现的兴趣与对象包括：技术与工程思维、前端与系统设计、独立项目、数据与优化、Warhammer、偏硬核/孤独气质的作品与配乐（电子 / 极简 / 实验）、以及一切“能自己折腾、慢慢成型”的东西。</li>
      <li>对当前自己的判断：懒，但尚未放弃。</li>
      <li>这些是我目前对自己的阶段性认知。如果想更具体地了解我，阅读博客内容，或通过其他方式联系我即可。</li>
    </ul>
  </blockquote>
</section>

---

<section class="about-blog">
  <h2>关于博客</h2>
  <blockquote class="about-blog__quote">
    <p><strong>关于这个博客，你应该知道的第一件事是，这是我为自己所写的博客。</strong> —— <a class="about-blog__author" href="https://jesor.me/about/" target="_blank" rel="noopener noreferrer">大破进击</a></p>
  </blockquote>
  <p><em class="about-blog__wave">kk。</em></p>
</section>

---

<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css">
<style>
  .about-map {
    margin: 1.75rem 0 0;
  }
  .about-map h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary);
  }
  .about-map__canvas {
    position: relative;
    width: 100%;
    height: 320px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  }
  .about-map__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: screen;
  }
  .about-map__label {
    position: absolute;
    left: 10px;
    bottom: 10px;
    display: inline-flex;
    gap: 10px;
    z-index: 4;
  }
  .about-map__label span {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    background: rgba(20, 20, 20, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e5e7eb;
  }
  .about-map__canvas .maplibregl-canvas {
    z-index: 1;
  }
  .about-map__marker {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #3b82f6;
    border: 2px solid #e2e8f0;
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.35);
    z-index: 3;
  }
  .about-map__marker::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.35);
    transform: translate(-50%, -50%) scale(0.65);
    transform-origin: center;
    animation: map-pulse 2.6s ease-in-out infinite;
  }
  @keyframes map-pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.65);
      opacity: 0.55;
    }
    70% {
      transform: translate(-50%, -50%) scale(1.05);
      opacity: 0.1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0;
    }
  }
  @media (max-width: 768px) {
    .about-map__canvas {
      height: 240px;
    }
  }
</style>

<section class="about-map">
  <h3>居住地</h3>
  <div id="about-map" class="about-map__canvas" aria-label="Map" role="region">
    <canvas id="about-weather" class="about-map__overlay"></canvas>
    <div class="about-map__label"><span>Toronto, Ontario</span></div>
  </div>
</section>

<script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
<script>
  window.addEventListener("load", () => {
    if (!window.maplibregl) return;
    const container = document.getElementById("about-map");
    if (!container) return;

    const center = [-79.3832, 43.6532];
    const map = new maplibregl.Map({
      container,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center,
      zoom: 9.2,
      pitch: 35,
      bearing: -18,
      attributionControl: false,
      interactive: false,
      dragPan: false,
      scrollZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoomRotate: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    const markerEl = document.createElement("div");
    markerEl.className = "about-map__marker";
    new maplibregl.Marker({ element: markerEl }).setLngLat(center).addTo(map);

    const canvas = document.getElementById("about-weather");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };
    resize();
    window.addEventListener("resize", resize);

    const rainCodes = new Set([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
    const snowCodes = new Set([71, 73, 75, 77, 85, 86]);
    let mode = "clear";
    fetch("https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&current_weather=true&timezone=auto")
      .then((res) => res.json())
      .then((data) => {
        const code = data && data.current_weather ? data.current_weather.weathercode : null;
        if (snowCodes.has(code)) mode = "snow";
        else if (rainCodes.has(code)) mode = "rain";
      })
      .catch(() => {});

    const drops = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      l: 0.3 + Math.random() * 0.7,
      s: 0.6 + Math.random() * 1.6
    }));
    const flakes = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      s: 0.3 + Math.random() * 0.9,
      d: Math.random() * Math.PI * 2
    }));

    const drawRain = () => {
      ctx.strokeStyle = "rgba(120, 170, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        const x = d.x * canvas.width;
        const y = d.y * canvas.height;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y + 18 * d.l);
        d.y += 0.02 * d.s;
        if (d.y > 1.1) d.y = -0.1;
      }
      ctx.stroke();
    };

    const drawSnow = () => {
      ctx.fillStyle = "rgba(220, 235, 255, 0.8)";
      for (const f of flakes) {
        const x = f.x * canvas.width;
        const y = f.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += 0.006 * f.s;
        f.x += Math.sin(f.d) * 0.0008;
        f.d += 0.01;
        if (f.y > 1.1) f.y = -0.1;
        if (f.x > 1.1) f.x = -0.1;
        if (f.x < -0.1) f.x = 1.1;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === "rain") drawRain();
      if (mode === "snow") drawSnow();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });
</script>
