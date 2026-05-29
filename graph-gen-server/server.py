"""
Lightweight HTTP wrapper for graph generation algorithms.

Accepts POST /generate with a JSON body:
  {
    "algorithm": str,            # identifier from GET /algorithms
    "params":    { ... },        # algorithm-specific key-value parameters
    "timeout":   int             # seconds (default: 30)
  }

Returns:
  {
    "time":            float,              # wall-clock seconds
    "nr_of_arguments": int,                # node count; nodes are 1-indexed (1..n)
    "attacks":         [[int, int], ...]   # directed edges as [source, target] pairs
  }

Binary convention:
  Each algorithm is backed by a binary or script that receives its parameters as a
  JSON object on stdin and must write its result to stdout as:
    { "nr_of_arguments": int, "attacks": [[int, int], ...] }

  Binary path defaults to ./<algorithm-id> relative to server.py.
  Override per-algorithm via the env var:
    GRAPH_GEN_<ALGORITHM_ID_UPPER>_BINARY
  where hyphens in the algorithm id are replaced with underscores, e.g.
    GRAPH_GEN_ERDOS_RENYI_BINARY
"""

from __future__ import annotations

import json
import os
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Algorithm registry
# ---------------------------------------------------------------------------


@dataclass
class ParamSchema:
    name: str
    type: str        # "int" | "float" | "bool" | "string"
    description: str
    required: bool
    default: Any = None


@dataclass
class AlgorithmConfig:
    id: str
    description: str
    params_schema: list[ParamSchema] = field(default_factory=list)

    @property
    def binary_path(self) -> Path:
        env_key = f"GRAPH_GEN_{self.id.upper().replace('-', '_')}_BINARY"
        default = Path(__file__).parent / self.id
        return Path(os.environ.get(env_key, str(default)))


# Register generation algorithms here. Each entry maps an algorithm id to its
# configuration. The binary (or script) is expected at ./<id> next to server.py,
# or at the path given by the corresponding env var (see module docstring).
_ALGORITHMS: dict[str, AlgorithmConfig] = {
    "erdos-renyi": AlgorithmConfig(
        id="erdos-renyi",
        description="Erdős–Rényi random graph G(n, p): each possible attack exists independently with probability p",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True),
            ParamSchema("p", "float", "Attack probability per ordered pair (0.0–1.0)", required=True),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
    ),
    "barabasi-albert": AlgorithmConfig(
        id="barabasi-albert",
        description="Barabási–Albert preferential attachment: new nodes attach preferentially to high-degree nodes",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True),
            ParamSchema("m", "int", "Number of attacks to attach from each new node", required=True),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
    ),
}


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class GenerationRequest(BaseModel):
    algorithm: str
    params: dict[str, Any] = Field(default_factory=dict)
    timeout: int = Field(default=30, ge=1)


class GenerationResponse(BaseModel):
    time: float
    nr_of_arguments: int
    attacks: list[list[int]]


class ParamSchemaOut(BaseModel):
    name: str
    type: str
    description: str
    required: bool
    default: Any


class AlgorithmInfo(BaseModel):
    id: str
    description: str
    params: list[ParamSchemaOut]
    available: bool  # False when the backing binary has not been installed yet


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Graph generation server")


@app.get("/algorithms", response_model=list[AlgorithmInfo])
async def list_algorithms() -> list[AlgorithmInfo]:
    """Return all registered algorithms and their parameter schemas."""
    return [
        AlgorithmInfo(
            id=algo.id,
            description=algo.description,
            params=[
                ParamSchemaOut(
                    name=p.name,
                    type=p.type,
                    description=p.description,
                    required=p.required,
                    default=p.default,
                )
                for p in algo.params_schema
            ],
            available=algo.binary_path.exists(),
        )
        for algo in _ALGORITHMS.values()
    ]


@app.post("/generate", response_model=GenerationResponse)
async def generate(req: GenerationRequest) -> GenerationResponse:
    """Generate a graph using the requested algorithm and return its structure."""
    algo = _ALGORITHMS.get(req.algorithm)
    if algo is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown algorithm: {req.algorithm!r}. "
                   f"Available: {list(_ALGORITHMS)}",
        )

    if not algo.binary_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Algorithm {req.algorithm!r} is not yet available "
                   f"(binary not found at {algo.binary_path}).",
        )

    t0 = time.monotonic()
    try:
        result = subprocess.run(
            [str(algo.binary_path)],
            input=json.dumps(req.params),
            capture_output=True,
            text=True,
            timeout=req.timeout,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Algorithm timed out")

    elapsed = time.monotonic() - t0

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"Algorithm exited with code {result.returncode}.\n"
                   f"stderr: {result.stderr.strip()}",
        )

    try:
        output = json.loads(result.stdout)
        nr_of_arguments: int = output["nr_of_arguments"]
        attacks: list[list[int]] = output["attacks"]
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Algorithm produced unexpected output: {exc}",
        )

    return GenerationResponse(
        time=elapsed,
        nr_of_arguments=nr_of_arguments,
        attacks=attacks,
    )
