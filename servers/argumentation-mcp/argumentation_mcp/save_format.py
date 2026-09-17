"""Builds the app's abstract-argumentation save string from a framework.

Mirrors the TypeScript ``saveAsString`` in
``src/modules/abstract-argumentation/save/saveFormat.ts``: arguments are keyed by
a 0-based integer id, attacks are index pairs into those ids. Coordinates are
placeholders — the app recomputes them from ``layoutType`` when it loads a share
(see ``ShareView.vue``). Keep ``API_VERSION`` and ``LAYOUTS`` in sync with the
frontend.
"""

from __future__ import annotations

import json

from argumentation_mcp.contract import Framework
from argumentation_mcp.errors import ErrorCode, ServiceError

API_VERSION = "argumentation-framework/v1"

# Mirrors the `Layout` enum in src/modules/common/main-menu/layouting.ts. A layered
# default suits attack graphs; the app falls back to placeholder coordinates for any
# value it does not recognize.
LAYOUTS = (
    "TopToBottom",
    "BottomToTop",
    "LeftToRight",
    "RightToLeft",
    "ForceDirected",
    "Neato",
    "Circular",
    "Radial",
)
DEFAULT_LAYOUT = "BottomToTop"


def validate_layout(layout: str) -> str:
    if layout not in LAYOUTS:
        raise ServiceError(
            ErrorCode.INVALID_REQUEST,
            f"Unknown layout {layout!r}. Valid layouts: {', '.join(LAYOUTS)}.",
        )
    return layout


def build_save_string(framework: Framework, name: str, layout: str) -> str:
    """Serialize a framework into the abstract-argumentation save format."""
    arguments = {
        str(index): {"name": argument_name, "x": 0, "y": 0}
        for index, argument_name in enumerate(framework.names)
    }
    ids = {argument_name: index for index, argument_name in enumerate(framework.names)}
    attacks = [[ids[source], ids[target]] for source, target in framework.attacks]
    save = {
        "apiVersion": API_VERSION,
        "name": name,
        "layoutType": layout,
        "arguments": arguments,
        "attacks": attacks,
    }
    return json.dumps(save, indent=2)
