/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
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
  // Desktop-centric (Ctrl-snap alignment, side-by-side LaTeX preview); hidden on touch for now.
  desktopOnly: true,
  steps: [
    {
      id: 'intro',
      title: 'Exporting your framework',
      body: 'There are two ways to export. The <strong>Export</strong> submenu in the main menu offers quick, one-click formats — a text-based exchange format for other tools, and an image of the graph. The <strong>LaTeX studio</strong> is a dedicated editor for producing a LaTeX diagram for a paper.',
      advanceOn: 'button',
    },
    {
      id: 'align',
      title: 'Align arguments first',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'For clean LaTeX output, arguments should be aligned on a grid. Enable <strong>Snap to grid</strong> in Settings, then reposition your arguments so they sit on clean grid coordinates.'
          : 'For clean LaTeX output, arguments should be aligned on a grid. Hold <kbd class="kbd kbd-sm">Ctrl</kbd> and drag any argument to snap it to the nearest grid position. Do this for each argument to get a tidy layout before exporting.',
      advanceOn: (isTouchDevice) => (isTouchDevice ? 'button' : 'action'),
      advanceCondition: (ctx, baseline) => ctx.ctrlSnapCount > baseline.ctrlSnapCount,
    },
    {
      id: 'open-export',
      title: 'Open the LaTeX studio',
      body: 'Click the <strong>LaTeX studio</strong> button to open the editor.',
      anchor: 'exportButton',
      placement: 'right-end',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.isExportOpened,
    },
    {
      id: 'style',
      title: 'Tune the appearance',
      body: 'The <strong>style options</strong> at the top control how arguments, names and attacks are drawn. Change any of them and the LaTeX code and the preview update instantly, side by side.',
      advanceOn: 'button',
    },
    {
      id: 'edit-code',
      title: 'Edit the code directly',
      body: 'The code is fully editable. As soon as you type, the studio <em>detaches</em> from the graph, so your edits are kept even if the graph changes. Use <strong>Reset to graph</strong> to regenerate the code and resync.',
      advanceOn: 'button',
    },
    {
      id: 'save-or-copy',
      title: 'Save or copy',
      body: 'Use <strong>Save</strong> to download the file, or <strong>Copy</strong> to put the content on the clipboard — handy for pasting straight into a LaTeX document. The <em>Preamble</em> hint shows the package line your document needs.',
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'All done!',
      body: 'You can reopen the LaTeX studio at any time using the button in the toolbar. Reopening always starts fresh from the current graph.',
      advanceOn: 'button',
      nextTutorialId: 'editor-advanced',
    },
  ],
}
