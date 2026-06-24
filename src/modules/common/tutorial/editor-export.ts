/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import type { Tutorial } from '@/modules/common/tutorial/types'

export const editorExportTutorial: Tutorial = {
  id: 'editor-export',
  name: 'Export Tutorial',
  description: 'Learn how to export your framework as LaTeX, SVG, or a text-based exchange format.',
  steps: [
    {
      id: 'intro',
      title: 'Exporting your framework',
      body: 'The export panel lets you save your framework in several formats — for example as a LaTeX diagram for a paper, as an SVG image, or in a text-based format for use with other tools.',
      advanceOn: 'button',
    },
    {
      id: 'align',
      title: 'Align arguments first',
      body: (isTouchDevice) => isTouchDevice
        ? 'For clean LaTeX output, arguments should be aligned on a grid. Enable <strong>Snap to grid</strong> in Settings, then reposition your arguments so they sit on clean grid coordinates.'
        : 'For clean LaTeX output, arguments should be aligned on a grid. Hold <kbd class="kbd kbd-sm">Ctrl</kbd> and drag any argument to snap it to the nearest grid position. Do this for each argument to get a tidy layout before exporting.',
      advanceOn: (isTouchDevice) => isTouchDevice ? 'button' : 'action',
      advanceCondition: (ctx, baseline) => ctx.ctrlSnapCount > baseline.ctrlSnapCount,
    },
    {
      id: 'open-export',
      title: 'Open the export panel',
      body: 'Click the <strong>Export</strong> button to open the export panel.',
      anchor: 'exportButton',
      placement: 'right-end',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.isExportOpened,
    },
    {
      id: 'formats',
      title: 'Choose a format',
      body: 'Select a <strong>format</strong> from the dropdown. The available options depend on the type of framework — most include LaTeX and SVG. For LaTeX, expand <em>Style Parameters</em> to customise the visual appearance of the diagram.',
      advanceOn: 'button',
    },
    {
      id: 'save-or-copy',
      title: 'Save or copy',
      body: 'Use the <strong>Save</strong> button to download the file, or <strong>Copy</strong> to put the content on the clipboard — useful for pasting directly into a LaTeX document. For LaTeX, both a text export and an SVG preview are shown side by side.',
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'All done!',
      body: 'You can reopen the export panel at any time using the button in the toolbar. The panel remembers your last format selection.',
      advanceOn: 'button',
      nextTutorialId: 'editor-advanced',
    },
  ],
}
