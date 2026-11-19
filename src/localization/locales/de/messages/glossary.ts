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
  title: 'Glossar',
  backToEditor: 'Zurück zum Editor',
  back: 'Zurück',
  searchPlaceholder: 'Einträge suchen…',
  searchAll: 'Glossar durchsuchen…',
  searchModule: '{name} durchsuchen…',
  results: '{n} Ergebnis | {n} Ergebnisse',
  allEntries: 'Alle Einträge',
  // Section labels of the mobile glossary index.
  index: {
    frameworks: 'Formalismen',
    topics: 'Themen',
    references: 'Referenzen',
  },
  noResults: 'Keine Ergebnisse',
  selectTerm: 'Wähle einen Eintrag aus der Liste.',
  source: 'Referenz',
  referencedBy: 'Verwendet in',
  more: 'Mehr',
  sources: 'Quellen',
  // Names of the glossary tabs that aren't app modules.
  modules: {
    complexity: 'Berechnungskomplexität',
    principles: 'Argumentationsprinzipien',
  },
  complexity: {
    groups: {
      overviews: 'Übersichten',
      problems: 'Entscheidungsprobleme',
      classes: 'Komplexitätsklassen',
      other: 'Weitere',
    },
    title: 'Berechnungskomplexität',
    problem: 'Problem',
    general: 'Allgemein',
    bipolar: 'Bipolar',
    generalHeading: 'Allgemeine ADFs',
    bipolarHeading: 'Bipolare ADFs',
    bipolarNote:
      'Ergebnisse für {term}, unter der Annahme, dass die Kantentypen bekannt sind, also zur Eingabe gehören.',
    bipolarTerm: 'bipolare ADFs',
    compareAll: 'Alle Semantiken vergleichen',
    semantics: 'Semantik',
    trivial: 'trivial',
    complete: '-vollständig',
    completeShort: '-v',
    unlessPNP: 'außer P = NP',
    hard: '-schwer',
    in: 'in',
  },
  principles: {
    title: 'Postulate',
    compareAll: 'Alle Semantiken vergleichen',
    semantics: 'Semantik',
    principle: 'Postulat',
    show: 'Anzeigen',
    all: 'Alle',
    none: 'Keine',
    legend: '✓ erfüllt · ✗ verletzt · ? offen',
    groups: {
      conflictAndDefence: 'Conflict and Defence',
      basic: 'Basic',
      structureOfExtensions: 'Structure of Extensions',
      directionality: 'Directionality',
      invariance: 'Invariance',
      modularity: 'Modularity',
      decomposition: 'Decomposition',
      weakAdmissibility: 'Weak Admissibility',
    },
  },
  // English for now: only the English glossary pages are prerendered.
  seo: {
    indexContext: 'Formal Argumentation',
    index:
      'Definitions from formal argumentation, from Dung frameworks to ADFs and assumption-based argumentation, with computational complexity, principles and sources.',
    literature:
      'The {count} publications on formal argumentation cited in AgonProject, with links to each paper.',
    // One per glossary module, keyed by its prefix.
    modules: {
      AF: 'Definitions for abstract argumentation: argumentation frameworks, conflict-freeness, admissibility, and semantics such as grounded, preferred and stable.',
      BAF: 'Definitions for bipolar argumentation: frameworks with attack and support, deductive and necessary support, coalitions and coalition-based semantics.',
      ADF: 'Definitions for abstract dialectical frameworks: acceptance conditions, three-valued interpretations, and semantics such as grounded, preferred and stable.',
      iAF: 'Definitions for incomplete argumentation: frameworks with uncertain arguments and attacks, completions, and possible and necessary acceptance.',
      PAF: 'Definitions for probabilistic argumentation: argument and attack probabilities, subframeworks, the constellation approach and acceptance probabilities.',
      SetAF:
        'Definitions for argumentation with collective attacks: range, weak defence, and semantics such as weak admissibility and weakly preferred.',
      ABA: 'Definitions for assumption-based argumentation: assumptions, contraries, inference rules, attacks, and semantics such as grounded, preferred and stable.',
      Complexity:
        'Overview tables for reasoning complexity: credulous and skeptical acceptance and verification for abstract argumentation and abstract dialectical frameworks.',
      Principles:
        'Which abstract argumentation semantics satisfy which principles, from admissibility and reinstatement to directionality and SCC-recursiveness, with sources.',
    },
  },
}
