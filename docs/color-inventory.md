# Current color inventory

- Status: baseline audit for the theme and branding rework
- Audited: 2026-08-27
- Applies to: the Vue application on mobile and desktop, the maintenance page, exported-preview UI, and user-visible colors inherited from bundled dependencies

## Purpose and scope

This document records every source from which a user-visible color can currently enter the app. It includes explicit literals, semantic theme tokens, opacity and mixing rules, component-library defaults, generated graph colors, raster assets, browser/operating-system colors, and bundled third-party UI.

“Every color” here means every authored color value or color-generating rule. It does not enumerate every final composited pixel produced by antialiasing, transparency, shadows, raster resampling, or an HSL gradient; those are derived from the sources documented below.

The dependency-owned values were checked against the locked/installed versions, not against current online documentation:

- Tailwind CSS 4.3.3
- DaisyUI 5.7.22
- `@aig-hagen/graph-component` 5.0.0-rc.10
- CodeMirror View 6.43.9, Language 6.12.4, Search 6.7.1, and Autocomplete 6.20.3
- KaTeX 0.16.47
- Heroicons Vue 2.2.0
- TikZJax 1.0.0-beta24

Generated/downloaded documents can contain colors chosen by their file format, content, renderer, or user. This audit covers the colors the app itself supplies to those outputs and previews.

## Executive summary

The app does not yet own a theme. `src/style.css` enables DaisyUI's stock `light` and `dark` themes, so the main UI palette and most interaction states are dependency defaults. The same semantic palette is used on mobile and desktop; there are no responsive color overrides and no Tailwind `dark:` color utilities.

The current color sources are:

1. DaisyUI semantic theme variables and component formulas.
2. Tailwind color, opacity, and shadow utilities.
3. Fixed graph presets and evaluation-highlight colors.
4. Fixed/generated colors in ranking results and export previews.
5. Bundled graph-component and CodeMirror defaults.
6. Browser/OS colors for selection, native popup controls, focus, autofill, and forced-colors mode.
7. Raster logos/favicons and the independent maintenance-page palette.

The highest-priority non-deliberate areas are summarized in [Theme gaps and decisions to make](#theme-gaps-and-decisions-to-make).

## How the active color scheme is selected

- `useTheme()` stores either `light` or `dark` under `localStorage['vueuse-color-scheme']` and sets `data-theme` on `<html>`.
- The default is always `light`; the main app does not initially follow `prefers-color-scheme`.
- `index.html` duplicates the DaisyUI `base-100` values inline to prevent a first-paint flash: light `oklch(100% 0 0)` and dark `oklch(25.33% 0.016 252.42)`.
- DaisyUI also sets `color-scheme: light` or `dark`. This lets the browser choose mode-appropriate native control chrome where the app does not replace it.
- The separate maintenance page does follow `prefers-color-scheme` and does not read the saved app preference.
- Mobile and desktop resolve the same tokens. Platform differences come only from hover capability, browser rendering, native controls, scrollbars, antialiasing, and forced-colors/accessibility settings.

## DaisyUI semantic palette

The OKLCH value is the authoritative current value. Hex values are rounded sRGB references for easier visual comparison.

### Theme-dependent foundation and brand roles

| Role              | Light                      | Approx. hex | Dark                           | Approx. hex | Current use                                                          |
| ----------------- | -------------------------- | ----------- | ------------------------------ | ----------- | -------------------------------------------------------------------- |
| `base-100`        | `oklch(100% 0 0)`          | `#ffffff`   | `oklch(25.33% 0.016 252.42)`   | `#1d232a`   | Page/canvas/window/menu/modal/input surface                          |
| `base-200`        | `oklch(98% 0 0)`           | `#f8f8f8`   | `oklch(23.26% 0.014 253.1)`    | `#191e24`   | Cards, tabs, headers, parameter controls, default buttons            |
| `base-300`        | `oklch(95% 0 0)`           | `#eeeeee`   | `oklch(21.15% 0.012 254.09)`   | `#15191e`   | Borders, grid, skeletons, hover surfaces                             |
| `base-content`    | `oklch(21% 0.006 285.885)` | `#18181b`   | `oklch(97.807% 0.029 256.847)` | `#ecf9ff`   | Default text/icons and inherited `currentColor`                      |
| `primary`         | `oklch(45% 0.24 277.023)`  | `#422ad5`   | `oklch(58% 0.233 277.117)`     | `#605dff`   | Primary actions, selected custom options, links, active glossary tab |
| `primary-content` | `oklch(93% 0.034 272.788)` | `#e0e7ff`   | `oklch(96% 0.018 272.314)`     | `#edf1fe`   | Text/icons on `primary`                                              |

### Theme-shared semantic roles

DaisyUI's stock light and dark themes use the same values for all roles below.

| Role                | Value                      | Approx. hex | Current use                                                              |
| ------------------- | -------------------------- | ----------- | ------------------------------------------------------------------------ |
| `secondary`         | `oklch(65% 0.241 354.308)` | `#f43098`   | Defined by the theme but not directly used by current app markup         |
| `secondary-content` | `oklch(94% 0.028 342.258)` | `#f9e4f0`   | Dormant with `secondary`                                                 |
| `accent`            | `oklch(77% 0.152 181.912)` | `#00d3bb`   | Available through DaisyUI; no explicit accent modifier is currently used |
| `accent-content`    | `oklch(38% 0.063 188.416)` | `#084d49`   | Dormant with `accent`                                                    |
| `neutral`           | `oklch(14% 0.005 285.823)` | `#09090b`   | Neutral buttons, default DaisyUI tooltips, share loading indicator       |
| `neutral-content`   | `oklch(92% 0.004 286.32)`  | `#e4e4e7`   | Text/icons on `neutral`                                                  |
| `info`              | `oklch(74% 0.16 232.661)`  | `#00bafe`   | Hints, informational alerts/progress, tooltip underline                  |
| `info-content`      | `oklch(29% 0.066 243.157)` | `#042e49`   | Text/icons on solid `info`                                               |
| `success`           | `oklch(76% 0.177 163.223)` | `#00d390`   | Success notifications, copied/highlight-active indicators                |
| `success-content`   | `oklch(37% 0.077 168.94)`  | `#004c39`   | Text/icons on solid `success`                                            |
| `warning`           | `oklch(82% 0.189 84.429)`  | `#fcb700`   | Timeout/status alerts                                                    |
| `warning-content`   | `oklch(41% 0.112 45.904)`  | `#793205`   | Text/icons on solid `warning`                                            |
| `error`             | `oklch(71% 0.194 13.428)`  | `#ff627d`   | Errors, delete actions, invalid formula input                            |
| `error-content`     | `oklch(27% 0.105 12.094)`  | `#4d0218`   | Text/icons on solid `error`                                              |

The fact that most semantic colors are identical in light and dark mode is a DaisyUI choice, not an app-specific decision.

## Direct Tailwind color utilities

These utilities bypass component defaults but still mostly resolve through the semantic palette.

| Rule or value                                             | Effect                                                                | Main surfaces                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `bg-base-100`                                             | `base-100`                                                            | App routes, graph canvas chrome, menus, floating windows, popovers |
| `bg-base-200`                                             | `base-200`                                                            | Tabs, cards, parameters, non-card window headers                   |
| `bg-base-200/50`, `/60`                                   | Oklab mix of `base-200` at 50% or 60% with transparent                | Tutorial/evaluation sections                                       |
| `bg-base-content`, `/25`                                  | `base-content`, or 25% with transparent                               | Floating-window grip dots and inactive status dot                  |
| `bg-primary` + `text-primary-content`                     | Solid primary selection                                               | Active row in `GroupedSelect`                                      |
| `bg-success`                                              | Solid success                                                         | Active-highlight status dots                                       |
| `border-base-200`, `border-base-300`                      | Semantic surface borders                                              | Panels, menus, windows, tabs, tooltips, editor bars                |
| `border-primary`                                          | Primary underline                                                     | Active glossary module tab                                         |
| `border-info`                                             | Info underline                                                        | Glossary/term hover triggers                                       |
| `border-transparent`                                      | Transparent placeholder border                                        | Inactive glossary tabs                                             |
| `text-base-content/40`, `/50`, `/60`, `/70`, `/80`        | Oklab mix of `base-content` at the stated percentage with transparent | Metadata, descriptions, inactive/waiting copy and icons            |
| `text-primary`, `/70`                                     | Primary or primary at 70% with transparent                            | Links, references, custom select group labels                      |
| `text-info`, `text-success`, `text-error`, `text-neutral` | Solid semantic status color                                           | Tutorial text/icons, copy success, errors, loading                 |
| `outline-primary/50`                                      | Primary at 50% with transparent                                       | Open `GroupedSelect` focus treatment                               |
| `hover:bg-base-200`, `hover:bg-base-300`                  | Semantic hover surface                                                | Glossary terms and example links                                   |
| `bg-white` / CSS `white`                                  | Fixed `#ffffff`                                                       | Export source/SVG preview, including dark mode                     |
| CSS `black`                                               | Fixed `#000000`                                                       | Export source viewer text, including dark mode                     |
| `text-neutral-900`                                        | Tailwind primitive `oklch(20.5% 0 0)` / about `#171717`               | Numerical ranking chips in both themes                             |
| `transparent` / `#0000`                                   | Fully transparent                                                     | Borders, SVG click targets, scroll tracks and control states       |

Element-level `opacity-40`, `opacity-50`, `opacity-60`, `opacity-70`, and `hover:opacity-70` also create composited variants of whatever foreground/background the element inherits. They are used for disabled/secondary cards, icons, shortcut labels, arrows, graph help, ranking scores, and tutorial states.

### Tailwind shadows

All current Tailwind shadows are black and do not change with the theme:

| Utility                                            | Color source               | Used by                                                                          |
| -------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` | `#0000001a` (black at 10%) | Cards, editor bars, select panels, tooltips, tutorial cards, probability popover |
| `shadow-sm/30`, `shadow-md/30`, `shadow-lg/30`     | Oklab black at 30%         | Menus, link switcher, floating windows                                           |

The offsets and blur radii differ by utility, but the color sources above are the only Tailwind shadow colors in use.

## Implicit DaisyUI component colors

The following colors enter the app solely because a predefined component class is used. These formulas are part of DaisyUI 5.7.22 and can change after a dependency update unless copied or overridden.

### Buttons

Base `.btn` colors and states:

- Default button: `base-200` background, `base-content` foreground, border equal to the background mixed 5% toward black.
- Hover on devices that support hover: button color mixed 7% toward black; the border is darkened again.
- Active and `.btn-active`: button color mixed 5% toward black; border mixed 7% toward black; shadows are removed.
- Focus-visible: a 2px outline in the button's semantic color. Default buttons use `base-content`.
- Disabled: `base-content` at 20% for the foreground; non-ghost background is `base-content` at 10%; border is transparent.
- DaisyUI depth is `1`, so normal buttons also add white at 6% as an inset highlight, white at 15% as text shadow, and button-colored shadows at 30%.

Modifiers currently used:

| Modifier      | Rest colors                                                              | Current purpose                                                              |
| ------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `btn-primary` | `primary` / `primary-content`                                            | Generate, tutorial next/done/start                                           |
| `btn-neutral` | `neutral` / `neutral-content`                                            | Share view and copy-share action                                             |
| `btn-info`    | `info` / `info-content`                                                  | Start-next tutorial action                                                   |
| `btn-error`   | `error` / `error-content`                                                | Delete one/all documents                                                     |
| `btn-soft`    | 8% `base-content` into `base-100`; text `base-content`; 10% mixed border | Secondary create/download/export/help actions and selected evaluation result |
| `btn-outline` | Transparent background; `base-content` border/text until interaction     | Interactive serialisation choices                                            |
| `btn-ghost`   | Transparent background and border; inherited/semantic text               | Icon, menu, close, retry, compact and secondary actions                      |
| `btn-active`  | Default button color darkened as above                                   | Selected graph toolbar modes                                                 |

Radio inputs in Settings are visually `.btn` elements. When checked, DaisyUI changes them to `primary` / `primary-content`, even though the markup does not name a primary color.

### Alerts, notifications, and hints

- Solid `.alert` defaults to `base-200` with `base-content`.
- `alert-success`, `alert-info`, `alert-warning`, and `alert-error` select their semantic color and corresponding content color.
- `alert-soft` replaces the solid background with an 8% mix of the semantic color into `base-100`, uses the semantic color for text, and uses a 10% mix for the border.
- Solid alert depth effects add black/white translucent inset and drop shadows. Soft alerts remove the standard shadow.
- Notifications use solid success/error alerts. Evaluation errors/timeouts, generation errors, empty results, SVG rendering, and hints use soft variants except the algorithm-load error, which is solid error.
- Hint arrows are explicitly `info`; their remaining triangle borders are transparent.

### Inputs and controls

| Component                    | Implicit colors                                                                                                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.input` and `.select`       | `base-100` background, `base-content` text, border/focus color initially `base-content` at 20%, placeholder `currentColor` at 50%. Several evaluation selects explicitly replace the background with `base-200`. |
| `.input-error`               | Changes the input border/focus role to `error`. Used by the ADF condition editor.                                                                                                                                |
| `.toggle`                    | Unchecked control color is `base-content` at 50%; checked control color becomes `base-content`; the moving part is `base-100`. Focus uses the current control color. No semantic toggle modifier is present.     |
| `.range`                     | Progress/current color inherits `base-content`; track is current color at 10%; thumb is `base-100`; focus outline is current color. No semantic range modifier is present.                                       |
| Native `<option>` popup      | The closed select is styled above, but the opened list, selected-row highlight, and some arrows are browser/OS controlled.                                                                                       |
| Number/search control chrome | Spin buttons, search cancel affordance, autofill, and other native subcontrols remain browser controlled.                                                                                                        |

The hidden file input has no visible current color. `select-bordered` and `input-bordered` appear in markup but do not add a separate generated rule in the current compiled DaisyUI build.

### Navigation, overlays, and content components

| Component            | Implicit colors                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lifted tabs          | `base-200` tab strip, `base-100` active tab, `base-300` active borders, inactive text at 50% `base-content`; tiny white/black translucent inset effects                                                            |
| Menus/dropdowns      | `base-100` background and `base-content` text; hover is `base-content` at 10%; active menu role would be `neutral` / `neutral-content`; menu shadows include black at 10%                                          |
| Modal                | Box `base-100`; backdrop black at 40%; box shadow black at 25%; transparent backdrop-dismiss button text                                                                                                           |
| Default tooltip      | `neutral` background and `neutral-content` text. This affects DaisyUI `tooltip` labels used for examples and generator help. Custom rich tooltips instead use `base-100`, `base-300`, and a black Tailwind shadow. |
| Divider              | `base-content` at 10% for the line; caption text may additionally be explicitly faded                                                                                                                              |
| Skeleton             | `base-300` with an animated transparent → `base-100` → transparent highlight                                                                                                                                       |
| Info progress        | `info` progress with current color at 20% for the unfilled track                                                                                                                                                   |
| Loading spinner      | `currentColor`, usually inherited `base-content`; share uses `neutral`, window loading uses 50% `base-content`                                                                                                     |
| Keyboard key (`kbd`) | `base-200` background, `base-content` text, border `base-content` at 20%                                                                                                                                           |
| Table                | Inherited text; the app's section rows use element opacity at 60%. No colored header, zebra, or hover state is currently present.                                                                                  |
| `link-primary`       | `primary`; hover mixes that color 80% with black                                                                                                                                                                   |
| Fieldset/label       | Inherited text with supporting labels at 60% current/base content                                                                                                                                                  |
| Collapse             | Inherited colors; focus outline uses `base-content`; the formula export section supplies no additional color modifier                                                                                              |

KaTeX and Heroicons do not introduce a palette: KaTeX SVGs and borders use `currentColor`, and Heroicons inherit `currentColor`. The app's own SVG icons likewise use `currentColor`, except where noted below.

## Graph and formal-argumentation colors

Graph colors are independent of the DaisyUI palette. The selected graph preset is stored separately from light/dark mode.

### Graph style presets

| Preset                | Node fill | Node stroke   | Link/arrow | Theme behavior                                                 |
| --------------------- | --------- | ------------- | ---------- | -------------------------------------------------------------- |
| Default in light mode | `#99b7d5` | `#5a87a8`     | `#000000`  | Automatically selected for the `default` setting in light mode |
| Default in dark mode  | `#4a7a9b` | `#82b5d0`     | `#c8dce8`  | Automatically selected for the `default` setting in dark mode  |
| High contrast         | `#5a87a8` | `#2c5470`     | `#000000`  | Fixed in both themes                                           |
| Minimal               | `#e8f0f7` | `#8aa0b4`     | `#444444`  | Fixed in both themes                                           |
| Library               | `#eb9850` | `transparent` | `#004c97`  | Fixed in both themes; mirrors graph-component defaults         |

The graph canvas is `base-100`, grid lines are `base-300` with fallback `#dddddd`, and graph link/node/annotation labels use `base-content`. Badges use `base-100` fill, current graph node color as stroke, and `base-content` text. Node-label edit inputs use the current graph node fill/stroke plus `base-content` text. Their focus ring is the node stroke at 35% mixed with transparent.

Scrollbars are graph-adjacent but inconsistent by engine:

- Firefox-compatible `scrollbar-color`: current graph node stroke, falling back to `#5a87a8`, over a transparent track.
- WebKit scrollbar thumb: always `#5a87a8`, hover `#3e6a8a`, transparent track. It does not follow graph style or dark mode.

### Evaluation and model-state colors

| Value                                                           | Meaning/use                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `#99ff99`                                                       | Accepted/in-extension node highlight; also CTAN `green!40`     |
| `#ff9999`                                                       | Rejected/attacked node highlight; also CTAN `red!40`           |
| `#99b7d5`                                                       | Undecided ADF node highlight and default node fill             |
| SVG initial black `#000000` fill + fixed white `#ffffff` stroke | Probabilistic attack-probability overlay labels and their halo |

Highlights temporarily replace node fills. The attacked-by-first layer is applied after the accepted group. These highlight colors do not adapt to dark mode or the chosen graph style.

### Numerical ranking spectrum

Numerical ranking chips generate colors at runtime from the normalized score:

- Hue: integer `round(30 + t × 90)`, producing a possible hue range from 30° (orange) through 120° (green).
- Background: `hsl(hue, 55%, 90%)`.
- Border: `hsl(hue, 55%, 62%)`.
- Text: fixed Tailwind `neutral-900`, approximately `#171717`.

This is a family of up to 91 possible background colors and 91 possible border colors, not a theme token. Rounded sRGB endpoints are `#f4e5d7` → `#d7f4d7` for backgrounds and `#d39e69` → `#69d369` for borders.

### Defined but currently dormant graph constants

These values exist in `src/modules/common/colors.ts` but have no current runtime reference. They still represent latent palette decisions and should be removed or tokenized during the rework:

| Constant            | CSS color    | Equivalent                         |
| ------------------- | ------------ | ---------------------------------- |
| `NODE_DARK_ORANGE`  | `DarkOrange` | `#ff8c00`                          |
| `NODE_LIGHT_ORANGE` | `PapayaWhip` | `#ffefd5`                          |
| `NODE_ORANGE`       | `#e4bf97`    | CTAN `aigyellow!60`                |
| `NODE_YELLOW`       | `#ffff99`    | Yellow at 40% over white           |
| `LINK_BLUE`         | `DarkBlue`   | `#00008b`                          |
| `LINK_RED`          | `DarkRed`    | `#8b0000`                          |
| `HIGHLIGHT_GREEN`   | `#48c78e`    | Historical Bulma success color     |
| `HIGHLIGHT_BLUE`    | `#3584e4`    | Historical Firefox focus-like blue |

`ARGUMENT_COLOR` and `ATTACK_COLOR` alias `#99b7d5` and `#000000` but are also not used to render the current editor.

The nearby `#00d1b2` value exists only in a historical comment; it is not assigned to a constant or emitted at runtime.

## Bundled graph-component colors

The app imports the graph component's distributed CSS before its own overrides. Many defaults are replaced, but the following dependency colors remain visible, reachable during interactions, or are latent fallbacks:

| Dependency value                                        | Dependency role                              | Current status                                                                                     |
| ------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `#007dae`                                               | Draggable/new link and arrow                 | Visible during link creation/dragging; not app-tokenized                                           |
| `#e74c3c`                                               | Hyperlink source node stroke                 | Visible while choosing a hyperlink source                                                          |
| `#004c97`                                               | Hyperlink paths/arrows and default links     | App supplies preset link colors for settled graphs; still a library preset/fallback                |
| `#696969`                                               | “add label” and node-label placeholders      | Not overridden                                                                                     |
| `#d3d3d3`                                               | Empty/info text                              | Not overridden if that library state appears                                                       |
| `#000000` at 70% opacity                                | Node deletion progress overlay/stroke        | Created inline by dependency JavaScript                                                            |
| `#00000000`                                             | Invisible SVG link click targets             | Structural and intentionally transparent                                                           |
| `#ffffff`                                               | Link masks                                   | Internal compositing color; not normally perceived as a surface                                    |
| `#eb9850`, `#ffffff`, `#000000`, `#dddddd`, `#ffffffe6` | Default node/canvas/label/grid/input palette | Mostly overridden by app CSS or inline graph state; remains dependency fallback/transient behavior |

This package is bundled locally, so these are changeable through an app override or a package update, but not through the current theme API.

## Export window, CodeMirror, and generated SVG

### Fixed preview shell

The export window explicitly forces the CodeMirror host, editor, content, gutters, and SVG preview surface to white, and CodeMirror text to black. This is deliberate for document previewing but currently disconnected from the app theme.

### CodeMirror colors actually reachable in the current read-only viewer

The app does not set CodeMirror's dark-theme facet. Even when the app is dark, CodeMirror follows its light branch; app CSS then overrides only some backgrounds/text. Current or keyboard-reachable colors include:

| Area                   | Fixed values                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Editor/content         | App override white `#ffffff` background and black `#000000` text                                             |
| Focus                  | Dotted `#212121` outline                                                                                     |
| Selection              | Unfocused `#d9d9d9`; focused `#d7d4f0`; browser `Highlight` may be used in a native-selection fallback       |
| Cursor/drop cursor     | Black                                                                                                        |
| Active line            | `#cceeff44`                                                                                                  |
| Special character      | CSS `red` (`#ff0000`)                                                                                        |
| Gutters                | App override white background; `#6c6c6c` text; `#dddddd` border; active line gutter `#e2f2ff`                |
| Search panel           | `#f5f5f5` background, black text, `#dddddd` borders; search textfield white with `silver` (`#c0c0c0`) border |
| Search buttons         | `#eff1f5` → `#d9d9df` gradient with `#888888` border; active gradient `#b4b4b4` → `#d0d3d6`                  |
| Search matches         | `#ffff0054`; selected match `#ff6a0054`; selection-match highlight `#99ff7780`                               |
| Fold placeholder       | `#eeeeee` background, `#dddddd` border, `#888888` text                                                       |
| Placeholder/whitespace | `#888888`, `#aaaaaa`, and a `#888888` SVG marker; trailing-space highlight `#ff332255`                       |
| Matching brackets      | `#328c8252`; nonmatching brackets `#bb555544`                                                                |

The LaTeX syntax highlighter uses this fixed light palette:

`#404740`, `#770088`, `#221199`, `#116644`, `#aa1111`, `#ee4400`, `#0000ff`, `#3300aa`, `#008855`, `#116677`, `#225566`, `#0000cc`, `#994400`, and `#ff0000`.

CodeMirror also ships dark, autocomplete, and tooltip colors (`#333338`, `#cccccc`, `#222227`, `#99eeff33`, `#ff7788`, `#1177cc`, `#777777`, `#334477`, `#444444`, `#bbbbbb`, and others). They are currently dormant because the viewer is read-only/light and `.cm-tooltip` is hidden, but they will become visible if those behaviors are enabled without a custom theme.

### TikZ/CTAN SVG preview colors

The generated SVG is rendered by TikZJax with the bundled CTAN `argumentation` package and shown on white. The export UI exposes five argument styles:

| Style/state                  | Rendered color source                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `standard`, `large`, `thick` | Transparent/default fill, black outline and black text                                                   |
| `gray`                       | `gray!30` fill (about `#d9d9d9`), `gray!65` outline (about `#acacac`), `black!80` text (about `#333333`) |
| `colored` (current default)  | `aigblue!40` fill = `#99b7d5`; `aigblue!80` outline ≈ `#3370ac`; black text                              |
| Accepted                     | `green!40` = `#99ff99`                                                                                   |
| Rejected                     | `red!40` = `#ff9999`                                                                                     |
| Undecided                    | `cyan!40` = `#99ffff`                                                                                    |
| Highlight                    | `aigyellow!60` = `#e4bf97`                                                                               |
| Inactive                     | Transparent fill, `gray!50` outline and `gray!60` text                                                   |

The package's base colors are AIG blue `rgb(0, 76, 151)` / `#004c97` and AIG yellow `rgb(210, 149, 81)` / `#d29551`. Attack/support lines default to black unless the generated LaTeX adds its own TikZ options. User-edited/copied LaTeX can request any xcolor/TikZ color, so such colors are content-owned rather than app-owned.

## Static raster assets

Raster assets contain many antialiased RGBA values and should be treated as atomic brand assets or replaced with controlled vector/source assets.

| Asset                                                           | Palette summary                                                                                                                                                       | Current ownership                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-192x192.png` | Transparent background; dominant opaque brand blue `#2b4e8c` and ochre `#c7975c`, plus hundreds of edge/alpha variants (122, 192, and 997 stored colors respectively) | App/AIG asset; used as browser favicon and AIG Hagen help-link icon  |
| `tweety-logo.png`                                               | Black/near-black and white grayscale artwork on transparency, with 462 stored antialias/alpha values                                                                  | External TweetyProject brand asset; should not be recolored casually |

Browser tab/background presentation around the favicon is browser/OS controlled.

## Maintenance page palette

`public/maintenance.html` is a standalone design system with its own automatic light/dark palette:

| Role              | Light     | Dark      |
| ----------------- | --------- | --------- |
| Page background   | `#f7f8fa` | `#12161c` |
| Card              | `#ffffff` | `#1a2029` |
| Foreground        | `#1c2430` | `#e7ecf2` |
| Muted text        | `#5b6672` | `#9aa5b1` |
| Border            | `#e2e6eb` | `#2a323d` |
| Accent/brand text | `#3b6ea5` | `#6ea3d8` |

Its card shadow is black at 8%: `rgba(0, 0, 0, 0.08)`. It follows the OS scheme, not the saved app scheme.

## Browser, OS, and accessibility-controlled colors

The following colors cannot be named as stable RGB values because the app leaves them to the user agent or operating system:

- Normal-page text selection background and selected text color (`::selection` is not themed).
- Focus outlines on focusable elements that have neither DaisyUI focus styling nor `outline-none`, including some focusable editor/window containers and links.
- Native select popup backgrounds, selected rows, option text, and scrollbars.
- Input autofill background/text, password-manager overlays, validation decorations, and search/number subcontrols.
- Carets where no component fixes `caret-color`.
- Browser spellcheck/grammar underlines where enabled.
- Forced-colors/high-contrast mode, which may replace authored colors with system color keywords.
- Native scrollbars on engines or embedded surfaces not reached by the app's scrollbar selectors.
- Tap/press feedback supplied by the OS. DaisyUI explicitly makes WebKit tap highlight transparent, but platform widgets can still supply feedback.
- `canvas`, SVG, font, and raster antialiasing colors; subpixel composition depends on the display/browser.

These are valid deliberate choices only if “use the platform default” is accepted as the token. Otherwise they require explicit CSS plus forced-colors fallbacks.

## Known invalid or fragile color references

- `FormulaEditor.vue` uses `border-left: 2px solid oklch(var(--b3))`. DaisyUI 5 no longer defines `--b3`; the compiled declaration has no valid color and is ignored. The intended `base-300` tree line is therefore not a reliable rendered color.
- The first-paint colors in `index.html` duplicate DaisyUI values manually and can drift when the theme changes.
- Semantic component behavior is tied to the locked DaisyUI formulas, including black/white mixes and shadows that are not represented by app tokens.
- The graph package uses fixed interaction colors that are outside both the app theme and graph-style presets.
- Dark mode does not reach CodeMirror, ranking chips, export preview paper, most graph presets/highlights, WebKit scrollbars, probability-label halos, favicons/logos, or the maintenance page preference.
- `currentColor`, inherited opacity, and transparent mixes are heavily used. Their source role must remain traceable when tokens are introduced.

## Theme gaps and decisions to make

To make every color deliberate, the theme implementation should explicitly decide and own the following:

1. Replace stock DaisyUI `light`/`dark` with named app themes defining every semantic role, even unused `secondary`/`accent` roles.
2. Define state recipes for rest, hover, pressed, selected, focus, disabled, drag, deletion, success, warning, error, and info instead of inheriting dependency formulas accidentally.
3. Decide whether shadows are neutral black, chromatic, or elevation tokens in each theme.
4. Create separate graph tokens for canvas, grid, node fill/stroke/text, links, placeholders, badges, annotations, selection, dragging, deletion, and semantic evaluation states.
5. Decide whether graph presets remain user-selectable, become theme variants, or map through semantic graph roles.
6. Replace the ranking HSL continuum with deliberate data-visualization tokens or formally retain and accessibility-test the scale.
7. Theme CodeMirror explicitly, including syntax, selection, search, focus, gutters, and dark mode; decide whether previews are “paper white” by design.
8. Tokenize the TikZ preview contract or explicitly classify CTAN output colors as document-format colors that intentionally differ from UI colors.
9. Override or upstream the graph-component interaction/fallback palette.
10. Specify browser-default policy for text selection, focus, native select popups, autofill, caret, forced colors, and scrollbars.
11. Bring the maintenance page and first-paint bootstrap under shared generated theme values.
12. Approve the favicon/AIG asset palette and external-logo exception, ideally retaining editable source assets.
13. Add automated checks that reject new raw color literals and unapproved palette utilities outside a small allowlist.

## Audit coverage and repeatable checks

This inventory was assembled from:

- all `.vue`, `.ts`, `.css`, and app/static `.html` color literals and color-bearing utilities;
- all current DaisyUI component/modifier classes and the locked component CSS they activate;
- the compiled production CSS, built into a temporary directory to capture generated Tailwind/DaisyUI colors;
- distributed graph-component CSS/JavaScript interaction colors;
- CodeMirror base, syntax, language, and search themes reachable from `basicSetup`;
- the bundled CTAN `argumentation` package used by TikZJax;
- raster histograms for public PNG assets; and
- browser-owned states that source inspection cannot reduce to stable RGB values.

When the theme is implemented, the final validation should add visual/state coverage for every route and overlay in light and dark modes at mobile and desktop widths, plus keyboard focus, hover-capable and coarse-pointer interactions, native control popups, forced-colors mode, graph editing states, exports, and the maintenance page.
