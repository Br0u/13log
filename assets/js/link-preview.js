(function () {
  const cards = Array.from(
    document.querySelectorAll('[data-link-card][data-preview-enabled="true"]')
  );
  if (!cards.length) return;

  const PROVIDERS = [
    {
      name: "microlink",
      buildUrl: function (url) {
        return "https://api.microlink.io/?url=" + encodeURIComponent(url);
      },
      map: function (payload) {
        if (!payload || payload.status !== "success" || !payload.data) return null;
        const data = payload.data;
        const image =
          (data.image && typeof data.image === "string" && data.image) ||
          (data.image && data.image.url) ||
          "";
        return {
          title: data.title || "",
          description: data.description || "",
          image: image || ""
        };
      }
    },
    {
      name: "ogfetch",
      buildUrl: function (url) {
        return "https://api.ogfetch.com/preview?url=" + encodeURIComponent(url);
      },
      map: function (payload) {
        if (!payload || typeof payload !== "object") return null;
        return {
          title: payload.title || "",
          description: payload.description || "",
          image: payload.image || ""
        };
      }
    }
  ];

  const CACHE_KEY = "link-preview-cache-v1";
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
  const MAX_CONCURRENT = 2;
  const REQUEST_TIMEOUT_MS = 6000;

  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
  } catch (_) {
    cache = {};
  }

  const now = Date.now();
  Object.keys(cache).forEach(function (key) {
    if (!cache[key] || now - cache[key].ts > CACHE_TTL) delete cache[key];
  });

  const queue = [];
  let inflight = 0;

  function persistCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (_) {}
  }

  function getCached(url) {
    const item = cache[url];
    if (!item || !item.data) return null;
    return item.data;
  }

  function setCached(url, data) {
    cache[url] = { ts: Date.now(), data: data };
    persistCache();
  }

  function fallbackFavicon(url) {
    try {
      return "https://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(url) + "&sz=128";
    } catch (_) {
      return "";
    }
  }

  function applyPreview(card, meta) {
    if (!meta || typeof meta !== "object") return;

    const titleEl = card.querySelector("[data-preview-title]");
    if (titleEl && !titleEl.textContent.trim() && meta.title) {
      titleEl.textContent = meta.title;
    }

    const descEl = card.querySelector("[data-preview-desc]");
    if (descEl && !descEl.textContent.trim() && meta.description) {
      descEl.textContent = meta.description;
      descEl.classList.remove("is-empty");
    }

    const container = card.querySelector("[data-preview-container]");
    if (!container) return;

    let img = container.querySelector("img");
    const imageSrc = meta.image || fallbackFavicon(card.getAttribute("data-preview-url") || "");
    if (!imageSrc) return;

    if (!img) {
      img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      img.setAttribute("data-preview-image", "true");
      container.appendChild(img);
    }
    if (!img.getAttribute("src")) {
      img.src = imageSrc;
    }

    container.classList.remove("is-empty");
    card.classList.remove("link-board-card--preview-pending");
  }

  async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(function () {
      controller.abort();
    }, timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function fetchPreviewMeta(url) {
    for (const provider of PROVIDERS) {
      try {
        const response = await fetchWithTimeout(provider.buildUrl(url), REQUEST_TIMEOUT_MS);
        if (!response.ok) continue;
        const payload = await response.json();
        const mapped = provider.map(payload);
        if (mapped && (mapped.title || mapped.description || mapped.image)) {
          return mapped;
        }
      } catch (_) {}
    }
    return null;
  }

  async function fetchPreview(card) {
    const url = card.getAttribute("data-preview-url");
    if (!url) return;

    const cached = getCached(url);
    if (cached) {
      applyPreview(card, cached);
      return;
    }

    try {
      const meta = await fetchPreviewMeta(url);
      if (meta) {
        setCached(url, meta);
        applyPreview(card, meta);
      } else {
        applyPreview(card, { image: "" });
        card.classList.add("link-board-card--preview-failed");
      }
    } catch (_) {
      card.classList.add("link-board-card--preview-failed");
    } finally {
      card.classList.remove("link-board-card--preview-pending");
    }
  }

  function pumpQueue() {
    while (inflight < MAX_CONCURRENT && queue.length) {
      const card = queue.shift();
      inflight += 1;
      fetchPreview(card).finally(function () {
        inflight -= 1;
        pumpQueue();
      });
    }
  }

  function queueCard(card) {
    if (card.dataset.previewQueued === "1") return;
    card.dataset.previewQueued = "1";
    queue.push(card);
    pumpQueue();
  }

  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        queueCard(card);
        obs.unobserve(card);
      });
    },
    { rootMargin: "260px 0px" }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();
