// برای گرفتن خطاهای async در Express
export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (v) => UUID_RE.test(v || '')
