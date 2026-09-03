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

export const adfBasicsTutorial: Tutorial = {
  id: 'adf-basics',
  name: 'Basic ADF Tutorial',
  description: 'Learn how to create arguments and define acceptance conditions in ADFs.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Abstract Dialectical Frameworks!',
      body: [
        { text: 'Abstract Dialectical Frameworks (ADFs)', tooltipId: 'ADF' },
        ' generalise abstract argumentation by attaching an ',
        { text: 'acceptance condition', tooltipId: 'acceptanceCondition' },
        ' to each argument — a propositional formula that determines when the argument is accepted.',
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
      id: 'open-condition-editor',
      title: 'Acceptance conditions',
      body: (isTouchDevice) => [
        'Each argument has an ',
        { text: 'acceptance condition', tooltipId: 'acceptanceCondition' },
        ' shown as a formula next to it on the canvas. The default is <strong>⊤</strong> (tautology) — the argument is always accepted. ',
        isTouchDevice
          ? `${action('Tap')} an argument and choose ${barAction('condition', 'Edit condition')} in the action bar to open the condition editor.`
          : `${action('Click the formula')} next to any argument to open the condition editor.`,
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.conditionEditorOpenCount > baseline.conditionEditorOpenCount,
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
      body: [
        'Links between arguments are drawn <strong>automatically</strong> — whenever a condition references another argument, a link appears from that argument, making it a ',
        { text: 'parent', tooltipId: 'parents' },
        ' of the argument being edited. You never draw links manually in an ADF.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'delete',
      title: 'Delete an argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an argument to select it, then tap ${barAction('delete', 'Delete')} in the action bar. It is also removed from any conditions that reference it.`
          : `${action('Right-click and hold')} on an argument to delete it. It is also removed from any acceptance conditions that reference it.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount < baseline.nodeCount,
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
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
      firstBasicOnly: true,
    },
    {
      id: 'done',
      title: "You're all set!",
      body: "You've learned the basics of Abstract Dialectical Frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how ADF semantics work.",
      advanceOn: 'button',
      nextTutorialId: 'adf-evaluation',
    },
  ],
}
