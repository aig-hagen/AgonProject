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

export const editorAdvancedTutorial: Tutorial = {
  id: 'editor-advanced',
  name: 'Advanced Editing',
  description: 'Physics simulation, grid overlay, snap-to-grid, and keyboard shortcuts.',
  steps: [
    {
      id: 'intro',
      title: 'Advanced editing',
      body: 'This tutorial covers physics simulation, the grid overlay, and snap tools — features that help you organise and align arguments precisely, especially in larger frameworks.',
      advanceOn: 'button',
    },
    {
      id: 'physics',
      title: 'Physics mode',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Enable <strong>physics mode</strong> in Settings. When on, dragging an argument nudges nearby arguments to rearrange themselves — they settle back to rest automatically once you release.'
          : 'Press <kbd class="kbd kbd-sm">P</kbd> to toggle physics on. When active, dragging an argument nudges nearby arguments to rearrange — they settle back to rest automatically. Try toggling it now.',
      advanceOn: (isTouchDevice) => (isTouchDevice ? 'button' : 'action'),
      advanceCondition: (ctx, baseline) => ctx.physicsToggleCount > baseline.physicsToggleCount,
    },
    {
      id: 'grid',
      title: 'Grid overlay',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Open <strong>Settings</strong> to show the grid overlay. It helps you place arguments at consistent positions. You can choose between a square or rhombus pattern and adjust the cell size there too.'
          : 'Press <kbd class="kbd kbd-sm">G</kbd> to toggle the grid overlay on or off. It helps you place arguments at consistent positions. You can choose between a square or rhombus pattern and adjust the cell size in Settings.',
      advanceOn: (isTouchDevice) => (isTouchDevice ? 'button' : 'action'),
      advanceCondition: (ctx, baseline) => ctx.gridToggleCount > baseline.gridToggleCount,
    },
    {
      id: 'ctrl-snap',
      title: 'Snap a single argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'On desktop, holding <kbd>Ctrl</kbd> while dragging an argument temporarily snaps just that argument to the grid — without affecting others. You can also enable permanent snap-to-grid for all arguments in <strong>Settings</strong>.'
          : 'Hold <kbd class="kbd kbd-sm">Ctrl</kbd> while dragging an argument to temporarily snap just that one to the grid. The grid appears while Ctrl is held and disappears on release. You can also enable permanent snap-to-grid for all arguments in <strong>Settings</strong>. Try it now — drag any argument while holding Ctrl.',
      advanceOn: (isTouchDevice) => (isTouchDevice ? 'button' : 'action'),
      advanceCondition: (ctx, baseline) => ctx.ctrlSnapCount > baseline.ctrlSnapCount,
    },
    {
      id: 'hotkeys',
      title: 'Keyboard shortcuts',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Most actions are accessible from the <strong>menu</strong>. On desktop, many of them have keyboard shortcuts — open <strong>Help</strong> from the menu to see the full list.'
          : '<kbd class="kbd kbd-sm">P</kbd> toggle physics &ensp;·&ensp; <kbd class="kbd kbd-sm">G</kbd> toggle grid &ensp;·&ensp; <kbd class="kbd kbd-sm">Ctrl Z</kbd> undo &ensp;·&ensp; <kbd class="kbd kbd-sm">Ctrl Shift Z</kbd> redo &ensp;·&ensp; <strong>Middle-click</strong> re-centre view',
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'All done!',
      body: "You've covered the advanced editing tools. Open <strong>Settings</strong> from the menu to configure your preferred defaults for physics, grid, and snap mode. The <strong>Help</strong> entry in the menu lists all available controls and keyboard shortcuts.",
      anchor: 'mainMenuBottom',
      placement: 'bottom-start',
      offsetPx: 48,
      advanceOn: 'button',
    },
  ],
}
