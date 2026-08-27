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
import { editorAdvancedTutorial } from '@/modules/common/tutorial/editor-advanced'
import { editorExportTutorial } from '@/modules/common/tutorial/editor-export'
import type { Tutorial } from '@/modules/common/tutorial/types'

export const editorNavigationTutorial: Tutorial = {
  id: 'editor-navigation',
  name: 'Navigation Tutorial',
  description: 'Learn how to pan, zoom, and navigate the canvas.',
  steps: [
    {
      id: 'pan',
      title: 'Panning',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Touch and drag</strong> on an empty area of the canvas to pan the view.'
          : '<strong>Left-click and drag</strong> on an empty area of the canvas to pan the view.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.panCount > baseline.panCount,
    },
    {
      id: 'zoom',
      title: 'Zooming',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Use a <strong>pinch gesture</strong> to zoom in and out.'
          : 'Use the <strong>scroll wheel</strong> to zoom in and out.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.zoomCount > baseline.zoomCount,
    },
    {
      id: 'center',
      title: 'Centering the view',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Use the <strong>layout button</strong> in the menu to refit the framework into view.'
          : '<strong>Middle-click</strong> anywhere on the canvas to re-center the view and fit the entire framework into the viewport.',
      advanceOn: (isTouchDevice) => (isTouchDevice ? 'button' : 'action'),
      advanceCondition: (ctx, baseline) => ctx.centerCount > baseline.centerCount,
    },
    {
      id: 'done',
      title: 'All done!',
      body: 'You can now navigate the canvas freely. Use the <strong>Tutorials</strong> menu to explore more.',
      advanceOn: 'button',
    },
  ],
}

/** Common tutorials available in all modules. Spread into each module's tutorial list. */
export const commonTutorials: Tutorial[] = [
  editorNavigationTutorial,
  editorAdvancedTutorial,
  editorExportTutorial,
]
