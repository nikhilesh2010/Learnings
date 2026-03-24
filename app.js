const readmes = [
  { label: "JavaScript", path: "JAVASCRIPT/README.md" },
  { label: "React", path: "REACT/README.md" },
  { label: "React Native", path: "REACT-NATIVE/README.md" },
  { label: "Node", path: "NODE/README.md" },
  { label: "Python", path: "PYTHON/README.md" },
  { label: "FastAPI", path: "FASTAPI/README.md" },
  { label: "PHP", path: "PHP/README.md" },
];

const grid = document.getElementById("readme-grid");

function createCard({ label, path, title }) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-body">
      <p class="card-kicker">${label}</p>
      <h2>${title}</h2>
    </div>
    <a class="card-link" href="viewer.html?file=${encodeURIComponent(path)}">Open README</a>
  `;
  return card;
}

function parsePreview(markdown, fallbackTitle) {
  const lines = markdown.split(/\r?\n/);
  let title = fallbackTitle;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith("#")) {
      title = line.replace(/^#+\s*/, "").trim() || fallbackTitle;
      break;
    }
  }

  return { title };
}

async function loadCards() {
  grid.innerHTML = "";
  for (const item of readmes) {
    try {
      const response = await fetch(item.path);
      if (!response.ok) throw new Error("Missing README");
      const markdown = await response.text();
      const preview = parsePreview(markdown, item.label);
      grid.appendChild(createCard({ ...item, ...preview }));
    } catch (error) {
      grid.appendChild(
        createCard({
          ...item,
          title: item.label,
        })
      );
    }
  }
}

loadCards();
