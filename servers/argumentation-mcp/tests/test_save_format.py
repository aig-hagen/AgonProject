from __future__ import annotations

import json

from argumentation_mcp.contract import validate_framework
from argumentation_mcp.save_format import build_save_string


def test_build_save_string_matches_app_format():
    fw = validate_framework(["a", "b", "c"], [("a", "b"), ("b", "c")])
    save = json.loads(build_save_string(fw, "My AF"))
    assert save == {
        "apiVersion": "argumentation-framework/v1",
        "name": "My AF",
        "layoutType": "ForceDirected",
        "arguments": {
            "0": {"name": "a", "x": 0, "y": 0},
            "1": {"name": "b", "x": 0, "y": 0},
            "2": {"name": "c", "x": 0, "y": 0},
        },
        "attacks": [[0, 1], [1, 2]],
    }


def test_attacks_reference_argument_ids():
    fw = validate_framework(["x", "y"], [("y", "x")])
    save = json.loads(build_save_string(fw, ""))
    assert save["attacks"] == [[1, 0]]
