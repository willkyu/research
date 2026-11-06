import fs from "node:fs/promises"
import path from "node:path"
import YAML from "yaml"
import type {
  BuildCtx,
  FilePath,
  FullSlug,
  ProcessedContent,
  QuartzEmitterPlugin,
} from "@quartz-community/types"
import { simplifySlug, slugifyFilePath } from "@quartz-community/utils"

export const MANIFEST_FILE = "_homepage.md"
export const OUTPUT_FILE = "homepage-feed.json"

const BINDS = new Set(["research", "blog", "pokemon", "projects"])
const APPEARANCES = new Set(["text", "gallery", "book", "browser", "disc"])
const FIELDS = new Set(["bind", "appearance", "summary", "tags", "order", "enabled", "cover"])

export interface ManifestEntry {
  target: string
  title: string
  bind: string
  appearance: string
  summary: string
  tags: string[]
  order: number
  enabled: boolean
  cover?: string
}

export interface DocumentCandidate {
  relativePath: string
  slug: string
  aliases: string[]
  frontmatter: Record<string, unknown>
}

export interface FeedItem {
  bind: string
  title: string
  summary: string
  href: string
  appearance: string
  tags: string[]
  order: number
  cover?: string
}

export interface HomepageFeed {
  schemaVersion: 1
  source: "research"
  generatedAt: string
  items: FeedItem[]
}

function fail(context: string, message: string): never {
  throw new Error(`${MANIFEST_FILE}: ${context}: ${message}`)
}

function parseFrontmatter(source: string): { body: string; data: Record<string, unknown> } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) fail("frontmatter", "must start with YAML frontmatter")

  const document = YAML.parseDocument(match[1])
  if (document.errors.length > 0) {
    fail("frontmatter", document.errors.map((error) => error.message).join("; "))
  }
  const data = document.toJS()
  if (data === null || Array.isArray(data) || typeof data !== "object") {
    fail("frontmatter", "must be a YAML mapping")
  }
  const keys = Object.keys(data as Record<string, unknown>)
  const unknown = keys.filter((key) => key !== "homepageManifest")
  if (unknown.length > 0) fail("frontmatter", `unsupported field(s): ${unknown.join(", ")}`)
  if ((data as Record<string, unknown>).homepageManifest !== 1) {
    fail("frontmatter", "homepageManifest must be the integer 1")
  }

  return { body: source.slice(match[0].length), data: data as Record<string, unknown> }
}

function parseBoolean(value: string, field: string, title: string): boolean {
  if (/^true$/i.test(value)) return true
  if (/^false$/i.test(value)) return false
  return fail(title, `${field} must be true or false`)
}

function parseCover(value: string, title: string): string {
  const match = value.match(/^!?\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/)
  if (!match || match[1].trim() === "") {
    fail(title, "cover must be an Obsidian Wiki Link")
  }
  return match[1].trim()
}

function finalizeEntry(
  heading: { target: string; title: string },
  fields: Map<string, string>,
): ManifestEntry {
  const context = `entry "${heading.title}"`
  for (const field of ["bind", "appearance", "summary", "order"]) {
    if (!fields.has(field) || fields.get(field)?.trim() === "") {
      fail(context, `missing required field: ${field}`)
    }
  }

  const bind = fields.get("bind")!.trim()
  if (!BINDS.has(bind)) fail(context, `invalid bind "${bind}"`)
  const appearance = fields.get("appearance")!.trim()
  if (!APPEARANCES.has(appearance)) fail(context, `invalid appearance "${appearance}"`)
  const summary = fields.get("summary")!.trim()
  const orderText = fields.get("order")!.trim()
  if (!/^-?\d+$/.test(orderText)) fail(context, "order must be an integer")
  const order = Number(orderText)
  if (!Number.isSafeInteger(order)) fail(context, "order must be a safe integer")

  const coverValue = fields.get("cover")?.trim()
  if (appearance !== "text" && !coverValue) {
    fail(context, `appearance "${appearance}" requires cover`)
  }

  const tags = (fields.get("tags") ?? "")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
  const entry: ManifestEntry = {
    target: heading.target,
    title: heading.title,
    bind,
    appearance,
    summary,
    tags,
    order,
    enabled: fields.has("enabled")
      ? parseBoolean(fields.get("enabled")!.trim(), "enabled", context)
      : true,
  }
  if (coverValue) entry.cover = parseCover(coverValue, context)
  return entry
}

export function parseManifest(source: string): ManifestEntry[] {
  const { body } = parseFrontmatter(source)
  const lines = body.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)
  const entries: ManifestEntry[] = []
  let heading: { target: string; title: string } | undefined
  let fields = new Map<string, string>()

  const finish = () => {
    if (!heading) return
    entries.push(finalizeEntry(heading, fields))
    heading = undefined
    fields = new Map()
  }

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim()
    if (line === "") continue
    if (line.startsWith("##")) {
      finish()
      const match = line.match(/^##\s+\[\[([^\]|]+)\|([^\]]+)\]\]$/)
      if (!match || match[1].trim() === "" || match[2].trim() === "") {
        fail(`line ${index + 1}`, "level-two heading must be [[document|homepage title]]")
      }
      const target = match[1].trim()
      if (target.includes("#"))
        fail(`entry "${match[2].trim()}"`, "document link cannot include an anchor")
      heading = { target, title: match[2].trim() }
      continue
    }
    if (!heading) fail(`line ${index + 1}`, "content must be inside a level-two manifest entry")

    const fieldMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*)::\s*(.*)$/)
    if (!fieldMatch) fail(`entry "${heading.title}"`, `invalid field line: ${line}`)
    const [, key, value] = fieldMatch
    if (key === "id")
      fail(`entry "${heading.title}"`, "id is generated by the consumer and must not be set")
    if (!FIELDS.has(key)) fail(`entry "${heading.title}"`, `unsupported field: ${key}`)
    if (fields.has(key)) fail(`entry "${heading.title}"`, `duplicate field: ${key}`)
    fields.set(key, value)
  }
  finish()
  return entries
}

function decodeTarget(value: string, context: string): string {
  try {
    return decodeURIComponent(value.trim()).replace(/\\/g, "/")
  } catch {
    return fail(context, `invalid URL encoding in Wiki Link target "${value}"`)
  }
}

function normalizeDocumentIdentifier(
  value: string,
  basePath: string,
  stripSiteBase = false,
): string | undefined {
  let decoded = decodeTarget(value, "document link")
  if (/^[a-z][a-z0-9+.-]*:/i.test(decoded)) return undefined
  decoded = decoded.replace(/^\/+/, "")
  if (stripSiteBase && basePath && decoded.startsWith(`${basePath.slice(1)}/`)) {
    decoded = decoded.slice(basePath.length)
  }
  return slugifyFilePath(decoded as FilePath)
}

function matchingDocuments(
  target: string,
  documents: DocumentCandidate[],
  basePath: string,
): DocumentCandidate[] {
  const normalized = normalizeDocumentIdentifier(target, basePath)
  if (!normalized) return []
  const multiSegment = normalized.includes("/")
  return documents.filter((document) => {
    const identifiers = [document.slug, slugifyFilePath(document.relativePath as FilePath)]
    for (const alias of document.aliases) {
      const normalizedAlias = normalizeDocumentIdentifier(alias, basePath, true)
      if (normalizedAlias) identifiers.push(normalizedAlias)
    }
    return identifiers.some((identifier) => {
      if (identifier === normalized) return true
      if (multiSegment) return identifier.endsWith(`/${normalized}`)
      return identifier.split("/").at(-1) === normalized
    })
  })
}

function resolveDocument(
  entry: ManifestEntry,
  documents: DocumentCandidate[],
  basePath: string,
): DocumentCandidate {
  const matches = matchingDocuments(entry.target, documents, basePath)
  if (matches.length === 0)
    fail(`entry "${entry.title}"`, `document Wiki Link cannot be resolved: [[${entry.target}]]`)
  if (matches.length > 1) {
    fail(
      `entry "${entry.title}"`,
      `ambiguous document Wiki Link [[${entry.target}]] matches ${matches.map((match) => match.relativePath).join(", ")}`,
    )
  }
  return matches[0]
}

function siteBasePath(baseUrl: string | undefined): string {
  if (!baseUrl) return ""
  const url = new URL(baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`)
  const pathname = url.pathname.replace(/\/+$/, "")
  return pathname === "/" ? "" : pathname
}

function normalizePublicSlug(value: string, basePath: string): string {
  let decoded = decodeTarget(value, "published slug")
  if (/^https?:\/\//i.test(decoded)) {
    decoded = new URL(decoded).pathname
  }
  decoded = decoded.replace(/^\/+/, "")
  if (basePath && decoded.startsWith(`${basePath.slice(1)}/`)) {
    decoded = decoded.slice(basePath.length)
  }
  return decoded.replace(/\/+$/, "")
}

function publicHref(slug: string, basePath: string): string {
  const simple = simplifySlug(slug as FullSlug)
  if (simple === "/") return `${basePath || ""}/`
  return `${basePath}/${encodeURI(simple)}`.replace(/^\/\//, "/")
}

function documentHref(document: DocumentCandidate, basePath: string): string {
  for (const field of ["slug", "permalink"]) {
    const value = document.frontmatter[field]
    if (typeof value !== "string" || value.trim() === "") continue
    const preferred = normalizePublicSlug(value, basePath)
    const publishedAliases = document.aliases
      .map((alias) => normalizePublicSlug(alias, basePath))
      .filter(Boolean)
    if (
      preferred === normalizePublicSlug(document.slug, basePath) ||
      publishedAliases.includes(preferred)
    ) {
      return publicHref(preferred, basePath)
    }
  }
  return publicHref(document.slug, basePath)
}

function resolveAsset(target: string, files: string[], basePath: string, title: string): string {
  if (target.includes("#")) fail(`entry "${title}"`, "cover link cannot include an anchor")
  const decoded = decodeTarget(target, `entry "${title}"`)
  if (/^[a-z][a-z0-9+.-]*:/i.test(decoded)) {
    fail(`entry "${title}"`, "cover must link to a local Quartz attachment")
  }
  const normalized = slugifyFilePath(decoded.replace(/^\/+/, "") as FilePath)
  const multiSegment = normalized.includes("/")
  const matches = files
    .filter((file) => !file.toLowerCase().endsWith(".md"))
    .map((file) => ({ file, slug: slugifyFilePath(file as FilePath) }))
    .filter(
      ({ slug }) =>
        slug === normalized ||
        (multiSegment ? slug.endsWith(`/${normalized}`) : slug.split("/").at(-1) === normalized),
    )
  if (matches.length === 0)
    fail(`entry "${title}"`, `cover Wiki Link cannot be resolved: [[${target}]]`)
  if (matches.length > 1) {
    fail(
      `entry "${title}"`,
      `ambiguous cover Wiki Link [[${target}]] matches ${matches.map((match) => match.file).join(", ")}`,
    )
  }
  return `${basePath}/${encodeURI(matches[0].slug)}`.replace(/^\/\//, "/")
}

export function buildFeed(
  entries: ManifestEntry[],
  documents: DocumentCandidate[],
  files: string[],
  baseUrl: string | undefined,
  generatedAt = new Date().toISOString(),
): HomepageFeed {
  const basePath = siteBasePath(baseUrl)
  const items: FeedItem[] = []
  const hrefs = new Map<string, string>()

  for (const entry of entries) {
    if (!entry.enabled) continue
    const document = resolveDocument(entry, documents, basePath)
    const href = documentHref(document, basePath)
    if (!href.startsWith(`${basePath || ""}/`)) {
      fail(`entry "${entry.title}"`, `resolved document URL is outside the site: ${href}`)
    }
    const duplicate = hrefs.get(href)
    if (duplicate)
      fail(`entry "${entry.title}"`, `duplicate href ${href} (already used by "${duplicate}")`)
    hrefs.set(href, entry.title)

    const item: FeedItem = {
      bind: entry.bind,
      title: entry.title,
      summary: entry.summary,
      href,
      appearance: entry.appearance,
      tags: entry.tags,
      order: entry.order,
    }
    if (entry.cover) item.cover = resolveAsset(entry.cover, files, basePath, entry.title)
    items.push(item)
  }

  items.sort(
    (left, right) =>
      left.order - right.order || (left.href < right.href ? -1 : left.href > right.href ? 1 : 0),
  )
  return { schemaVersion: 1, source: "research", generatedAt, items }
}

function sourceDocuments(content: ProcessedContent[], sourceFiles: string[]): DocumentCandidate[] {
  const markdownFiles = new Set(sourceFiles.filter((file) => file.toLowerCase().endsWith(".md")))
  return content.flatMap(([, file]) => {
    const relativePath = file.data.relativePath?.toString()
    const slug = file.data.slug?.toString()
    if (!relativePath || !slug || !markdownFiles.has(relativePath)) return []
    return [
      {
        relativePath,
        slug,
        aliases: (file.data.aliases ?? []).map(String),
        frontmatter: (file.data.frontmatter ?? {}) as Record<string, unknown>,
      },
    ]
  })
}

const HomepageFeedEmitter: QuartzEmitterPlugin = () => {
  const emit = async (ctx: BuildCtx, content: ProcessedContent[]) => {
    const manifestPath = path.join(ctx.argv.directory, MANIFEST_FILE)
    const source = await fs.readFile(manifestPath, "utf8").catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") fail("manifest", `missing ${manifestPath}`)
      throw error
    })
    const entries = parseManifest(source)
    const files = ctx.allFiles.map(String)
    const feed = buildFeed(
      entries,
      sourceDocuments(content, files),
      files,
      ctx.cfg.configuration.baseUrl,
    )
    const outputPath = path.join(ctx.argv.output, OUTPUT_FILE)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8")
    return [outputPath as FilePath]
  }

  return {
    name: "HomepageFeed",
    emit,
    partialEmit: (ctx, content) => emit(ctx, content),
  }
}

export { HomepageFeedEmitter }
export default HomepageFeedEmitter
