const params = new URLSearchParams(window.location.search);
const file = params.get("file");

const pathEl = document.getElementById("doc-path");
const docEl = document.getElementById("doc");

function showError(message) {
  docEl.innerHTML = `<p class="error">${message}</p>`;
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
      const links = docEl.querySelectorAll("a[href]");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;
        if (href.startsWith("#")) return;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return;

        const normalized = href.startsWith("/") ? href.slice(1) : href;
        if (normalized.toLowerCase().endsWith(".md")) {
          link.setAttribute(
            "href",
            `viewer.html?file=${encodeURIComponent(baseDir + normalized)}`
          );
        } else {
          link.setAttribute("href", baseDir + normalized);
        }
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
