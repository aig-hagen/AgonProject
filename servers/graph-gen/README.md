# Graph Generation Server

A FastAPI service that generates random argumentation frameworks for the "Generate" feature in the frontend, using algorithms from [NetworkX](https://networkx.org/) and other graph-generation binaries/scripts.

For how to run this locally alongside the rest of the app, see the [development setup](../../docs/contributing/development.md#running-the-graph-generation-server). For the full request/response schema and the binary/algorithm convention, see the module docstring at the top of [`server.py`](./server.py) — this file only summarizes it.

## API

### `GET /algorithms`

Lists all registered generation algorithms, each with its id, description, parameter schema, and whether it's currently `available` (its backing binary/handler is installed).

### `GET /framework-types`

Lists the supported framework types (currently `abstract`, `bipolar`, `incomplete`, `probabilistic`, `adf`, and `setaf`) and their type-specific parameters (for example, `supportPerc` for bipolar, `uncertainArgPerc`/`uncertainAttackPerc` for incomplete, and `groupingProb` for SetAFs). Every framework type also accepts `selfLoopProb`.

### `POST /generate`

Body:

```json
{
  "algorithm": "erdos-renyi",
  "params": { "n": 10, "p": 0.3 },
  "framework_type": "abstract",
  "timeout": 30
}
```

Returns the generated framework's structure and the generation `time` in seconds. Every response contains `framework_type`, `nr_of_arguments`, and `attacks`; type-specific results use `supports`, `uncertain_arguments`, `uncertain_attacks`, `argument_probabilities`, `attack_probabilities`, `conditions`, or `collective_attacks` as applicable.

## Adding a new algorithm

Each algorithm is backed by a binary or script that receives its parameters as JSON on stdin and writes `{ "nr_of_arguments": int, "attacks": [[int, int], ...] }` to stdout. See the "Binary convention" section of the docstring in `server.py` for the exact contract, including the `GRAPH_GEN_<ALGORITHM_ID_UPPER>_BINARY` env var override.

## Running

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --port 8000
```
