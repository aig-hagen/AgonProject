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

export const pafEvaluationTutorial: Tutorial = {
  id: 'paf-evaluation',
  name: 'Evaluation PAF Tutorial',
  description:
    'Learn how to compute acceptance probabilities under various semantics using the constellation approach.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating a PAF',
      body: [
        'PAF evaluation uses the ',
        { text: 'constellation approach', tooltipId: 'constellations' },
        ': each possible subframework is weighted by the probability that its arguments and attacks are present, and the acceptance probability of an argument is aggregated across all subframeworks in which it is accepted.',
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
      id: 'semantics',
      title: 'Pick a semantics and mode',
      body: [
        'Select a <strong>semantics</strong> (e.g. <em>Complete</em>) and a <strong>mode</strong> — ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        ' or ',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        ' — then press <strong>Evaluate</strong> to compute the acceptance probabilities.',
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.evaluationCount > baseline.evaluationCount,
    },
    {
      id: 'results',
      title: 'Reading the results',
      body: 'The panel shows each argument together with its acceptance probability under the chosen semantics and mode. A value of <strong>1.0</strong> means the argument is accepted in every relevant subframework; <strong>0.0</strong> means it is never accepted.',
      advanceOn: 'button',
    },
    {
      id: 'exact-vs-approx',
      title: 'Exact vs. Approximate inference',
      body: [
        { text: 'Exact inference', tooltipId: 'exactInference' },
        ' considers every possible subframework and is precise but can be slow for large PAFs. Switch to ',
        { text: 'Approximate inference', tooltipId: 'approximateInference' },
        ' (the toggle in the panel) to use a Monte Carlo sampling approach — much faster at the cost of small numerical errors.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'done',
      title: 'Great work!',
      body: "You've completed the PAF Evaluation Tutorial. You can open multiple evaluation windows side by side to compare different semantics or modes simultaneously.",
      advanceOn: 'button',
    },
  ],
}
