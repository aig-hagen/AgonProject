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
import { action, barAction } from '@/modules/common/tutorial/hints'
import type { Tutorial } from '@/modules/common/tutorial/types'

export const afBasicsTutorial: Tutorial = {
  id: 'af-basics',
  name: 'Basic AF Tutorial',
  description:
    'Learn how to create arguments and attacks, delete elements, and undo your changes.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Abstract Argumentation!',
      body: [
        'An ',
        { text: 'argumentation framework (AF)', tooltipId: 'AF' },
        ' consists of <strong>arguments</strong> and <strong>attacks</strong> between them. This short tutorial will guide you through the basic features.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'create-argument',
      title: 'Create an argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Double-tap')} on an empty area of the canvas to create a new argument.`
          : `${action('Double-click')} on an empty area of the canvas to create a new argument.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'create-attack',
      title: 'Draw an attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Hold and drag')} from one argument towards another to create an attack between them.`
          : `${action('Right-click')} on an argument, hold, and drag towards another argument to create an attack between them.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'delete',
      title: 'Delete an argument or attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an argument or attack to select it, then tap ${barAction('delete', 'Delete')} in the action bar.`
          : `${action('Right-click and hold')} on an argument or attack to delete it.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount < baseline.nodeCount || ctx.linkCount < baseline.linkCount,
      firstBasicOnly: true,
    },
    {
      id: 'undo',
      title: 'Undo & Redo',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Made a mistake? ${action('Tap')} the <strong>Undo</strong> button to step backward through your changes. Try it now to undo the deletion.`
          : `Made a mistake? Press <kbd class="kbd kbd-sm">Ctrl Z</kbd> to undo and <kbd class="kbd kbd-sm">Ctrl Shift Z</kbd> to redo. Try it now to undo the deletion.`,
      highlight: (isTouchDevice) => (isTouchDevice ? 'undoButton' : undefined),
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount > baseline.nodeCount || ctx.linkCount > baseline.linkCount,
      firstBasicOnly: true,
    },
    {
      id: 'done',
      title: "You're all set!",
      body: "You've learned the basics of creating argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how semantics are computed and visualised.",
      advanceOn: 'button',
      nextTutorialId: 'af-evaluation',
    },
  ],
}
