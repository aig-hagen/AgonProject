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
import { glossaryMeta } from '@/modules/collective-attacks-argumentation/glossary/meta'
import { createGlossary } from '@/modules/common/glossary/load'

export const collectiveAttacksArgumentationGlossary = createGlossary(
  import.meta.glob<string>('/src/modules/collective-attacks-argumentation/glossary/en/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  import.meta.glob<string>(
    [
      '/src/modules/collective-attacks-argumentation/glossary/*/*.md',
      '!/src/modules/collective-attacks-argumentation/glossary/en/*.md',
    ],
    {
      query: '?raw',
      import: 'default',
    },
  ),
  glossaryMeta,
)
