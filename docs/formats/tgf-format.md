# TGF-style export formats

AgonProject provides Trivial Graph Format (TGF) exports for AF, BAF, IAF, PAF, and SetAF. ADF does not currently have a TGF export.

All variants use `.tgf` files, remap document argument IDs to consecutive integers starting at `1`, and separate lines with CRLF (`\r\n`). The final line has no trailing line ending. A line containing `#` separates argument declarations from relations.

AgonProject provides these formats as exports; it does not import them currently.

## AF

```text
1
2
3
#
1 2
2 3
```

Each argument line contains its ID. Each relation line is `<source> <target>`.

## BAF

```text
1
2
3
#
1 2
2 3 s
```

Bare relation lines are attacks. A relation ending in `s` is a support.

## IAF

```text
1
2 u
3
#
1 2
2 3 u
```

An argument ending in `u` is uncertain. Bare relation lines are definite attacks; a relation ending in `u` is uncertain.

## PAF

```text
1
2 0.5
3
#
1 2
2 3 0.7
```

Argument and attack probabilities of `1` are implicit. A probability below `1` follows the argument or relation it annotates.

## SetAF

```text
1
2
3
4
#
1 4
1 2 4
```

A relation line contains the numerically sorted attacker IDs followed by the target.

Implementations are the `exportTGF` configurations in each module's `export.ts`.
