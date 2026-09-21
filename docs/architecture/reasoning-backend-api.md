# Reasoning backend API (TweetyProject)

The reasoning backend is a vendored TweetyProject web service (Java, Spring, listening on port
`8081`) that computes argumentation semantics. All TweetyProject endpoints are exposed publically (the IP-based rate limits still apply).

- **Server routes:** `RequestController.java` in `third-party/.../org-tweetyproject-web/src/main/java/org/tweetyproject/web/services/`
- **Client adapters (source of truth for what the app actually sends):**
  `src/modules/common/evaluation/tweety-project/fetch.ts` (envelope) and each module's
  `evaluation/tweetyProject*.ts`
- **Routing:** in dev, Vite proxies these paths; in production, Caddy reverse-proxies them (see
  [`deployment/Caddyfile`](/deployment/Caddyfile)). The paths below are relative to that origin.

This service owns no persistent state. Every call is a self-contained `POST`.

An interactive, browsable version of this contract (Swagger UI with "Try it out") is served at
`/api` on the deployment, backed by [`public/openapi.yaml`](/public/openapi.yaml). Keep that
spec in sync with this document when endpoints change.

## Request/response envelope

All reasoning endpoints are `POST` with `Content-Type: application/json` and return
`application/json`. Every request carries these common fields:

| Field          | Type   | Notes                                                                   |
| -------------- | ------ | ----------------------------------------------------------------------- |
| `email`        | string | Caller identifier, not authentication. The app sends a source-tree tag. |
| `cmd`          | string | The operation — allowed values differ per endpoint (see below).         |
| `timeout`      | number | Requested compute budget. The server clamps it to a per-endpoint cap.   |
| `unit_timeout` | string | Timeout unit. The app always sends `"ms"`.                              |

Every reasoning response shares one envelope:

```jsonc
{
  "time": 0.0123, // compute time (seconds)
  "answer": "[{1,2},{3}]", // stringified result — parsed client-side (see below)
  "status": "SUCCESS", // "SUCCESS", "ERROR", "TIMEOUT", ...
}
```

`answer` is a **string**, not structured JSON, and each endpoint's client adapter parses it. A few
endpoints add one extra top-level field (noted per endpoint). On timeout/rate-limit the transport
maps HTTP status instead: `408/504/524` → timeout, `429` → rate-limited, `502/503` → unavailable
(see `fetch.ts`).

### Argument and attack encoding

- Arguments are referenced by **1-based integer ids** `1 … nr_of_arguments` (see
  `buildArgumentIdMapping`). The app keeps the id↔name mapping and maps results back.
- An attack is a pair `[source, target]`; the `attacks` field is an array of such pairs.
- The `answer` string uses `{ … }` for a set of argument ids and `[ … ]` to wrap a list of sets,
  e.g. a single extension is `{1,3}` and a list of extensions is `[{1,3},{2}]` (grammar in
  `tweety-project/listOfSets.ts`).

## Endpoints

Only the routes AgonProject calls are listed. The controller also exposes `/aba`, `/delp`,
`/incmes`, and `/sequence-explanation`, which the app does not use.

### `POST /dung` — abstract argumentation frameworks

`cmd`: `get_models` (all extensions), `get_credulous`, `get_skeptical` (accepted-argument set),
or `info`.

| Field             | Type                  | Notes                                                 |
| ----------------- | --------------------- | ----------------------------------------------------- |
| `nr_of_arguments` | number                | Argument count; ids are `1…n`.                        |
| `attacks`         | number[][]            | Attack pairs.                                         |
| `semantics`       | string                | Semantics key, e.g. `ST`, `PR`, `GR` (see below).     |
| `args`            | Record<string,string> | Meta-reasoner parameters (empty for plain semantics). |

`answer`: list-of-sets for `get_models`, a single set for `get_credulous`/`get_skeptical`.

### `POST /setaf` — collective-attack (SETAF) frameworks

Same shape as `/dung` (`get_models`/`get_credulous`/`get_skeptical`), except attacks are
collective: each `attacks` entry's leading ids are the attacking set and the last id is the target.
No `args` field.

### `POST /bipolar` — bipolar frameworks (attacks + supports)

`cmd`: `get_models`, `get_credulous`, `get_skeptical`. Adds:

| Field          | Type       | Notes                                              |
| -------------- | ---------- | -------------------------------------------------- |
| `supports`     | number[][] | Support pairs.                                     |
| `support_type` | string     | Support interpretation (e.g. deductive/necessary). |

### `POST /adf` — abstract dialectical frameworks

`cmd`: `get_models`, `get_credulous`, `get_skeptical`. Instead of `attacks`:

| Field        | Type     | Notes                                                                            |
| ------------ | -------- | -------------------------------------------------------------------------------- |
| `conditions` | string[] | One acceptance condition per argument, in id order (KPP prefix form, see below). |

Each entry is a KPP-style statement `ac(<id>, <formula>)` binding argument `<id>` to a
propositional formula over the arguments. This is a prefix notation (Tweety's ADF reader), distinct
from the infix syntax (`¬ ∧ ∨ ⊤ ⊥`) the app's condition editor shows:

```text
condition := ac( <id> , <formula> )
formula   := neg( <formula> )              # negation
           | and( <formula> , <formula> )  # conjunction — binary; nest for >2 (and(a,and(b,c)))
           | or(  <formula> , <formula> )  # disjunction — binary; nest for >2
           | c(v)                          # true / tautology
           | c(f)                          # false / contradiction
           | <id>                          # an argument, referenced by its 1-based id
```

For example `ac(1,neg(2))` = "argument 1 is accepted exactly when argument 2 is not", and
`ac(2,1)` = "argument 2 is accepted exactly when argument 1 is". The client builds these strings in
`formulaToKpp` (`src/modules/dialectical-argumentation/evaluation/tweetyProject.ts`).

`answer` encodes three-valued interpretations (parsed by `parseInterpretations`): per set, `t(n)`
= in, `f(n)` = out, `u(n)` = undecided.

### `POST /paf` — probabilistic frameworks

`cmd`: `get_credulous`, `get_skeptical`. Adds:

| Field                    | Type     | Notes                                           |
| ------------------------ | -------- | ----------------------------------------------- |
| `argument_probabilities` | number[] | Per-argument probability, in id order.          |
| `attack_probabilities`   | number[] | Per-attack probability, aligned with `attacks`. |
| `solver`                 | string   | Which probabilistic solver to run.              |

`answer`: per-argument acceptance scores.

### `POST /iaf` — incomplete frameworks

`cmd`: `get_models_{pos,nec}`, `get_credulous_{pos,nec}`, `get_skeptical_{pos,nec}` (or `info`).
The `pos`/`nec` suffix selects possible vs. necessary reasoning. Instead of a single `attacks`:

| Field                | Type       | Notes                               |
| -------------------- | ---------- | ----------------------------------- |
| `uncertainArguments` | number[]   | Ids that may or may not be present. |
| `definiteAttacks`    | number[][] | Attacks that certainly hold.        |
| `uncertainAttacks`   | number[][] | Attacks that may hold.              |

### `POST /rankings` — ranking semantics

`cmd`: `get_model`. Fields as `/dung` (`nr_of_arguments`, `attacks`, `semantics`, optional `args`).
Response adds a top-level `rankingType`: `"numerical"` or `"lattice"`. `answer`: per-argument scores.

### `POST /serialisation` — serialised / step-by-step reasoning

`cmd`:

- `get_selection` — initial sets selectable at the current step (`answer`: list-of-sets). Takes
  `selectionFunction`.
- `is_terminal` — whether `extension` (a `number[]`) is a terminal state (`answer`: `"true"`/`"false"`).
  Takes `terminationFunction` and `extension`.
- `get_sequences` — all serialisation sequences (`answer`: list of sequences). Takes both
  `selectionFunction` and `terminationFunction`.

Common fields: `nr_of_arguments`, `attacks`.

### `POST /info` and `/ping`

`/info` (also reachable as `cmd: "info"` on `/dung`) returns the supported `semantics` and
`commands` for the Dung services plus the backend timeout cap. `/ping` is a health check. Neither is
used in the normal evaluation flow.

## Semantics keys

The canonical, machine-readable list of Dung semantics keys and meta-reasoner parameters is served
by `/info` and mirrored in `src/modules/abstract-argumentation/evaluation/tweetyProject.ts`
(`KNOWN_SEMANTIC_GROUPS`, `KNOWN_META_REASONERS`). Common keys: `CF` conflict-free, `ADM`
admissible, `CO` complete, `GR` grounded, `PR` preferred, `ST` stable, `SST` semi-stable, `ID`
ideal, `STG` stage.
