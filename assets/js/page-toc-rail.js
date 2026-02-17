(function () {
  var rail = document.getElementById("page-toc-rail");
  var list = document.getElementById("page-toc-rail-list");
  if (!rail || !list) return;

  var minDesktopWidth = 1200;
  var boundHeadings = [];
  var scrollHandler = null;

  function slugify(text) {
    return (text || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fa5\- ]+/g, "")
      .replace(/\s+/g, "-");
  }

  function ensureHeadingId(heading) {
    if (heading.id) return heading.id;
    var rawText = heading.textContent || "";
    var id = slugify(rawText) || ("section-" + Math.random().toString(36).slice(2, 8));
    var base = id;
    var i = 2;
    while (document.getElementById(id)) {
      id = base + "-" + i;
      i += 1;
    }
    heading.id = id;
    return id;
  }

  function getContentHeadings() {
    var container = document.querySelector("main .post-content");
    if (!container) return [];
    var nodes = container.querySelectorAll("h2, h3");
    return Array.prototype.filter.call(nodes, function (node) {
      return !node.closest(".toc");
    });
  }

  function buildToc() {
    list.innerHTML = "";
    rail.hidden = true;

    if (window.innerWidth < minDesktopWidth) return;

    boundHeadings = getContentHeadings();
    if (!boundHeadings.length) return;

    var frag = document.createDocumentFragment();

    boundHeadings.forEach(function (heading) {
      var id = ensureHeadingId(heading);
      var li = document.createElement("li");
      li.className = "page-toc-rail__item";
      if (heading.tagName.toLowerCase() === "h3") li.classList.add("is-sub");

      var link = document.createElement("a");
      link.href = "#" + id;
      link.textContent = heading.textContent || id;
      link.className = "page-toc-rail__link";

      li.appendChild(link);
      frag.appendChild(li);
    });

    list.appendChild(frag);
    rail.hidden = false;
    bindActiveState();
  }

  function bindActiveState() {
    var links = Array.prototype.slice.call(list.querySelectorAll(".page-toc-rail__link"));
    if (!links.length) return;

    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler);
    }

    function activateCurrent() {
      var currentId = "";
      var offset = window.scrollY + 140;
      for (var i = 0; i < boundHeadings.length; i += 1) {
        if (boundHeadings[i].offsetTop <= offset) currentId = boundHeadings[i].id;
        else break;
      }
      if (!currentId && boundHeadings[0]) currentId = boundHeadings[0].id;

      links.forEach(function (link) {
        var active = currentId && link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("is-active", !!active);
        if (link.parentElement) {
          link.parentElement.classList.toggle("is-current", !!active);
        }
      });
    }

    scrollHandler = activateCurrent;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    activateCurrent();
  }

  window.addEventListener("resize", buildToc);
  window.addEventListener("load", buildToc);
  buildToc();
})();
