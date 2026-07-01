# ICCMA File Format

This describes the plain-text format used by the `ICCMA` export available for each argumentation module (see [`ExportConfig`](/src/modules/common/export/index.ts)), modeled after the format used by the [International Competition on Computational Models of Argumentation (ICCMA)](https://argumentationcompetition.org/).

Only the **AF** format below is an official ICCMA format, as specified in the [ICCMA 2025 rules](https://argumentationcompetition.org/2025/rules.html). ICCMA does not (yet) define competition formats for SetAF, BAF, iAF, or PAF, so the formats for those are project-specific extensions, kept as close to the AF format's style as possible. There is currently no export for ADF.

## Shared conventions

Every format below shares the same skeleton:

- The first line is the **problem line**: `p <type> <n>`, where `<type>` identifies the format and `<n>` is the number of arguments.
- Arguments are not declared explicitly — they are the integers `1` to `<n>`, implied by the problem line.
- Every following line describes one relation (or annotation), one per line.
- Lines are terminated with `\r\n`.
- A line starting with `#` is a comment (per the official AF/ABA rules).

Where a format only has one kind of relation, its lines are bare, e.g. `<source> <target>` for an attack. Where a format has more than one kind of line, a line only gets a **leading qualifier letter** when it's needed to disambiguate it from another kind of line at the same arity — the same principle the official ABA format already uses (`a`/`c`/`r`). This keeps the base case (AF) exactly as ICCMA defines it, and keeps every extension minimal.

## AF — Abstract Argumentation Framework (official)

Implemented in [`abstract-argumentation/export.ts`](/src/modules/abstract-argumentation/export.ts).

```
p af <n>
<source> <target>
...
```

One line per attack. No qualifier needed — attacks are the only relation.

```
p af 5
1 2
2 4
4 5
5 4
5 5
```

## SetAF — Argumentation Framework with Collective Attacks

Implemented in [`collective-attacks-argumentation/export.ts`](/src/modules/collective-attacks-argumentation/export.ts).

```
p setaf <n>
<attacker_1> ... <attacker_k> <target>
...
```

One line per collective attack: the (sorted) attacking set, followed by the target as the last number. A single-attacker line (`<source> <target>`) is just the size-1 case, so this is a strict syntactic superset of the AF format above. No qualifier letter needed, since there's still only one relation kind — arity alone conveys the size of the attacking set.

```
p setaf 4
1 4
1 2 4
2 3 1
```

Here, `{1}` attacks `4`, `{1,2}` attacks `4`, and `{2,3}` attacks `1`.

## BAF — Bipolar Argumentation Framework

Implemented in [`bipolar-argumentation/export.ts`](/src/modules/bipolar-argumentation/export.ts).

```
p baf <n>
<source> <target>          # attack
s <source> <target>        # support
...
```

Attacks are bare, matching AF. Supports are qualified with a leading `s`, since both kinds of line otherwise have the same arity.

```
p baf 3
1 2
2 3 s
```

Here, `1` attacks `2`, and `2` supports `3`.

## IAF — Incomplete Argumentation Framework

Implemented in [`incomplete-argumentation/export.ts`](/src/modules/incomplete-argumentation/export.ts).

```
p iaf <n>
u <id>                      # uncertain argument
<source> <target>           # definite attack
u <source> <target>         # uncertain attack
...
```

The qualifier `u` ("uncertain") is reused for both an uncertain argument and an uncertain attack; the two are unambiguous by arity (one number vs. two). Definite attacks stay bare, matching AF.

```
p iaf 3
u 2
1 2
u 2 3
```

Here, argument `2` is uncertain, `1` definitely attacks `2`, and `2` uncertainly attacks `3`.

## PAF — Probabilistic Argumentation Framework

Implemented in [`probabilistic-argumentation/export.ts`](/src/modules/probabilistic-argumentation/export.ts).

```
p paf <n>
w <id> <probability>              # argument weight, only if < 1
<source> <target>                 # attack with probability 1
w <source> <target> <probability> # attack weight, only if < 1
...
```

The qualifier `w` ("weight") is reused for both an argument's and an attack's probability, disambiguated by arity (two numbers vs. three). A probability of `1` is the default and is omitted.

```
p paf 3
w 2 0.5
1 2
w 2 3 0.7
```

Here, argument `2` has probability `0.5`, `1` attacks `2` with probability `1`, and `2` attacks `3` with probability `0.7`.

## Adding a new format

Every writer above is built with [`buildIccmaText`](/src/modules/common/argumentation/export.ts), which just assembles the problem line and joins the given relation lines. When extending an existing format or adding a new one:

1. Prefer a bare line for whatever relation is closest to "the" relation of that framework (matching AF's attacks).
2. Only add a leading qualifier letter where two kinds of line would otherwise collide at the same arity.
3. Never use `p` as a qualifier — it's reserved for the problem line.
4. Update this document alongside the code.
