# Argumentation Toolbox

A graphical application to create and inspect argumentation frameworks.

## Usage

### Public Deployment

Try it out at https://argumentation-toolbox.aig.fernuni-hagen.de/

### OCI Image

[Container images](https://github.com/aig-hagen/argumentation-toolbox/pkgs/container/argumentation-toolbox) are provided and can be run with Docker, Podman or other container runtimes.

```sh
docker run -p 8080:8080 ghcr.io/aig-hagen/argumentation-toolbox:latest
```

## Acknowledgments

### [Graph Component](https://github.com/aig-hagen/aig_graph_component)

This component is used to display and edit graphs.

It is developed by the Artificial Intelligence Group of the University of Hagen and [licensed under the MIT License](third-party/aig-hagen/aig_graph_component/LICENSE.md).

### [Argumentation Framework eXplanation, Reasoning, and AnalYsis](https://github.com/xai-ca/xray)

This projects [example argumentation frameworks](third-party/xai-ca/xray/7a83aa5/examples/) are bundled and used. Moreover, inspired by it was the automatic layout of argumentation frameworks with Graphviz.

It is developed by employees of the University of Illinois Urbana-Champaign and [licensed under the MIT License](third-party/xai-ca/xray/7a83aa5/LICENSE).

## Development

Checkout the [development documentation](/docs/index.md) for working on this project.

## License

This project is licensed under the GNU General Public License v3.0.
See the [LICENSE file](./LICENSE) for details.