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

export const afBasicsTutorial: Tutorial = {
  id: 'af-basics',
  name: 'Basic Tutorial',
  description: 'Learn how to create arguments and attacks, use undo/redo, and apply layout algorithms.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to the Argumentation Toolbox!',
      body: 'This short tutorial will guide you through the basic features. You can skip it at any time and restart it from the <strong>Tutorials</strong> entry in the menu.',
      advanceOn: 'button',
    },
    {
      id: 'create-argument',
      title: 'Create an argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Double-tap</strong> on an empty area of the canvas to create a new argument.'
          : '<strong>Double-click</strong> on an empty area of the canvas to create a new argument.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'create-attack',
      title: 'Draw an attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Hold and drag</strong> from one argument towards another to create an attack between them.'
          : '<strong>Right-click</strong> on an argument, hold, and drag towards another argument to create an attack between them.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'delete',
      title: 'Delete an argument or attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Long-press</strong> on an argument or attack to delete it.'
          : '<strong>Right-click and hold</strong> on an argument or attack to delete it.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount < baseline.nodeCount || ctx.linkCount < baseline.linkCount,
    },
    {
      id: 'undo-redo',
      title: 'Undo & Redo',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Made a mistake? Use the <strong>Undo</strong> and <strong>Redo</strong> buttons in the menu to step backward or forward through your changes.'
          : 'Made a mistake? Press <kbd class="kbd kbd-sm">Ctrl Z</kbd> to undo and <kbd class="kbd kbd-sm">Ctrl Shift Z</kbd> to redo. You can also use the buttons in the menu.',
      anchor: 'mainMenuBottom',
      placement: 'bottom-start',
      offsetPx: 48,
      advanceOn: 'button',
    },
    {
      id: 'layout',
      title: 'Auto-layout',
      body: 'The <strong>Layout</strong> option in the menu lets you automatically arrange your framework using various graph layout algorithms — useful when arguments overlap or the structure is hard to read.',
      anchor: 'mainMenuBottom',
      placement: 'bottom-start',
      offsetPx: 48,
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'You\'re all set!',
      body: 'You\'ve learned the basics of creating argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how semantics are computed and visualised.',
      advanceOn: 'button',
      nextTutorialId: 'af-evaluation',
    },
  ],
}
