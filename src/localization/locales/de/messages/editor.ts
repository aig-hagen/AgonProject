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
  toolbar: {
    fitToView: 'An Ansicht anpassen',
    evaluate: 'Auswerten',
    backToFrameworks: 'Zurück zu den Argumentationsgraphen',
    extensionSemantics: 'Extensionsbasierte Semantiken',
    rankingSemantics: 'Rangsemantiken',
    serialisationSequences: 'Serialisierung',
  },
  selection: {
    addToAttack: 'Zum Angriff hinzufügen',
    removeFromAttack: 'Aus Angriff entfernen',
    switchTo: 'Zu {type} wechseln',
    linkFallback: 'Typ',
  },
  certainty: {
    argumentType: 'Argumenttyp',
    definiteArgument: 'Sicheres Argument',
    uncertainArgument: 'Unsicheres Argument',
    markDefinite: 'Als sicher markieren',
    markUncertain: 'Als unsicher markieren',
  },
  probabilities: {
    title: 'Wahrscheinlichkeiten',
    editProbability: 'Wahrscheinlichkeit bearbeiten',
    arguments: 'Argumente',
    attacks: 'Angriffe',
    empty:
      'Füge dem Argumentationsgraphen Argumente hinzu, um ihre Wahrscheinlichkeiten festzulegen.',
  },
  condition: {
    title: 'Akzeptanzbedingung',
    titleOf: 'Akzeptanzbedingung von {name}',
    editCondition: 'Bedingung bearbeiten',
    syntaxError: 'Bedingung ist syntaktisch inkorrekt und wird nicht gespeichert',
    backspace: 'Löschen',
    hint: 'Tippe auf die Operatortasten und Argument-Chips, um die Bedingung zu erstellen.',
    operators: 'Operatoren',
    arguments: 'Argumente',
    referenceEmpty: 'Füge dem Argumentationsgraphen Argumente hinzu, um sie hier zu referenzieren.',
    clearAll: 'Alle löschen',
    atom: 'Arg',
    noArguments: 'Keine Argumente',
    keys: {
      negation: 'Negation',
      conjunction: 'Konjunktion',
      disjunction: 'Disjunktion',
      tautology: 'Tautologie',
      contradiction: 'Kontradiktion',
      parentheses: 'Klammern',
    },
  },
  links: {
    type: 'Kantentyp',
    attack: 'Angriff',
    support: 'Unterstützung',
    definiteAttack: 'Bedingt sicherer Angriff',
    uncertainAttack: 'Unsicherer Angriff',
    collectiveAttack: 'Mengenangriff',
    rule: 'Regel',
    link: 'Kante',
  },
  relayout: {
    other: 'Andere',
    // Layout names are kept in English in German too (established graph-drawing terms).
    layouts: {
      TopToBottom: 'Top to bottom',
      BottomToTop: 'Bottom to top',
      LeftToRight: 'Left to right',
      RightToLeft: 'Right to left',
      ForceDirected: 'Force-directed',
      Neato: 'Spring model',
      Circular: 'Circular',
      Radial: 'Radial',
    },
  },
  aba: {
    views: {
      ariaLabel: 'Ansicht der Arbeitsfläche',
      ariaLabelActive: 'Ansicht der Arbeitsfläche: {view}',
      theoryDescription: 'Regeln und Annahmen bearbeiten',
      afDescription: 'Argumente und Angriffe, schreibgeschützt',
      setafDescription: 'Annahmen mit Mengenangriffen, schreibgeschützt',
      bsafDescription: 'Annahmen mit Mengenangriffen und Mengenunterstützungen, schreibgeschützt',
      flatOnly: 'Nur für flache ABA-Theorien verfügbar',
      readOnly: 'schreibgeschützt',
      derivedFromTheory: 'Aus ABA-Theorie abgeleitet',
      unavailable:
        'Diese Ansicht ist nur für flache ABA-Theorien exakt, und diese Theorie leitet eine Annahme ab.',
      backToTheory: 'Zurück zur ABA-Theorie',
      argumentsCapped: '{shown} von {total} Argumenten angezeigt',
    },
    theory: {
      title: 'ABA-Theorie',
      flat: 'flach',
      nonFlat: 'nicht flach',
      expand: 'Ausklappen',
      collapse: 'Einklappen',
      assumptions: 'Annahmen & Negationen',
      atoms: 'Atome',
      noAssumptions: 'Noch keine Annahmen.',
      noAtoms: 'Noch keine Atome.',
      addAssumption: 'Annahme hinzufügen',
      addAtom: 'Atom hinzufügen',
      makeAtom: 'Zum Atom machen',
      makeAssumption: 'Zur Annahme machen',
      nameOf: 'Name von {name}',
      delete: '{name} löschen',
      contraryOf: 'Negation von {name}',
      chooseContrary: 'auswählen…',
      nameTaken: 'Der Name „{name}“ ist bereits vergeben',
      rules: 'Regeln',
      noRules: 'Noch keine Regeln.',
      editRule: 'Regel bearbeiten',
      setFact: 'Als Fakt setzen',
      unsetFact: 'Fakt aufheben',
      deleteRule: 'Regel löschen',
      deleteFact: 'Fakt löschen',
      ruleHead: 'Regelkopf',
      headPlaceholder: 'Kopf ...',
      ruleBody: 'Regelrumpf',
      bodyPlaceholder: 'Rumpf ...',
      remove: '{name} entfernen',
      addRule: 'Regel hinzufügen',
      addFact: 'Fakt hinzufügen',
    },
    checks: {
      title: 'Hinweise',
      ok: 'Keine Hinweise verfügbar.',
      noContrary: 'Annahme „{name}“ hat keine Negation',
      selfContrary: '„{name}“ ist seine eigene Negation → greift sich selbst an',
      contraryIsAssumption: 'Negation von „{name}“ ist eine Annahme („{contrary}“)',
      tautologicalRule: 'tautologische Regel {head} ← …, {head}',
      underivable: 'Atom „{name}“ ist nicht ableitbar',
    },
  },
}
