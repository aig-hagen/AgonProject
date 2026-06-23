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

export const adfBasicsTutorial: Tutorial = {
  id: 'adf-basics',
  name: 'Basic Tutorial',
  description: 'Learn how to create arguments and define acceptance conditions in ADFs.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Abstract Dialectical Frameworks!',
      body: [
        { text: 'Abstract Dialectical Frameworks (ADFs)', tooltipId: 'ADF' },
        ' generalise abstract argumentation by attaching an ',
        { text: 'acceptance condition', tooltipId: 'acceptanceCondition' },
        ' to each argument — a propositional formula that determines when the argument is accepted. You can skip this tutorial at any time and restart it from the <strong>Tutorials</strong> menu.',
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
      id: 'open-condition-editor',
      title: 'Acceptance conditions',
      body: [
        'Each argument has an ',
        { text: 'acceptance condition', tooltipId: 'acceptanceCondition' },
        ' shown as a formula next to it on the canvas. The default is <strong>⊤</strong> (tautology) — the argument is always accepted. <strong>Click the formula text</strong> next to any argument to open the condition editor.',
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.conditionEditorOpenCount > baseline.conditionEditorOpenCount,
    },
    {
      id: 'edit-condition',
      title: 'Edit the condition',
      body: 'You can type a formula directly — use <kbd class="kbd kbd-sm">!</kbd> for ¬, <kbd class="kbd kbd-sm">|</kbd> for ∨, and <kbd class="kbd kbd-sm">&</kbd> for ∧. Or use the symbol buttons above the input. Reference another argument by typing its name or selecting it from the <strong>Arg ▾</strong> dropdown. Try changing the condition now.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.conditionEditCount > baseline.conditionEditCount,
    },
    {
      id: 'links',
      title: 'Links from conditions',
      body: 'Links between arguments are drawn <strong>automatically</strong> — whenever a condition references another argument, a link appears from that argument. You never draw links manually in an ADF.',
      advanceOn: 'button',
    },
    {
      id: 'delete',
      title: 'Delete an argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Long-press</strong> on an argument to delete it.'
          : '<strong>Right-click and hold</strong> on an argument to delete it.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount < baseline.nodeCount,
    },
    {
      id: 'done',
      title: 'You\'re all set!',
      body: 'You\'ve learned the basics of Abstract Dialectical Frameworks. Use the <strong>Tutorials</strong> menu to explore more.',
      advanceOn: 'button',
    },
  ],
}
