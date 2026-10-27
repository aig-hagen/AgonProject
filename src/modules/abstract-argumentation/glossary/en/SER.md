---
label: serialised
title: Serialisable Semantics
reference: T22
---

Builds extensions step by step: starting from the empty set, it repeatedly adds an [[IS|initial set]] chosen by the [[selFn|selection function]] and continues in the [[reduct]]. Every set reached that the [[termFn|termination function]] accepts is an [[serialisationSystem|extension]].
