# ICCMA-style export formats

AgonProject exports the official ICCMA AF text format and related project-specific formats for BAF, IAF, PAF, and SetAF. ADF does not currently have an ICCMA-style export.

Only the AF syntax is an official competition format, as specified by the [ICCMA 2025 rules](https://argumentationcompetition.org/2025/rules.html). The other syntaxes are AgonProject extensions.

## Shared output

- The first line is `p <type> <n>`, where `<n>` is the number of arguments.
- Document argument IDs are remapped to consecutive integers from `1` through `<n>`.
- Each following line represents one relation or annotation.
- Lines are separated by CRLF (`\r\n`). The final line has no trailing line ending.
- AgonProject provides these formats as exports; it does not import them.

## AF — official ICCMA format

File extension: `.af`

```text
p af <n>
<source> <target>
...
```

Example:

```text
p af 3
1 2
2 3
```

Each relation line is an attack. Implementation: [`abstract-argumentation/export.ts`](/src/modules/abstract-argumentation/export.ts).

## BAF — AgonProject extension

File extension: `.baf`

```text
p baf <n>
<source> <target>
s <source> <target>
...
```

Bare relation lines are attacks; lines prefixed with `s` are supports.

```text
p baf 3
1 2
s 2 3
```

Implementation: [`bipolar-argumentation/export.ts`](/src/modules/bipolar-argumentation/export.ts).

## IAF — AgonProject extension

File extension: `.iaf`

```text
p iaf <n>
u <id>
<source> <target>
u <source> <target>
...
```

`u <id>` marks an uncertain argument. Bare relation lines are definite attacks, while three-part lines prefixed with `u` are uncertain attacks.

```text
p iaf 3
u 2
1 2
u 2 3
```

Implementation: [`incomplete-argumentation/export.ts`](/src/modules/incomplete-argumentation/export.ts).

## PAF — AgonProject extension

File extension: `.paf`

```text
p paf <n>
w <id> <probability>
<source> <target>
w <source> <target> <probability>
...
```

Argument and attack probabilities of `1` are implicit and omitted. `w <id> <probability>` assigns an argument probability below `1`; the four-part form assigns an attack probability below `1`. A bare relation line is an attack with probability `1`.

```text
p paf 3
w 2 0.5
1 2
w 2 3 0.7
```

Implementation: [`probabilistic-argumentation/export.ts`](/src/modules/probabilistic-argumentation/export.ts).

## SetAF — AgonProject extension

File extension: `.setaf`

```text
p setaf <n>
<attacker-1> ... <attacker-k> <target>
...
```

Each line contains the numerically sorted attacker IDs followed by the target. A single-attacker collective attack therefore has the same two-number shape as an AF attack.

```text
p setaf 4
1 4
1 2 4
2 3 1
```

Implementation: [`collective-attacks-argumentation/export.ts`](/src/modules/collective-attacks-argumentation/export.ts).
