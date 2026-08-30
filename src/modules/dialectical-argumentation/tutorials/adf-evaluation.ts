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

export const adfEvaluationTutorial: Tutorial = {
  id: 'adf-evaluation',
  name: 'Evaluation ADF Tutorial',
  description: 'Learn how to compute and interpret ADF semantics using three-valued models.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating your ADF',
      body: [
        'ADF evaluation computes ',
        { text: 'three-valued interpretations', tooltipId: 'threeValuedInterpretation' },
        ' — each argument is assigned <strong>in</strong> (accepted), <strong>out</strong> (rejected), or <strong>undec</strong> (undecided) — under a chosen semantics.',
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
      id: 'pick-semantics',
      title: 'Pick a semantics',
      body: [
        'Select a <strong>semantics</strong> (e.g. ',
        { text: 'Complete', tooltipId: 'adfCO' },
        ' or ',
        { text: 'Grounded', tooltipId: 'adfGR' },
        ') and a <strong>mode</strong> — <em>Enumerate</em> shows all models, ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        ' and ',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        ' show accepted arguments.',
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
      id: 'read-results',
      title: 'Reading the results',
      body: 'Click one of the computed <strong>results</strong> to highlight it on the canvas. Arguments are coloured by their label:<ul class="list-disc list-inside mt-1 space-y-0.5"><li><span class="text-success font-medium">Green</span> — in (accepted)</li><li><span class="text-info font-medium">Blue</span> — undec (undecided)</li><li><span class="text-error font-medium">Red</span> — out (rejected)</li></ul>',
      highlight: 'resultArea',
      refitOnEnter: true,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.highlightCount > baseline.highlightCount,
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
      body: "You've completed the ADF Evaluation Tutorial. Explore more features like export and sharing from the menu.",
      advanceOn: 'button',
    },
  ],
}
