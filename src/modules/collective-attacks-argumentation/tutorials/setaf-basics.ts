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

export const setafBasicsTutorial: Tutorial = {
  id: 'setaf-basics',
  name: 'Basic SetAF Tutorial',
  description: 'Learn how to create arguments and collective attacks in SetAFs.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Argumentation with Collective Attacks!',
      body: [
        'In a ',
        { text: 'SetAF', tooltipId: 'SetAF' },
        ', attacks can come from <strong>sets of arguments</strong> rather than just single arguments. A ',
        { text: 'collective attack', tooltipId: 'collectiveAttack' },
        ' is only effective when all members of the attacking set are present. You can skip this tutorial at any time and restart it from the <strong>Tutorials</strong> menu.',
      ],
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
      id: 'single-attack',
      title: 'Draw a single-source attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Hold and drag</strong> from one argument to another to create a regular (single-source) attack.'
          : '<strong>Right-click</strong> on an argument, hold, and drag towards another argument to create a regular (single-source) attack.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'collective-attack',
      title: 'Draw a collective attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'To create a collective attack: <strong>tap</strong> two or more arguments to select them as sources, then <strong>hold and drag</strong> from one of the selected arguments to the target.'
          : 'To create a collective attack: <strong>Shift+Left-click</strong> two or more arguments to select them as sources, then <strong>right-click</strong> on a selected source, hold, and drag to the target. A branching arrow will appear connecting all sources to the target.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.hyperLinkCount > baseline.hyperLinkCount,
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
        ctx.nodeCount < baseline.nodeCount ||
        ctx.linkCount < baseline.linkCount ||
        ctx.hyperLinkCount < baseline.hyperLinkCount,
    },
    {
      id: 'done',
      title: 'You\'re all set!',
      body: 'You\'ve learned the basics of argumentation with collective attacks. Next, try the <strong>Evaluation Tutorial</strong> to see how collective attacks affect which arguments are accepted.',
      advanceOn: 'button',
      nextTutorialId: 'setaf-evaluation',
    },
  ],
}
