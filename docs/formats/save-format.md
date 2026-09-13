# Native save file format

The native format is the portable JSON representation used by **Save As**, **Open**, bundled examples, and share links. It is separate from the internal IndexedDB serialization used for open editor tabs.

Each module owns its schema in `src/modules/<type>/save/saveFormat.ts`. All current formats use version `v1`.

## Shared fields

Every document is a JSON object containing:

- `apiVersion`: identifies the module and schema, using `<format-key>/v1`.
- `arguments`: an object keyed by non-negative integer argument IDs. Every argument has a string `name` and numeric `x` and `y` coordinates.
- Module-specific relation or condition data described below.
- Optional `name`, `description`, and `layoutType` metadata. Files written by **Save As** include `name`; bundled examples may also use `description` and `layoutType`.

`layoutType`, when present, is one of `TopToBottom`, `BottomToTop`, `LeftToRight`, `RightToLeft`, `ForceDirected`, `Neato`, `Circular`, or `Radial`.

AF, BAF, IAF, PAF, and SetAF reject unknown object fields. The ADF schema uses non-strict Zod objects and strips unknown fields.

## AF — Abstract Argumentation Framework

`apiVersion: "argumentation-framework/v1"`

```json
{
  "apiVersion": "argumentation-framework/v1",
  "name": "Example AF",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0 },
    "1": { "name": "b", "x": 100, "y": 0 }
  },
  "attacks": [[0, 1]]
}
```

`attacks` contains `[sourceId, targetId]` pairs. Every referenced argument must exist, and duplicate attacks are rejected.

Implementation: [`abstract-argumentation/save/saveFormat.ts`](/src/modules/abstract-argumentation/save/saveFormat.ts).

## BAF — Bipolar Argumentation Framework

`apiVersion: "bipolar-argumentation-framework/v1"`

```json
{
  "apiVersion": "bipolar-argumentation-framework/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0 },
    "1": { "name": "b", "x": 100, "y": 0 },
    "2": { "name": "c", "x": 200, "y": 0 }
  },
  "attacks": [[0, 1]],
  "supports": [[1, 2]]
}
```

`attacks` and `supports` contain `[sourceId, targetId]` pairs. Referenced arguments must exist. Duplicate pairs, including a pair present as both an attack and a support, are rejected.

Implementation: [`bipolar-argumentation/save/saveFormat.ts`](/src/modules/bipolar-argumentation/save/saveFormat.ts).

## IAF — Incomplete Argumentation Framework

`apiVersion: "incomplete-argumentation-framework/v1"`

```json
{
  "apiVersion": "incomplete-argumentation-framework/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0, "uncertain": false },
    "1": { "name": "b", "x": 100, "y": 0, "uncertain": true },
    "2": { "name": "c", "x": 200, "y": 0, "uncertain": false }
  },
  "definiteAttacks": [[0, 1]],
  "uncertainAttacks": [[1, 2]]
}
```

Every argument has an `uncertain` boolean. Attacks are split between `definiteAttacks` and `uncertainAttacks`. Referenced arguments must exist, and duplicate attack pairs are rejected across both arrays.

Implementation: [`incomplete-argumentation/save/saveFormat.ts`](/src/modules/incomplete-argumentation/save/saveFormat.ts).

## PAF — Probabilistic Argumentation Framework

`apiVersion: "probabilistic-argumentation-framework/v1"`

```json
{
  "apiVersion": "probabilistic-argumentation-framework/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0, "probability": 1 },
    "1": {
      "name": "b",
      "x": 100,
      "y": 0,
      "probability": 0.5,
      "probabilityAnnotationPosition": { "angle": 45, "distance": 60 }
    }
  },
  "attacks": [[0, 1, 0.7]]
}
```

Argument and attack probabilities are numbers from `0` through `1`. Each attack is a `[sourceId, targetId, probability]` triple; the probability is always explicit. `probabilityAnnotationPosition` is optional and stores the position of an argument's probability label. Referenced arguments must exist. The schema does not reject duplicate attack pairs.

Implementation: [`probabilistic-argumentation/save/saveFormat.ts`](/src/modules/probabilistic-argumentation/save/saveFormat.ts).

## SetAF — Argumentation Framework with Collective Attacks

`apiVersion: "set-af/v1"`

```json
{
  "apiVersion": "set-af/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0 },
    "1": { "name": "b", "x": 100, "y": 0 },
    "2": { "name": "c", "x": 200, "y": 0 }
  },
  "attacks": [{ "id": 0, "attackers": [0, 1], "target": 2 }]
}
```

Every attack has a non-negative `id`, an `attackers` array, and a `target`. All referenced arguments must exist. The schema currently accepts empty attacker arrays, repeated attackers, duplicate attacks, and duplicate attack IDs. During loading, stored attack IDs are not preserved; the model assigns IDs in array order.

Implementation: [`collective-attacks-argumentation/save/saveFormat.ts`](/src/modules/collective-attacks-argumentation/save/saveFormat.ts).

## ADF — Abstract Dialectical Framework

`apiVersion: "dialectical-argumentation-framework/v1"`

```json
{
  "apiVersion": "dialectical-argumentation-framework/v1",
  "arguments": {
    "0": { "name": "a", "x": 0, "y": 0, "condition": { "type": "tautology" } },
    "1": {
      "name": "b",
      "x": 100,
      "y": 0,
      "condition": { "type": "negation", "child": { "type": "atom", "argumentId": 0 } },
      "conditionAnnotationPosition": { "angle": 90, "distance": 70 }
    }
  }
}
```

An ADF has no separate relation array. Links are derived from argument references in each acceptance `condition`. Supported formula node types are `tautology`, `contradiction`, `atom`, `negation`, `conjunction`, and `disjunction`; see [`formulaSchema.ts`](/src/modules/dialectical-argumentation/condition/formulaSchema.ts). `conditionAnnotationPosition` optionally stores the label position.

The outer schema accepts `condition` as unknown input. During loading, a condition that does not match the formula schema is replaced with `{ "type": "tautology" }` rather than rejecting the entire file.

Implementation: [`dialectical-argumentation/save/saveFormat.ts`](/src/modules/dialectical-argumentation/save/saveFormat.ts).
