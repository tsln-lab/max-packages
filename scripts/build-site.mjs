// Builds the GitHub Pages site into site/ from the Markdown already in the repository:
// the root README becomes the home page, CONTRIBUTING.md the contributing page, and each
// package's README its own page, with a changelog page beside it when the package has one.
//
//   node scripts/build-site.mjs
//
// Links between those files are rewritten to the pages they become, so the Markdown keeps
// working on GitHub and the site keeps working here.

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "site");
const REPO = "https://github.com/tsln-lab/max-packages";
const SITE_TITLE = "max-packages";

// ---- what to build ----

const packages = fs
  .readdirSync(path.join(ROOT, "packages"))
  .map((dir) => {
    const root = path.join(ROOT, "packages", dir);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    return {
      dir,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      readme: path.join(root, "README.md"),
      changelog: fs.existsSync(path.join(root, "CHANGELOG.md"))
        ? path.join(root, "CHANGELOG.md")
        : null,
    };
  })
  .filter((pkg) => fs.existsSync(pkg.readme))
  .sort((a, b) => a.dir.localeCompare(b.dir));

// Source file -> page it becomes, for rewriting links between them.
const pages = new Map([
  [path.join(ROOT, "README.md"), "index.html"],
  [path.join(ROOT, "CONTRIBUTING.md"), "contributing.html"],
]);
for (const pkg of packages) {
  pages.set(pkg.readme, `${pkg.dir}.html`);
  pages.set(path.join(ROOT, "packages", pkg.dir), `${pkg.dir}.html`);
  if (pkg.changelog) pages.set(pkg.changelog, `${pkg.dir}-changelog.html`);
}

// ---- markdown ----

function slug(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Renders one Markdown file, rewriting links to other rendered files and adding GitHub-style
// ids to headings so that anchors in links keep working.
function render(file) {
  const dir = path.dirname(file);
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
  };

  renderer.link = function ({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    // GFM autolinks anything shaped like an address, which `@tsln/max-types@0.1.0` is
    if (href.startsWith("mailto:")) return text;
    let target = href;
    if (!/^[a-z]+:/i.test(href) && !href.startsWith("#")) {
      const [rel, hash] = href.split("#");
      const resolved = path.resolve(dir, rel);
      const page = pages.get(resolved) ?? pages.get(path.join(resolved, "README.md"));
      target = page
        ? hash
          ? `${page}#${hash}`
          : page
        : `${REPO}/blob/main/${path.relative(ROOT, resolved).split(path.sep).join("/")}`;
    }
    const attrs = title ? ` title="${escapeHtml(title)}"` : "";
    return `<a href="${escapeHtml(target)}"${attrs}>${text}</a>`;
  };

  const markdown = fs.readFileSync(file, "utf8");
  return marked.parse(markdown, { renderer, gfm: true });
}

// ---- page shell ----

const CSS = `
:root {
  color-scheme: light dark;
  --bg: #ffffff; --fg: #1f2328; --muted: #59636e; --line: #d1d9e0; --code: #f6f8fa; --link: #0969da;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #0d1117; --fg: #e6edf3; --muted: #9198a1; --line: #30363d; --code: #161b22; --link: #4493f8; }
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.layout {
  display: grid; grid-template-columns: 13rem minmax(0, 46rem); gap: 0 48px;
  max-width: 66rem; margin: 0 auto; padding: 0 16px;
}
aside { position: sticky; top: 0; align-self: start; max-height: 100vh; overflow-y: auto; padding: 24px 0; }
aside .site { display: block; font-weight: 600; font-size: 1.1rem; color: var(--fg); text-decoration: none; margin-bottom: 20px; }
aside .group { color: var(--muted); font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; margin: 16px 0 4px; }
aside ul { list-style: none; margin: 0; padding: 0; }
aside li a {
  display: block; padding: 3px 10px; margin-left: -10px; border-radius: 4px;
  color: var(--fg); text-decoration: none;
}
aside li a:hover { background: var(--code); }
aside li a[aria-current] { background: var(--code); font-weight: 600; }
main { padding-top: 24px; padding-bottom: 48px; }
footer { grid-column: 2; color: var(--muted); font-size: 0.875rem; padding-bottom: 32px; }
@media (max-width: 48rem) {
  .layout { display: block; }
  aside { position: static; max-height: none; padding: 16px 0; border-bottom: 1px solid var(--line); }
  aside .site { display: inline-block; margin: 0 16px 0 0; }
  aside .group { display: none; }
  aside ul { display: inline; }
  aside li { display: inline-block; margin-right: 4px; }
  aside li a { display: inline-block; margin-left: 0; padding: 3px 8px; }
  main { padding-top: 16px; }
}
a { color: var(--link); }
h1 { font-size: 1.75rem; line-height: 1.25; margin: 0 0 0.5rem; }
h2 { font-size: 1.35rem; margin-top: 2rem; padding-bottom: 0.25rem; border-bottom: 1px solid var(--line); }
h3 { font-size: 1.1rem; margin-top: 1.5rem; }
.meta { color: var(--muted); margin: 0 0 1.5rem; }
.meta a { color: var(--muted); }
.meta span + span::before { content: "\\00b7"; margin: 0 8px; }
code, pre { font: 0.9em/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
code { background: var(--code); padding: 0.1em 0.3em; border-radius: 4px; }
pre { background: var(--code); padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; display: block; overflow-x: auto; max-width: 100%; }
th, td { border: 1px solid var(--line); padding: 6px 12px; text-align: left; vertical-align: top; }
th { background: var(--code); }
blockquote { margin: 0; padding-left: 1rem; border-left: 3px solid var(--line); color: var(--muted); }
`;

function shell({ title, current, meta, body }) {
  const item = (href, label, active) =>
    `<li><a href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a></li>`;
  const nav = [
    `<a class="site" href="index.html">${SITE_TITLE}</a>`,
    `<p class="group">Packages</p>`,
    "<ul>",
    ...packages.map((pkg) =>
      item(
        `${pkg.dir}.html`,
        pkg.dir,
        current === `${pkg.dir}.html` || current === `${pkg.dir}-changelog.html`,
      ),
    ),
    "</ul>",
    `<p class="group">Repository</p>`,
    "<ul>",
    item("index.html", "Overview", current === "index.html"),
    item("contributing.html", "Contributing", current === "contributing.html"),
    item(REPO, "GitHub", false),
    "</ul>",
  ].join("\n      ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="layout">
    <aside>
      <nav>
      ${nav}
      </nav>
    </aside>
    <main>
${meta ? `    <p class="meta">${meta}</p>\n` : ""}${body}
    </main>
    <footer>
      Built from the Markdown in <a href="${REPO}">${REPO.replace("https://", "")}</a>.
    </footer>
  </div>
</body>
</html>
`;
}

// Puts the metadata line right after the page's first heading.
function withMeta(html, meta) {
  const end = html.indexOf("</h1>");
  if (end < 0) return `<p class="meta">${meta}</p>\n${html}`;
  const cut = end + "</h1>".length;
  return `${html.slice(0, cut)}\n<p class="meta">${meta}</p>${html.slice(cut)}`;
}

function titleOf(file, fallback) {
  const match = fs.readFileSync(file, "utf8").match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/`/g, "") : fallback;
}

// ---- build ----

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const written = [];
function write(name, html) {
  fs.writeFileSync(path.join(OUT, name), html);
  written.push(name);
}

write(
  "index.html",
  shell({
    title: SITE_TITLE,
    current: "index.html",
    body: render(path.join(ROOT, "README.md")),
  }),
);

write(
  "contributing.html",
  shell({
    title: `Contributing · ${SITE_TITLE}`,
    current: "contributing.html",
    body: render(path.join(ROOT, "CONTRIBUTING.md")),
  }),
);

for (const pkg of packages) {
  const npm = `https://www.npmjs.com/package/${pkg.name}`;
  const source = `${REPO}/tree/main/packages/${pkg.dir}`;
  const links = [
    `<span>v${pkg.version}</span>`,
    `<span><a href="${npm}">npm</a></span>`,
    `<span><a href="${source}">source</a></span>`,
    pkg.changelog ? `<span><a href="${pkg.dir}-changelog.html">changelog</a></span>` : "",
  ]
    .filter(Boolean)
    .join("");

  write(
    `${pkg.dir}.html`,
    shell({
      title: `${pkg.name} · ${SITE_TITLE}`,
      current: `${pkg.dir}.html`,
      body: withMeta(render(pkg.readme), links),
    }),
  );

  if (pkg.changelog) {
    write(
      `${pkg.dir}-changelog.html`,
      shell({
        title: `${titleOf(pkg.changelog, pkg.name)} changelog · ${SITE_TITLE}`,
        current: `${pkg.dir}-changelog.html`,
        body: withMeta(
          render(pkg.changelog),
          `<span><a href="${pkg.dir}.html">${pkg.name}</a></span>`,
        ),
      }),
    );
  }
}

// Pages serves this as-is; the file tells it not to run the Markdown through Jekyll.
write(".nojekyll", "");

console.log(`${written.length} files -> ${path.relative(ROOT, OUT)}/`);
