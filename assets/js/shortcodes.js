(() => {
  const initSpoilers = () => {
    document.querySelectorAll(".spoiler").forEach((spoiler) => {
      const setRevealed = (revealed) => {
        spoiler.classList.toggle("is-revealed", revealed);
        spoiler.setAttribute("aria-expanded", revealed ? "true" : "false");
      };

      const toggle = () => {
        setRevealed(!spoiler.classList.contains("is-revealed"));
      };

      spoiler.addEventListener("click", (event) => {
        event.preventDefault();
        toggle();
      });

      spoiler.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });
  };

  const initPlaylists = () => {
    document.querySelectorAll(".playlist-player").forEach((player) => {
      const audio = player.querySelector(".playlist-audio");
      const titleEl = player.querySelector(".playlist-title");
      const baseTitle = titleEl ? titleEl.textContent.trim() : "";

      player.querySelectorAll(".song-item").forEach((item) => {
        const activate = () => {
          const src = item.getAttribute("data-src");
          const title = item.getAttribute("data-title") || "";
          if (!audio || !src) return;
          audio.src = src;
          audio.play().catch(() => {});
          if (titleEl && baseTitle) {
            titleEl.textContent = `${baseTitle} - ${title}`;
          }
        };

        item.addEventListener("click", activate);
        item.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        });
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initSpoilers();
      initPlaylists();
    });
  } else {
    initSpoilers();
    initPlaylists();
  }
})();
