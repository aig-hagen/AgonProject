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
      title: 'Open the evaluation',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} the <strong>Evaluate</strong> button to open the evaluation.`
          : `${action('Click')} the ${barAction('extension', 'Extension Semantics')} button to open the evaluation window.`,
      highlight: 'openEvalButton',
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
        '.',
      ],
      highlight: 'semanticsSelector',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.evaluationCount > baseline.evaluationCount,
    },
    {
      id: 'compact-window',
      title: 'Focus on the results',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Drag')} the sheet down to snap it smaller, or tap ${barAction('collapse', 'Collapse')}, to fold the parameters away and focus on the results.`
          : `${action('Click')} the window header to hide the parameters and show only the results.`,
      highlight: (isTouchDevice) => (isTouchDevice ? 'evalCollapse' : 'evalHeader'),
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.paramsCollapseCount > baseline.paramsCollapseCount,
      firstEvalOnlyDesktop: true,
    },
    {
      id: 'results',
      title: 'Reading the results',
      body: 'The panel shows each argument together with its acceptance probability under the chosen semantics and mode. A value of <strong>1.0</strong> means the argument is accepted in every relevant subframework; <strong>0.0</strong> means it is never accepted.',
      highlight: 'resultArea',
      refitOnEnter: true,
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
      id: 'multiple-evals',
      title: 'Open multiple evaluations',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `You can run several evaluations at once. ${action('Tap')} the <strong>switcher</strong> at the top of the sheet, then <strong>Add evaluation</strong> to open another — for example to compare two semantics.`
          : `You can run several evaluations at once. ${action('Click')} the ${barAction('extension', 'Extension Semantics')} button again to open another evaluation window — for example to compare two semantics.`,
      highlight: (isTouchDevice) => (isTouchDevice ? 'evalSwitcher' : 'openEvalButton'),
      advanceOn: 'button',
      advanceCondition: (ctx, baseline) =>
        ctx.evaluationWindowCount > baseline.evaluationWindowCount,
      firstEvalOnly: true,
    },
    {
      id: 'done',
      title: 'Great work!',
      body: "You've completed the PAF Evaluation Tutorial. You can open multiple evaluation windows side by side to compare different semantics or modes simultaneously.",
      advanceOn: 'button',
    },
  ],
}
