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
import random
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

import networkx as nx
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
    min: float | None = None
    max: float | None = None
    step: float | None = None


@dataclass
class AlgorithmConfig:
    id: str
    description: str
    params_schema: list[ParamSchema] = field(default_factory=list)
    # If set, called directly instead of spawning a subprocess binary.
    handler: Callable[[dict[str, Any]], dict[str, Any]] | None = None

    @property
    def binary_path(self) -> Path:
        env_key = f"GRAPH_GEN_{self.id.upper().replace('-', '_')}_BINARY"
        default = Path(__file__).parent / self.id
        return Path(os.environ.get(env_key, str(default)))


# ---------------------------------------------------------------------------
# Native algorithm implementations
# ---------------------------------------------------------------------------


def _erdos_renyi(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    p: float = params["p"]
    seed: int | None = params.get("seed", None)
    allow_self_loops: bool = params.get("allowSelfLoops", False)

    if n < 0:
        raise ValueError("n must be non-negative")
    if not (0.0 <= p <= 1.0):
        raise ValueError("p must be between 0.0 and 1.0")

    g = nx.gnp_random_graph(n, p, seed=seed, directed=True)
    attacks = [[u + 1, v + 1] for u, v in g.edges()]
    if allow_self_loops:
        rng = random.Random(seed)
        attacks += [[i + 1, i + 1] for i in range(n) if rng.random() < p]
    return {"nr_of_arguments": n, "attacks": attacks}


def _barabasi_albert(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    m: int = params["m"]
    seed: int | None = params.get("seed", None)

    if n < 1:
        raise ValueError("n must be at least 1")
    if m < 1 or m >= n:
        raise ValueError("m must satisfy 1 <= m < n")

    g = nx.barabasi_albert_graph(n, m, seed=seed)
    # Orient each undirected edge randomly using the same seed for reproducibility.
    rng = random.Random(seed)
    attacks = []
    for u, v in g.edges():
        if rng.random() < 0.5:
            attacks.append([u + 1, v + 1])
        else:
            attacks.append([v + 1, u + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _scale_free(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    alpha: float = params.get("alpha", 0.41)
    beta: float = params.get("beta", 0.54)
    gamma: float = params.get("gamma", 0.05)
    allow_self_loops: bool = params.get("allowSelfLoops", False)
    seed: int | None = params.get("seed", None)

    if n < 1:
        raise ValueError("n must be at least 1")
    if abs(alpha + beta + gamma - 1.0) > 1e-9:
        raise ValueError("alpha + beta + gamma must equal 1.0")

    g = nx.scale_free_graph(n, alpha=alpha, beta=beta, gamma=gamma, seed=seed)
    seen: set[tuple[int, int]] = set()
    attacks = []
    for u, v in g.edges():
        if u == v and not allow_self_loops:
            continue
        if (u, v) not in seen:
            seen.add((u, v))
            attacks.append([u + 1, v + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _random_k_out(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    k: int = params["k"]
    alpha: float = params["alpha"]
    allow_self_loops: bool = params.get("allowSelfLoops", False)
    seed: int | None = params.get("seed", None)

    if n < 1:
        raise ValueError("n must be at least 1")
    if k < 1:
        raise ValueError("k must be at least 1")
    if alpha <= 0:
        raise ValueError("alpha must be positive")

    g = nx.random_k_out_graph(n, k, alpha, self_loops=allow_self_loops, seed=seed)
    seen: set[tuple[int, int]] = set()
    attacks = []
    for u, v in g.edges():
        if (u, v) not in seen:
            seen.add((u, v))
            attacks.append([u + 1, v + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _watts_strogatz(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    k: int = params["k"]
    p: float = params["p"]
    seed: int | None = params.get("seed", None)

    if n < k:
        raise ValueError("n must be at least k")
    if not (0.0 <= p <= 1.0):
        raise ValueError("p must be between 0.0 and 1.0")

    g = nx.watts_strogatz_graph(n, k, p, seed=seed)
    rng = random.Random(seed)
    attacks = []
    for u, v in g.edges():
        if rng.random() < 0.5:
            attacks.append([u + 1, v + 1])
        else:
            attacks.append([v + 1, u + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _random_regular(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    d: int = params["d"]
    seed: int | None = params.get("seed", None)

    if n < 1:
        raise ValueError("n must be at least 1")
    if d < 0 or d >= n:
        raise ValueError("d must satisfy 0 <= d < n")
    if (d * n) % 2 != 0:
        raise ValueError("d * n must be even")

    g = nx.random_regular_graph(d, n, seed=seed)
    rng = random.Random(seed)
    attacks = []
    for u, v in g.edges():
        if rng.random() < 0.5:
            attacks.append([u + 1, v + 1])
        else:
            attacks.append([v + 1, u + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _powerlaw_cluster(params: dict[str, Any]) -> dict[str, Any]:
    n: int = params["n"]
    m: int = params["m"]
    p: float = params["p"]
    seed: int | None = params.get("seed", None)

    if n < 1:
        raise ValueError("n must be at least 1")
    if m < 1:
        raise ValueError("m must be at least 1")
    if not (0.0 <= p <= 1.0):
        raise ValueError("p must be between 0.0 and 1.0")

    g = nx.powerlaw_cluster_graph(n, m, p, seed=seed)
    rng = random.Random(seed)
    attacks = []
    for u, v in g.edges():
        if rng.random() < 0.5:
            attacks.append([u + 1, v + 1])
        else:
            attacks.append([v + 1, u + 1])
    return {"nr_of_arguments": n, "attacks": attacks}


def _stochastic_block_model(params: dict[str, Any]) -> dict[str, Any]:
    sizes_str: str = params["sizes"]
    intra_prob: float = params["intraProb"]
    inter_prob: float = params["interProb"]
    seed: int | None = params.get("seed", None)

    try:
        sizes = [int(s.strip()) for s in sizes_str.split(",")]
    except ValueError:
        raise ValueError("sizes must be a comma-separated list of positive integers, e.g. '10,10,10'")
    if any(s < 1 for s in sizes):
        raise ValueError("all community sizes must be at least 1")
    if not (0.0 <= intra_prob <= 1.0):
        raise ValueError("intraProb must be between 0.0 and 1.0")
    if not (0.0 <= inter_prob <= 1.0):
        raise ValueError("interProb must be between 0.0 and 1.0")

    k = len(sizes)
    p = [[intra_prob if i == j else inter_prob for j in range(k)] for i in range(k)]
    g = nx.stochastic_block_model(sizes, p, seed=seed, directed=True, selfloops=False)
    n = sum(sizes)
    attacks = [[u + 1, v + 1] for u, v in g.edges()]
    return {"nr_of_arguments": n, "attacks": attacks}


# Register generation algorithms here. Each entry maps an algorithm id to its
# configuration. The binary (or script) is expected at ./<id> next to server.py,
# or at the path given by the corresponding env var (see module docstring).
_ALGORITHMS: dict[str, AlgorithmConfig] = {
    "erdos-renyi": AlgorithmConfig(
        id="erdos-renyi",
        description="Erdős–Rényi random graph G(n, p): each possible attack exists independently with probability p",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=1, max=200, step=1),
            ParamSchema("p", "float", "Attack probability per ordered pair", required=True, default=0.3, min=0.0, max=1.0, step=0.01),
            ParamSchema("allowSelfLoops", "bool", "Whether self-attacks are allowed", required=False, default=False),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_erdos_renyi,
    ),
    "barabasi-albert": AlgorithmConfig(
        id="barabasi-albert",
        description="Barabási–Albert preferential attachment: new nodes attach preferentially to high-degree nodes",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=2, max=200, step=1),
            ParamSchema("m", "int", "Number of attacks to attach from each new node", required=True, default=2, min=1, max=50, step=1),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_barabasi_albert,
    ),
    "scale-free": AlgorithmConfig(
        id="scale-free",
        description="Directed scale-free graph: power-law in/out-degree distribution controlled by α, β, γ (must sum to 1)",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=1, max=200, step=1),
            ParamSchema("alpha", "float", "Prob. of adding edge from new node to existing (α + β + γ = 1)", required=False, default=0.41),
            ParamSchema("beta", "float", "Prob. of adding edge between two existing nodes (α + β + γ = 1)", required=False, default=0.54),
            ParamSchema("gamma", "float", "Prob. of adding edge from existing node to new (α + β + γ = 1)", required=False, default=0.05),
            ParamSchema("allowSelfLoops", "bool", "Whether self-attacks are allowed", required=False, default=False),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_scale_free,
    ),
    "random-k-out": AlgorithmConfig(
        id="random-k-out",
        description="Random k-out graph: each argument attacks exactly k others chosen with preferential attachment",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=1, max=200, step=1),
            ParamSchema("k", "int", "Number of out-attacks per argument", required=True, default=3, min=1, max=50, step=1),
            ParamSchema("alpha", "float", "Preferential attachment concentration (higher = more uniform)", required=True, default=1.0),
            ParamSchema("allowSelfLoops", "bool", "Whether self-attacks are allowed", required=False, default=False),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_random_k_out,
    ),
    "watts-strogatz": AlgorithmConfig(
        id="watts-strogatz",
        description="Watts–Strogatz small-world graph: ring lattice with random edge rewiring; edges are randomly oriented",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=1, max=200, step=1),
            ParamSchema("k", "int", "Each argument is initially connected to k nearest neighbours", required=True, default=4, min=2, max=50, step=1),
            ParamSchema("p", "float", "Probability of rewiring each edge", required=True, default=0.1, min=0.0, max=1.0, step=0.01),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_watts_strogatz,
    ),
    "random-regular": AlgorithmConfig(
        id="random-regular",
        description="Random d-regular graph: every argument has exactly degree d; edges are randomly oriented",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments (n × d must be even)", required=True, default=20, min=2, max=200, step=1),
            ParamSchema("d", "int", "Degree of each argument", required=True, default=3, min=1, max=50, step=1),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_random_regular,
    ),
    "powerlaw-cluster": AlgorithmConfig(
        id="powerlaw-cluster",
        description="Holme–Kim power-law cluster graph: Barabási–Albert with additional triangle-closing step for higher clustering",
        params_schema=[
            ParamSchema("n", "int", "Number of arguments", required=True, default=20, min=1, max=200, step=1),
            ParamSchema("m", "int", "Number of edges to attach from each new node", required=True, default=2, min=1, max=50, step=1),
            ParamSchema("p", "float", "Probability of triangle formation after each edge addition", required=True, default=0.5, min=0.0, max=1.0, step=0.01),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_powerlaw_cluster,
    ),
    "stochastic-block-model": AlgorithmConfig(
        id="stochastic-block-model",
        description="Stochastic block model: community-structured graph with configurable intra- and inter-community attack probabilities",
        params_schema=[
            ParamSchema("sizes", "string", "Comma-separated community sizes, e.g. '10,10,10'", required=True, default="10,10,10"),
            ParamSchema("intraProb", "float", "Attack probability within a community", required=True, default=0.5, min=0.0, max=1.0, step=0.01),
            ParamSchema("interProb", "float", "Attack probability between communities", required=True, default=0.1, min=0.0, max=1.0, step=0.01),
            ParamSchema("seed", "int", "Random seed for reproducibility", required=False, default=None),
        ],
        handler=_stochastic_block_model,
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
    min: float | None = None
    max: float | None = None
    step: float | None = None


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
                    min=p.min,
                    max=p.max,
                    step=p.step,
                )
                for p in algo.params_schema
            ],
            available=algo.handler is not None or algo.binary_path.exists(),
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

    if algo.handler is not None:
        t0 = time.monotonic()
        try:
            output = algo.handler(req.params)
        except (KeyError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        elapsed = time.monotonic() - t0
        return GenerationResponse(
            time=elapsed,
            nr_of_arguments=output["nr_of_arguments"],
            attacks=output["attacks"],
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
