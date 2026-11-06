import fs from "node:fs/promises"
import path from "node:path"
import { OUTPUT_FILE } from "./index"
import { validateFeed } from "./validate"

const root = process.cwd()
const output = path.join(root, "public")

async function exists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(
    () => true,
    () => false,
  )
}

function outputCandidates(publicUrl: string): string[] {
  const url = new URL(publicUrl, "https://willkyu.github.io")
  if (!url.pathname.startsWith("/research/")) {
    throw new Error(`URL is outside /research/: ${publicUrl}`)
  }
  const relative = decodeURIComponent(url.pathname.slice("/research/".length))
  if (relative === "") return [path.join(output, "index.html")]
  if (path.extname(relative)) return [path.join(output, relative)]
  if (relative.endsWith("/")) return [path.join(output, relative, "index.html")]
  return [path.join(output, `${relative}.html`), path.join(output, relative, "index.html")]
}

async function requirePublicUrl(publicUrl: string): Promise<void> {
  const candidates = outputCandidates(publicUrl)
  if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
    throw new Error(`No Quartz output matches ${publicUrl}; checked ${candidates.join(", ")}`)
  }
}

async function main() {
  const feedPath = path.join(output, OUTPUT_FILE)
  const feed: unknown = JSON.parse(await fs.readFile(feedPath, "utf8"))
  validateFeed(feed)

  const files = await fs.readdir(output, { recursive: true })
  const leakedPage = files.find((file) => file.replace(/\\/g, "/").includes("_homepage"))
  if (leakedPage) throw new Error(`${leakedPage} exposes the private homepage manifest`)

  for (const indexFile of [
    "static/contentIndex.json",
    "static/encryptedContentIndex.json",
    "sitemap.xml",
    "index.xml",
  ]) {
    const indexPath = path.join(output, indexFile)
    if ((await exists(indexPath)) && (await fs.readFile(indexPath, "utf8")).includes("_homepage")) {
      throw new Error(`${indexFile} contains _homepage`)
    }
  }

  for (const item of feed.items) {
    if ("id" in item) throw new Error("feed item must not contain id")
    await requirePublicUrl(item.href)
    if (item.cover) await requirePublicUrl(item.cover)
  }
  console.log(`homepage feed verified: ${feed.items.length} item(s)`)
}

await main()
