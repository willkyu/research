const BINDS = new Set(["research", "blog", "pokemon", "projects"])
const APPEARANCES = new Set(["text", "gallery", "book", "browser", "disc"])
const TOP_LEVEL_FIELDS = new Set(["schemaVersion", "source", "generatedAt", "items"])
const ITEM_FIELDS = new Set([
  "bind",
  "title",
  "summary",
  "href",
  "appearance",
  "tags",
  "order",
  "cover",
])

export interface ValidatedFeedItem {
  bind: string
  title: string
  summary: string
  href: string
  appearance: string
  tags: string[]
  order: number
  cover?: string
}

export interface ValidatedFeed {
  schemaVersion: 1
  source: "research"
  generatedAt: string
  items: ValidatedFeedItem[]
}

function record(value: unknown, context: string): asserts value is Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new Error(`${context} must be an object`)
  }
}

function nonEmptyString(
  value: unknown,
  field: string,
  singleLine = false,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} must be a non-empty string`)
  }
  if (singleLine && /[\r\n]/.test(value)) throw new Error(`${field} must be a single line`)
}

function publicUrl(value: unknown, field: string): asserts value is string {
  nonEmptyString(value, field)
  if (!value.startsWith("/research/")) throw new Error(`${field} must start with /research/`)
}

function unknownFields(value: Record<string, unknown>, allowed: Set<string>, context: string) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key))
  if (unknown.length > 0)
    throw new Error(`${context} contains unknown field(s): ${unknown.join(", ")}`)
}

export function validateFeed(value: unknown): asserts value is ValidatedFeed {
  record(value, "homepage feed")
  unknownFields(value, TOP_LEVEL_FIELDS, "homepage feed")
  if (value.schemaVersion !== 1) throw new Error("schemaVersion must be 1")
  if (value.source !== "research") throw new Error('source must be "research"')
  if (
    typeof value.generatedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.generatedAt) ||
    Number.isNaN(Date.parse(value.generatedAt))
  ) {
    throw new Error("generatedAt must be a UTC ISO-8601 timestamp")
  }
  if (!Array.isArray(value.items)) throw new Error("items must be an array")

  const hrefs = new Set<string>()
  let previous: ValidatedFeedItem | undefined
  for (const [index, candidate] of value.items.entries()) {
    const context = `items[${index}]`
    record(candidate, context)
    if ("id" in candidate) throw new Error(`${context}.id is not allowed`)
    unknownFields(candidate, ITEM_FIELDS, context)

    if (typeof candidate.bind !== "string" || !BINDS.has(candidate.bind)) {
      throw new Error(`${context}.bind is invalid`)
    }
    if (typeof candidate.appearance !== "string" || !APPEARANCES.has(candidate.appearance)) {
      throw new Error(`${context}.appearance is invalid`)
    }
    nonEmptyString(candidate.title, `${context}.title`, true)
    nonEmptyString(candidate.summary, `${context}.summary`, true)
    publicUrl(candidate.href, `${context}.href`)
    if (!Array.isArray(candidate.tags) || candidate.tags.some((tag) => typeof tag !== "string")) {
      throw new Error(`${context}.tags must be a string array`)
    }
    if (candidate.tags.some((tag) => tag.trim() === "" || /[\r\n]/.test(tag))) {
      throw new Error(`${context}.tags must contain non-empty single-line strings`)
    }
    if (!Number.isSafeInteger(candidate.order)) {
      throw new Error(`${context}.order must be a safe integer`)
    }
    if (candidate.cover !== undefined) publicUrl(candidate.cover, `${context}.cover`)
    if (candidate.appearance !== "text" && candidate.cover === undefined) {
      throw new Error(`${context}.cover is required for ${candidate.appearance}`)
    }
    if (hrefs.has(candidate.href))
      throw new Error(`${context}.href is duplicated: ${candidate.href}`)
    hrefs.add(candidate.href)

    const item = candidate as unknown as ValidatedFeedItem
    if (
      previous &&
      (previous.order > item.order || (previous.order === item.order && previous.href > item.href))
    ) {
      throw new Error("items must be sorted by order and then href")
    }
    previous = item
  }
}
