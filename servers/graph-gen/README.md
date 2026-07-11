# Graph Generation Server

A FastAPI service that generates random argumentation frameworks for the "Generate" feature in the frontend, using algorithms from [NetworkX](https://networkx.org/) and other graph-generation binaries/scripts.

For how to run this locally alongside the rest of the app, see [../../docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md#running-the-graph-generation-server). For the full request/response schema and the binary/algorithm convention, see the module docstring at the top of [`server.py`](./server.py) — this file only summarizes it.

## API

### `GET /algorithms`

Lists all registered generation algorithms, each with its id, description, parameter schema, and whether it's currently `available` (its backing binary/handler is installed).

### `GET /framework-types`

Lists the supported framework types (currently `abstract`, `bipolar`, `incomplete`, `probabilistic`, `adf`) and their type-specific parameters (e.g. `supportPerc` for bipolar, `uncertainArgPerc`/`uncertainAttackPerc` for incomplete).

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

Returns the generated framework's structure (`nr_of_arguments`, `attacks`, plus `supports`/`uncertain_arguments`/`uncertain_attacks`/probabilities/`conditions` depending on `framework_type`) and the generation `time` in seconds.

## Adding a new algorithm

Each algorithm is backed by a binary or script that receives its parameters as JSON on stdin and writes `{ "nr_of_arguments": int, "attacks": [[int, int], ...] }` to stdout. See the "Binary convention" section of the docstring in `server.py` for the exact contract, including the `GRAPH_GEN_<ALGORITHM_ID_UPPER>_BINARY` env var override.

## Running

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --port 8000
```
