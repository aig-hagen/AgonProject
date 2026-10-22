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
  noEvaluationYet: 'Noch keine Auswertung.',
  addEvaluation: 'Auswertung hinzufügen',
  removeEvaluation: 'Auswertung entfernen',
  collapseSheet: 'Sheet einklappen',
  expandSheet: 'Sheet ausklappen',
  closeSwitcher: 'Auswahl schließen',
  kinds: {
    extension: 'Extensionsbasierte Semantiken',
    ranking: 'Rangsemantiken',
    serialisation: 'Serialisierung',
  },
  modes: {
    enumerate: 'Aufzählen',
    credulous: 'Leichtgläubig',
    skeptical: 'Skeptisch',
  },
  fields: {
    semantics: 'Semantik',
    mode: 'Modus',
    selection: 'Selektion',
    termination: 'Terminierung',
  },
  metaSemantics: 'Meta-Semantiken',
  requiresFlat: 'erfordert eine flache Theorie',
  probabilityHint: 'Knotenbeschriftungen zeigen Wahrscheinlichkeiten',
  // Bipolar support-interpretation selector.
  support: {
    label: 'Unterstützung',
    coalition: 'Koalition',
    deductive: 'Deduktiv',
    necessary: 'Notwendig',
  },
  // Incomplete-argumentation acceptance-type selector.
  acceptanceType: {
    label: 'Typ',
    possible: 'Möglich',
    necessary: 'Notwendig',
  },
  // Probabilistic-argumentation inference (solver) selector.
  inference: {
    label: 'Inferenz',
    exact: 'Exakt',
    approximate: 'Approximativ',
    approxShort: 'Approx.',
  },
  // Plural nouns used by the copy footer and result grid.
  nouns: {
    results: 'Ergebnisse',
    extensions: 'Extensionen',
    ranking: 'Ranking',
    interpretations: 'Interpretationen',
    probabilities: 'Wahrscheinlichkeiten',
    sequences: 'Sequenzen',
  },
  // Result counts in the status footer.
  counts: {
    extensions: '{n} Extension | {n} Extensionen',
    arguments: '{n} Argument | {n} Argumente',
    models: '{n} Modell | {n} Modelle',
    sequences: '{n} Sequenz | {n} Sequenzen',
  },
  status: {
    copyPlain: 'Als Text kopieren',
    copyTex: 'Als TeX kopieren',
    copied: '{noun} in die Zwischenablage kopiert',
    copiedTex: '{noun} in die Zwischenablage kopiert (LaTeX)',
    noResults: 'Keine Ergebnisse.',
    serviceUnavailable: 'Server vorübergehend nicht verfügbar — bitte versuche es erneut',
    rateLimited: 'Zu viele Anfragen — bitte einen Moment warten',
    timedOut: 'Zeitüberschreitung nach {seconds}s',
    failed: 'Auswertung fehlgeschlagen',
    retry: 'Erneut versuchen',
    evaluatingElapsed: 'Wird ausgewertet… {seconds}s',
    hideParams: 'Ausblenden',
    editParams: 'Bearbeiten',
  },
  legend: {
    accepted: 'Akzeptiert',
    rejected: 'Abgelehnt',
    undecided: 'Unbestimmt',
    derived: 'Abgeleitet',
  },
  extensionWindow: {
    selectExtensionHint: 'Extension zum Hervorheben auswählen',
    selectArgumentHint: 'Argument zum Hervorheben auswählen',
    noExtensions: 'Es existieren keine Extensionen.',
    noAcceptableArguments: 'Es existieren keine akzeptablen Argumente.',
  },
  interpretationWindow: {
    selectModelHint: 'Modell zum Hervorheben auswählen',
    noModels: 'Es existieren keine Modelle.',
  },
  ranking: {
    modeLabel: 'Ranking',
    levelHint: 'Knotenbeschriftungen zeigen die Rangstufe',
    scoreHint: 'Knotenbeschriftungen zeigen Rangwerte',
  },
  serialisation: {
    view: 'Ansicht',
    viewGraph: 'Graph',
    viewList: 'Liste',
    explore: 'Erkunden',
    graphLegend: 'Doppelter Rahmen: terminaler Zustand.',
    exploreLegend: 'Doppelter Rahmen: terminaler Zustand. Gestrichelt: noch nicht erkundet.',
    selectStateHint: 'Zustand auswählen, um ihn hervorzuheben',
    exploreStateHint: 'Zustand auswählen, um ihn zu erkunden',
    selectSequenceHint: 'Sequenz auswählen, um sie hervorzuheben',
    noSequences: 'Keine Serialisierungssequenzen gefunden.',
    sequencesTruncated: 'erste {n} Sequenzen',
    selectedState: 'Ausgewählter Zustand',
    back: 'Zurück zum vorherigen Zustand',
    noInitialSets: 'Keine auswählbaren initialen Mengen.',
  },
}
