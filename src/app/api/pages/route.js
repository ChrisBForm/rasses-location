import fs from "fs";
import path from "path";

function getAllPages(dir, prefix = "") {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip special directories and files
    if (
      entry.name.startsWith("_") ||
      entry.name.startsWith(".") ||
      entry.name === "api"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      pages.push(...getAllPages(fullPath, prefix + "/" + entry.name));
    } else if (entry.name === "page.js") {
      // Found a page, extract route and metadata
      const slug = prefix || "/";
      const title = formatTitle(slug);

      pages.push({
        id: slug,
        title,
        slug,
        description: getDescription(slug),
        lastModified: fs.statSync(fullPath).mtime.toISOString().split("T")[0],
      });
    }
  }

  return pages;
}

function formatTitle(slug) {
  return slug
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDescription(slug) {
  const descriptions = {
    "/": "Main landing page with gallery and parallax effects",
    "/manuals": "PDF library fetched from Firebase Storage",
    "/activities": "Interactive map with points of interest",
    "/admin": "Dashboard and content management hub",
    "/auth": "Authentication and login page",
    "/admin/pages": "Page management and site overview",
  };
  return descriptions[slug] || "Application page";
}

export async function GET() {
  try {
    const appDir = path.join(process.cwd(), "src/app");
    const pages = getAllPages(appDir);

    // Sort by slug, root page first
    pages.sort((a, b) => {
      if (a.slug === "/") return -1;
      if (b.slug === "/") return 1;
      return a.slug.localeCompare(b.slug);
    });

    return Response.json(pages);
  } catch (error) {
    console.error("Error reading pages:", error);
    return Response.json(
      { error: "Failed to read pages" },
      { status: 500 }
    );
  }
}
