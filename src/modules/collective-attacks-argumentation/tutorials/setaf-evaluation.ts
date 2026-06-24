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

export const setafEvaluationTutorial: Tutorial = {
  id: 'setaf-evaluation',
  name: 'Evaluation Tutorial',
  description: 'Learn how to compute extension-based semantics for argumentation frameworks with collective attacks.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating a SetAF',
      body: [
        'Evaluation in a ',
        { text: 'SetAF', tooltipId: 'SetAF' },
        ' follows the same extension-based approach as in abstract AFs, but ',
        { text: 'collective attacks', tooltipId: 'collectiveAttack' },
        ' change the notion of defence: to defend an argument against a collective attack, a set must attack at least one member of the attacking set.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'open-eval',
      title: 'Open the evaluation panel',
      body: 'Click the <strong>Extension Semantics</strong> button (the variable icon) on the left to open an evaluation window.',
      anchor: 'evaluationButtons',
      placement: 'right-start',
      offsetPx: 64,
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.isExtensionWindowOpen,
    },
    {
      id: 'evaluate',
      title: 'Pick a semantics and evaluate',
      body: [
        'Select a <strong>semantics</strong> and a <strong>mode</strong> — <em>Enumerate</em> to list all extensions, or ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        '/',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        ' to check individual argument acceptance — then press <strong>Evaluate</strong>.',
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.evaluationCount > baseline.evaluationCount,
    },
    {
      id: 'read-results',
      title: 'Reading the results',
      body: 'Click one of the computed <strong>results</strong> to highlight it on the canvas. Arguments are coloured depending on their status:<ul class="list-disc list-inside mt-1 space-y-0.5"><li><span class="text-success font-medium">Green</span> — accepted</li><li><span class="text-info font-medium">Blue</span> — undecided</li><li><span class="text-error font-medium">Red</span> — rejected</li></ul>',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.highlightCount > baseline.highlightCount,
    },
    {
      id: 'done',
      title: 'Great work!',
      body: 'You\'ve completed the SetAF Evaluation Tutorial. Try comparing results with different semantics, or open multiple evaluation windows side by side to compare modes.',
      advanceOn: 'button',
    },
  ],
}
