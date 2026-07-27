# Phase 1 Agent Contract

Read this before editing any page/component in your assigned bucket.

## Goal
Make pages attractive, responsive, and performant. Finish the antd 4 to 5 migration for every file you touch. Do not expand your scope beyond your assigned bucket.

## Per-file migration checklist

1. **moment -> dayjs**
   - Replace `import moment from "moment"` with `import dayjs from "dayjs"`.
   - Replace `moment(...)` calls with `dayjs(...)`. `.format`, `.add`, `.subtract`, `.diff`, `.toDate`, `.isBefore`, `.isAfter` all work.
   - If you need plugin methods (e.g. `isSameOrBefore`, `isBetween`, `customParseFormat`), add them in `src/design-system/dayjs.js` (create the file if it does not exist) and import that file once.

2. **PageHeader**
   - `import { PageHeader } from "antd"` -> `import { PageHeader } from "../../design-system"` (adjust relative path).
   - Props are drop-in: `title`, `subTitle`, `extra`, `onBack`, `breadcrumb`, `footer`, `ghost`, `tags`, `avatar`.

3. **visible -> open**
   - Apply on Modal, Drawer, Tooltip, Popover, Dropdown, Popconfirm.

4. **Dropdown overlay**
   - `<Dropdown overlay={<Menu>...</Menu>}>` -> `<Dropdown menu={{ items: [...] }}>`.

5. **Tabs**
   - `<Tabs><TabPane .../></Tabs>` -> `<Tabs items={[{ key, label, children }, ...]} />`.

6. **Tag colors**
   - Preset keys (`red`, `blue`, `geekblue`, etc.) still work. Hex overrides still work. No change needed unless the color is wrong.

7. **Static message / Modal.confirm**
   - `message.success(...)`, `Modal.confirm(...)` still work via the root `<App />` wrapper. Console may warn about `App.useApp()`. Leave as-is for this pass.

## Styling rules
- Use CSS variables from `tokens.css` and utility classes from `utilities.css`. No new hardcoded hex colors.
- Responsive: columns stack under 768px. Tables: wrap in `.ds-scroll-x` or set `scroll={{ x: 'max-content' }}`. Modals: `width="min(720px, 92vw)"`.
- Prefer design-system `Section` / `ResponsiveGrid` over ad-hoc divs.
- No emojis. No load-bearingless comments.

## Do NOT touch
- `src/App.js`
- `src/store/**`
- `src/urlMappings.js`
- `src/utils/**` (Config.js, API services, helpers)
- Redux actions / reducers / sagas
- Auth flows, protected route logic

## Perf hints (opportunistic)
- Wrap obvious list rows in `React.memo`.
- Use `useMemo` for derived table data / column definitions.
- Do not refactor Redux patterns or fetching logic.

## Testing
At the end of your bucket run:
```
NODE_OPTIONS=--openssl-legacy-provider npx react-scripts build
```
(Windows cmd: `set NODE_OPTIONS=--openssl-legacy-provider && npx react-scripts build`).
The build must succeed for your files. If another bucket's file fails, note it and move on.
