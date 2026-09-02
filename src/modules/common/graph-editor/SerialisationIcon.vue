<!--
  AgonProject - The platform to explore different approaches to formal argumentation.

  Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <!--
    Serialisation: an extension is built by iteratively selecting an initial set and
    taking the reduct, which branches into a tree of serialisation sequences. Drawn as
    a small asymmetric tree flowing left→right (root on the left) — one path terminates,
    one keeps branching. Filled nodes + stroke edges, like the other kind glyphs.
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-slot="icon"
  >
    <path d="M4.8 13 12 18" />
    <path d="M4.8 13 12 8" />
    <path d="M12 8 19.3 11.4" />
    <path d="M12 8 19.3 4.6" />
    <circle cx="4.8" cy="13" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="8" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="19.3" cy="11.4" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="19.3" cy="4.6" r="1.7" fill="currentColor" stroke="none" />
  </svg>
</template>
