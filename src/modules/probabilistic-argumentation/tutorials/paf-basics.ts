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

export const pafBasicsTutorial: Tutorial = {
  id: 'paf-basics',
  name: 'Basic PAF Tutorial',
  description:
    'Learn how to create arguments and attacks, and how to assign probabilities to them.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Probabilistic Argumentation!',
      body: [
        { text: 'Probabilistic argumentation frameworks (PAFs)', tooltipId: 'PAF' },
        ' extend abstract argumentation by assigning probabilities to arguments and attacks. These probabilities model uncertainty about whether each argument or attack is actually present. This tutorial walks you through building a PAF. You can skip it at any time and restart it from the <strong>Tutorials</strong> menu.',
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
      id: 'probabilities',
      title: 'Argument and attack probabilities',
      body: [
        'Every argument shows its ',
        { text: 'probability', tooltipId: 'argumentProbability' },
        ' below it, and every attack shows its ',
        { text: 'probability', tooltipId: 'attackProbability' },
        ' at the midpoint of the arrow. <strong>Click any probability label</strong> to edit it with a slider or number input.',
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.probabilityEditCount > baseline.probabilityEditCount,
    },
    {
      id: 'probability-editor',
      title: 'The Probability Editor',
      body: 'Use the <strong>Probabilities</strong> button to open a panel that lists all argument and attack probabilities in one place — useful when you have many elements to configure.',
      anchor: 'probabilityButton',
      placement: 'right-start',
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: "You're all set!",
      body: 'You can now build probabilistic argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to compute acceptance probabilities under various semantics.',
      advanceOn: 'button',
      nextTutorialId: 'paf-evaluation',
    },
  ],
}
