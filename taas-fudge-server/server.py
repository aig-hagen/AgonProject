"""
Lightweight HTTP wrapper for CLI solvers with the ICCMA interface.

Accepts POST /fudge with a JSON body that mirrors the TweetyProject API:
  {
    "email":           str,
    "cmd":             "get_models" | "get_credulous" | "get_skeptical",
    "nr_of_arguments": int,
    "attacks":         [[src, tgt], ...],
    "semantics":       str,   # e.g. "ST", "PR", "GR"
    "timeout":         int,   # seconds
    "unit_timeout":    "s"
  }

Returns:
  { "time": float, "answer": str }

  • get_models    → answer = "[{1,2},{3}]"  (list of curly-brace sets)
  • get_credulous → answer = "{1,3}"        (set of credulously acceptable args)
  • get_skeptical → answer = "{1,3}"        (set of skeptically acceptable args)

Both credulous and skeptical modes derive their result from a single EE (enumerate
extensions) call rather than issuing one DC/DS call per argument, which avoids
spawning O(n) processes.

Binary path defaults to ./taas-fudge relative to this file; override via the
TAAS_FUDGE_BINARY environment variable.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

_DEFAULT_BINARY = Path(__file__).parent / "taas-fudge"
BINARY_PATH = Path(os.environ.get("TAAS_FUDGE_BINARY", str(_DEFAULT_BINARY)))

# Internal semantic keys that differ from the ICCMA task-string keys used by
# the solver.  Keys absent from this map are passed through unchanged.
_SEMANTIC_KEY_MAP: dict[str, str] = {
    "NA": "NAI",  # TweetyProject uses "NA"; ICCMA 2023 uses "NAI"
}

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class EvaluationRequest(BaseModel):
    email: str
    cmd: str
    nr_of_arguments: Annotated[int, Field(ge=0)]
    attacks: list[list[int]]
    semantics: str
    timeout: Annotated[int, Field(ge=1)] = 300
    unit_timeout: str = "s"


class EvaluationResponse(BaseModel):
    time: float
    answer: str


# ---------------------------------------------------------------------------
# ICCMA helpers
# ---------------------------------------------------------------------------


def _iccma_semantics(key: str) -> str:
    return _SEMANTIC_KEY_MAP.get(key, key)


def _write_iccma_file(path: str, nr_of_arguments: int, attacks: list[list[int]]) -> None:
    with open(path, "w") as f:
        f.write(f"p af {nr_of_arguments}\n")
        for src, tgt in attacks:
            f.write(f"{src} {tgt}\n")


def _run(task: str, filepath: str, timeout: int) -> tuple[str, float]:
    if not BINARY_PATH.exists():
        raise FileNotFoundError(
            f"taas-fudge binary not found at {BINARY_PATH}. "
            "Place the binary next to server.py or set TAAS_FUDGE_BINARY."
        )
    cmd = [str(BINARY_PATH), "-p", task, "-f", filepath]
    t0 = time.monotonic()
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    elapsed = time.monotonic() - t0
    if result.returncode != 0:
        raise RuntimeError(
            f"taas-fudge exited with code {result.returncode}.\n"
            f"stderr: {result.stderr.strip()}"
        )
    return result.stdout, elapsed


def _parse_extensions(output: str) -> list[list[int]]:
    """Parse ICCMA EE output into a list of extensions.

    Handles the two common output styles:
      • One extension per line, space-separated integers  ("1 2 3\\n4 5\\n")
      • Witness-prefixed lines                            ("w\\n1 2 3\\nw\\n4 5\\n")
    An empty extension is represented by a blank line (non-witness style) or
    a "w" immediately followed by another "w" / EOF (witness style).
    """
    extensions: list[list[int]] = []
    lines = output.strip().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line == "w":
            i += 1
            ext_line = lines[i].strip() if i < len(lines) else ""
            if ext_line and ext_line != "w":
                extensions.append([int(x) for x in ext_line.split()])
                i += 1
            else:
                extensions.append([])
                # don't advance; the outer loop will re-examine lines[i]
        elif line:
            extensions.append([int(x) for x in line.split()])
            i += 1
        else:
            i += 1
    return extensions


def _format_list_of_sets(extensions: list[list[int]]) -> str:
    """Produce "[{1,2},{3}]" as expected by the frontend's parserListOfSets."""
    return "[" + ",".join("{" + ",".join(map(str, ext)) + "}" for ext in extensions) + "]"


def _format_set(args: list[int]) -> str:
    """Produce "{1,3}" as expected by the frontend's parserSet."""
    return "{" + ",".join(map(str, args)) + "}"


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="taas-fudge wrapper")


@app.post("/fudge", response_model=EvaluationResponse)
async def evaluate(req: EvaluationRequest) -> EvaluationResponse:
    sem = _iccma_semantics(req.semantics)
    task = f"EE-{sem}"

    with tempfile.NamedTemporaryFile(mode="w", suffix=".apx", delete=False) as f:
        filepath = f.name

    try:
        _write_iccma_file(filepath, req.nr_of_arguments, req.attacks)

        try:
            output, elapsed = _run(task, filepath, req.timeout)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=408, detail="Solver timed out")
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc))

        extensions = _parse_extensions(output)

        if req.cmd == "get_models":
            answer = _format_list_of_sets(extensions)

        elif req.cmd == "get_credulous":
            acceptable: set[int] = set()
            for ext in extensions:
                acceptable.update(ext)
            answer = _format_set(sorted(acceptable))

        elif req.cmd == "get_skeptical":
            if not extensions:
                # No extensions → vacuously true: all arguments are skeptically acceptable
                skeptical = sorted(range(1, req.nr_of_arguments + 1))
            else:
                skeptical_set = set(range(1, req.nr_of_arguments + 1))
                for ext in extensions:
                    skeptical_set &= set(ext)
                skeptical = sorted(skeptical_set)
            answer = _format_set(skeptical)

        else:
            raise HTTPException(status_code=400, detail=f"Unknown cmd: {req.cmd!r}")

        return EvaluationResponse(time=elapsed, answer=answer)

    finally:
        os.unlink(filepath)
