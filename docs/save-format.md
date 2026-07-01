# Native Save File Format

This describes the JSON format each argumentation module reads and writes via `saveFormat.ts` (see [`src/modules/*/save/saveFormat.ts`](/src/modules/abstract-argumentation/save/saveFormat.ts)). It's the format behind:

- **Save As / Open** file dialogs (`HomeView.vue`)
- **Share links** (`ShareView.vue`, backed by [`servers/share`](/servers/share/README.md) — the server just stores and returns this exact string)
- **Bundled examples** (`src/modules/*/examples/*.json`)

This is a different thing from `ModuleConfig.serialize`/`.deserialize` (used by [`useDocuments.ts`](/src/modules/common/documents/useDocuments.ts) to persist open tabs in IndexedDB). That mechanism dumps the internal `DirectedGraph` representation directly and isn't meant to be read outside the app; this document only covers the portable `.json` format.

## Shared envelope

Every format is a JSON object with:

- `apiVersion` — a literal string `<format-key>/v<n>`, e.g. `"argumentation-framework/v1"`. Used both to identify the format and, via `canLoadFromObject`, to auto-detect which module a dropped/shared file belongs to: on Open or Share-load, every registered module's `canLoadFromObject` is probed against the parsed JSON until one matches.
- `arguments` — an object keyed by argument ID (non-negative integer, as a string key), each value at least `{ name, x, y }` plus whatever extra per-argument data that format needs.
- one or more relation fields (name varies per format — see below).
- Bundled examples only: optional `name`, `description`, `layoutType` (added via the shared `ExampleSaveExtension`, stripped back out before constructing the in-memory model).

All schemas are `zod` `strictObject`s — unknown keys are rejected, not ignored. Relation arrays are cross-validated against `arguments` (`validateLinks` in [`common/argumentation/save/saveFormat.ts`](/src/modules/common/argumentation/save/saveFormat.ts)): every referenced ID must exist, and the same `(source, target)` pair can't appear twice, even across different relation kinds (e.g. as both an attack and a support in BAF).

Versioning: bump the `/v<n>` suffix when a schema change would break existing files, and keep the old version loadable. There's currently no migration code anywhere — every format is still at `v1`.

## AF — Abstract Argumentation Framework

`apiVersion: "argumentation-framework/v1"` — [`abstract-argumentation/save/saveFormat.ts`](/src/modules/abstract-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "argumentation-framework/v1",
  "arguments": { "0": { "name": "a", "x": 0, "y": 0 } },
  "attacks": [[0, 1]]
}
```

`attacks` is an array of `[sourceId, targetId]` pairs.

## BAF — Bipolar Argumentation Framework

`apiVersion: "bipolar-argumentation-framework/v1"` — [`bipolar-argumentation/save/saveFormat.ts`](/src/modules/bipolar-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "bipolar-argumentation-framework/v1",
  "arguments": { "0": { "name": "a", "x": 0, "y": 0 } },
  "attacks": [[0, 1]],
  "supports": [[1, 2]]
}
```

`attacks` and `supports` are both `[sourceId, targetId]` pair arrays; `validateLinks` rejects the same pair appearing in both.

## IAF — Incomplete Argumentation Framework

`apiVersion: "incomplete-argumentation-framework/v1"` — [`incomplete-argumentation/save/saveFormat.ts`](/src/modules/incomplete-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "incomplete-argumentation-framework/v1",
  "arguments": { "0": { "name": "a", "x": 0, "y": 0, "uncertain": true } },
  "definiteAttacks": [[0, 1]],
  "uncertainAttacks": [[1, 2]]
}
```

Each argument carries an `uncertain` boolean. Attacks are split into `definiteAttacks` and `uncertainAttacks` (rather than one array with a per-edge flag).

## PAF — Probabilistic Argumentation Framework

`apiVersion: "probabilistic-argumentation-framework/v1"` — [`probabilistic-argumentation/save/saveFormat.ts`](/src/modules/probabilistic-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "probabilistic-argumentation-framework/v1",
  "arguments": { "0": { "name": "a", "x": 0, "y": 0, "probability": 0.5 } },
  "attacks": [[0, 1, 0.7]]
}
```

Each argument carries a `probability` (`0`–`1`). `attacks` entries are `[sourceId, targetId, probability]` triples — every attack always states its probability explicitly (unlike the ICCMA-style export, this format doesn't omit the `1` case).

## SetAF — Argumentation Framework with Collective Attacks

`apiVersion: "set-af/v1"` — [`collective-attacks-argumentation/save/saveFormat.ts`](/src/modules/collective-attacks-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "set-af/v1",
  "arguments": { "0": { "name": "a", "x": 0, "y": 0 } },
  "attacks": [{ "id": 0, "attackers": [0, 1], "target": 2 }]
}
```

Each collective attack is an object with its own `id` (so it can be referenced/deleted independently, since two different attacks could otherwise have the same `attackers`/`target`), an `attackers` array (arbitrary size ≥ 1), and a `target`.

## ADF — Dialectical Argumentation Framework

`apiVersion: "dialectical-argumentation-framework/v1"` — [`dialectical-argumentation/save/saveFormat.ts`](/src/modules/dialectical-argumentation/save/saveFormat.ts)

```json
{
  "apiVersion": "dialectical-argumentation-framework/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0, "condition": { "type": "tautology" } },
    "1": {
      "name": "b",
      "x": 100,
      "y": 0,
      "condition": { "type": "negation", "child": { "type": "atom", "argumentId": 0 } }
    }
  }
}
```

There's no separate attack/support array — ADF has none; links are entirely derived from each argument's `condition` acceptance-condition formula (see `FormulaNodeSchema` in [`condition/formulaSchema.ts`](/src/modules/dialectical-argumentation/condition/formulaSchema.ts) for the recursive `tautology | contradiction | atom | negation | conjunction | disjunction` shape). On load, every argument's condition is re-applied via `setCondition` once all arguments exist, which re-derives the graph edges from the referenced argument IDs inside each formula.

## Adding a new format

Follow an existing `saveFormat.ts` (e.g. [`bipolar-argumentation/save/saveFormat.ts`](/src/modules/bipolar-argumentation/save/saveFormat.ts) if your format needs more than one relation kind):

1. Pick a unique `API_VERSION` string: `<format-key>/v1`.
2. Define a `strictObject` `SaveSchema` with `apiVersion`, `arguments`, and whatever relation field(s) your model needs; reuse `ArgumentIdSaveSchema` / `ArgumentsSaveSchema` / `LinksSaveSchema` / `validateLinks` from `common/argumentation/save/saveFormat.ts` where they fit.
3. Implement `saveAsString`, `loadFromString`, `loadExampleFromJson`, and `canLoadFromObject` (the last is just `makeCanLoadFromObject(API_VERSION)`).
4. Register them on your `ModuleConfig` (`getSaveString`, `load`, `canLoadFromObject`) — see [`abstractArgumentationModule`](/src/modules/abstract-argumentation/moduleConfig.ts).
5. Update this document alongside the code.
