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
export default {
  noEvaluationYet: 'No evaluation yet.',
  addEvaluation: 'Add evaluation',
  removeEvaluation: 'Remove evaluation',
  collapseSheet: 'Collapse sheet',
  expandSheet: 'Expand sheet',
  closeSwitcher: 'Close switcher',
  kinds: {
    extension: 'Extension semantics',
    ranking: 'Ranking semantics',
    serialisation: 'Serialisation',
  },
  modes: {
    enumerate: 'Enumerate',
    credulous: 'Credulous',
    skeptical: 'Skeptical',
  },
  fields: {
    semantics: 'Semantics',
    mode: 'Mode',
    selection: 'Selection',
    termination: 'Termination',
  },
  metaSemantics: 'Meta Semantics',
  requiresFlat: 'requires a flat theory',
  probabilityHint: 'Node labels show probabilities',
  // Bipolar support-interpretation selector.
  support: {
    label: 'Support',
    coalition: 'Coalition',
    deductive: 'Deductive',
    necessary: 'Necessary',
  },
  // Incomplete-argumentation acceptance-type selector.
  acceptanceType: {
    label: 'Type',
    possible: 'Possible',
    necessary: 'Necessary',
  },
  // Probabilistic-argumentation inference (solver) selector.
  inference: {
    label: 'Inference',
    exact: 'Exact',
    approximate: 'Approximate',
    approxShort: 'Approx.',
  },
  // Plural nouns used by the copy footer and result grid.
  nouns: {
    results: 'results',
    extensions: 'extensions',
    ranking: 'ranking',
    interpretations: 'interpretations',
    probabilities: 'probabilities',
    sequences: 'sequences',
  },
  // Result counts in the status footer.
  counts: {
    extensions: '{n} extension | {n} extensions',
    arguments: '{n} argument | {n} arguments',
    models: '{n} model | {n} models',
    sequences: '{n} sequence | {n} sequences',
  },
  status: {
    copyPlain: 'Copy as plain text',
    copyTex: 'Copy as TeX',
    copied: 'Copied {noun} to clipboard',
    copiedTex: 'Copied {noun} to clipboard (LaTeX)',
    noResults: 'No results.',
    serviceUnavailable: 'Server temporarily unavailable — retrying may help',
    rateLimited: 'Too many requests — please wait a moment',
    timedOut: 'Timed out after {seconds}s',
    failed: 'Evaluation failed',
    retry: 'Retry',
    evaluatingElapsed: 'Evaluating… {seconds}s',
    hideParams: 'Hide',
    editParams: 'Edit',
  },
  legend: {
    accepted: 'Accepted',
    rejected: 'Rejected',
    undecided: 'Undecided',
    derived: 'Derived',
  },
  extensionWindow: {
    selectExtensionHint: 'Select extension to highlight',
    selectArgumentHint: 'Select acceptable argument to highlight',
    noExtensions: 'No extensions exist.',
    noAcceptableArguments: 'No acceptable arguments exist.',
  },
  interpretationWindow: {
    selectModelHint: 'Select model to highlight',
    noModels: 'No models exist.',
  },
  ranking: {
    modeLabel: 'Ranking',
    levelHint: 'Node labels show the ranking level',
    scoreHint: 'Node labels show ranking scores',
  },
  serialisation: {
    view: 'View',
    viewGraph: 'Graph',
    viewList: 'List',
    explore: 'Explore',
    graphLegend: 'Double border: terminal state.',
    exploreLegend: 'Double border: terminal state. Dashed: not explored yet.',
    selectStateHint: 'Select a state to highlight it',
    exploreStateHint: 'Select a state to explore it',
    selectSequenceHint: 'Select a sequence to highlight it',
    noSequences: 'No serialisation sequences found.',
    sequencesTruncated: 'first {n} sequences',
    selectedState: 'Selected state',
    back: 'Back to previous state',
    noInitialSets: 'No selectable initial sets.',
  },
}
