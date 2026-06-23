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

export const bipolarBasicsTutorial: Tutorial = {
  id: 'bipolar-basics',
  name: 'Basic Tutorial',
  description: 'Learn how to create arguments and connect them with attack and support relations.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Bipolar Argumentation!',
      body: 'Bipolar frameworks extend abstract argumentation with a second relation: besides <strong>attacks</strong>, arguments can also <strong>support</strong> one another. This tutorial shows you how to work with both. You can skip it at any time and restart it from the <strong>Tutorials</strong> menu.',
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
      id: 'link-types',
      title: 'Attacks and supports',
      body: 'This toolbar selects which relation new links create: <strong>Attack</strong> or <strong>Support</strong>. The currently selected type is highlighted — click a button to switch it before drawing a link.',
      anchor: 'linkSwitchButton',
      placement: 'right-start',
      offsetPx: 64,
      advanceOn: 'button',
    },
    {
      id: 'create-attack',
      title: 'Draw an attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'With <strong>Attack</strong> selected, <strong>hold and drag</strong> from one argument towards another to create an attack.'
          : 'With <strong>Attack</strong> selected, <strong>right-click</strong> on an argument, hold, and drag towards another argument to create an attack.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'create-support',
      title: 'Draw a support',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Now select <strong>Support</strong> in the toolbar, then <strong>hold and drag</strong> from one argument to another to create a support relation.'
          : 'Now select <strong>Support</strong> in the toolbar, then <strong>right-click</strong> and drag from one argument to another to create a support relation.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'switch-link-type',
      title: 'Change a relation',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Tap</strong> an existing link to switch it between attack and support.'
          : '<strong>Left-click</strong> an existing link to switch it between attack and support.',
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'You\'re all set!',
      body: 'You can now build bipolar frameworks with both attacks and supports. Next, try the <strong>Evaluation Tutorial</strong> to see how supports affect which arguments are accepted.',
      advanceOn: 'button',
      nextTutorialId: 'bipolar-evaluation',
    },
  ],
}
