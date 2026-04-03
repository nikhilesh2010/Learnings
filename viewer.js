const params = new URLSearchParams(window.location.search);
const file = params.get("file");

const pathEl = document.getElementById("doc-path");
const docEl = document.getElementById("doc");
const navPrev = document.getElementById("nav-prev");
const navNext = document.getElementById("nav-next");
const navContents = document.getElementById("nav-contents");

function showError(message) {
  docEl.innerHTML = `<p class="error">${message}</p>`;
}

function setNavState(element, targetPath) {
  if (!element) return;
  if (targetPath) {
    element.classList.remove("is-disabled");
    element.setAttribute("href", targetPath);
    element.removeAttribute("aria-disabled");
  } else {
    element.classList.add("is-disabled");
    element.setAttribute("href", "#");
    element.setAttribute("aria-disabled", "true");
  }
}

function resolveHref(href, baseDir) {
  if (!href) return null;
  if (href.startsWith("#")) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  const normalized = href.startsWith("/") ? href.slice(1) : href;
  if (normalized.toLowerCase().endsWith(".md")) {
    return `viewer.html?file=${encodeURIComponent(baseDir + normalized)}`;
  }
  return baseDir + normalized;
}

function extractNavTargets(container, baseDir) {
  const links = Array.from(container.querySelectorAll("a[href]"));
  const result = { prev: null, next: null, contents: null };

  links.forEach((link) => {
    const text = link.textContent.trim().toLowerCase();
    const href = link.getAttribute("href");
    if (!href) return;

    if (!result.prev && (text.includes("previous") || text.includes("prev"))) {
      result.prev = resolveHref(href, baseDir);
      return;
    }
    if (!result.next && text.includes("next")) {
      result.next = resolveHref(href, baseDir);
      return;
    }
    if (!result.contents && (text.includes("contents") || text.includes("content"))) {
      result.contents = resolveHref(href, baseDir);
    }
  });

  return result;
}

function updateNavLinks(baseDir) {
  const targets = extractNavTargets(docEl, baseDir);
  setNavState(navPrev, targets.prev);
  setNavState(navNext, targets.next);
  setNavState(navContents, targets.contents || "#doc");
}

if (!file) {
  showError("No README file specified.");
} else {
  pathEl.textContent = file;
  const baseDir = file.includes("/") ? file.slice(0, file.lastIndexOf("/") + 1) : "";
  fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error("README not found");
      return response.text();
    })
    .then((markdown) => {
      const html = marked.parse(markdown);
      docEl.innerHTML = DOMPurify.sanitize(html);
      docEl.querySelectorAll("pre code").forEach((block) => {
        if (window.hljs) {
          window.hljs.highlightElement(block);
        }
      });
      updateNavLinks(baseDir);

      const links = docEl.querySelectorAll("a[href]");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;
        if (href.startsWith("#")) return;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return;

        link.setAttribute("href", resolveHref(href, baseDir));
      });

      const images = docEl.querySelectorAll("img[src]");
      images.forEach((image) => {
        const src = image.getAttribute("src");
        if (!src) return;
        if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return;
        const normalized = src.startsWith("/") ? src.slice(1) : src;
        image.setAttribute("src", baseDir + normalized);
      });
    })
    .catch(() => {
      showError("Could not load the README file.");
    });
}
