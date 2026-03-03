<script setup lang="ts">
import { ref } from 'vue'

import { ArrowLongRightIcon, ArrowTrendingUpIcon } from '@heroicons/vue/24/outline'
const isOpen = ref(true)
</script>

<template>
  <svg
    class="graph block h-full w-full graph-controller__graph-canvas"
    style="background-color: white"
  >
    <g transform="translate(709,130)scale(0.9)">
      <defs>
        <marker
          id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow"
          viewBox="0,0,4,4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
          class="graph-controller__arrow"
        >
          <path d="M0,0L0,4L4,2"></path>
        </marker>
      </defs>
      <defs>
        <marker
          id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse"
          viewBox="0,0,4,4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
          class="graph-controller__arrow"
        >
          <path d="M0,0L0,4L4,2"></path>
        </marker>
      </defs>
      <defs>
        <marker
          id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-draggable-link-arrow"
          viewBox="0,0,4,4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
          class="graph-controller__arrow draggable"
        >
          <path d="M0,0L0,4L4,2"></path>
        </marker>
      </defs>
      <path
        class="graph-controller__link draggable hidden"
        d="M0,0L0,0"
        style="marker-end: url('#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-draggable-link-arrow')"
      ></path>
      <g class="links">
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-1-0"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M42.813723920144206,205.4267064073993
L53.2,190.8
L61.5,194.5
L72.8,169.9
L81.1,173.6
L92.2483681064744,130.09772479013427"
          ></path>
          <path
            @click="isOpen = !isOpen"
            class="graph-controller__link-click-box"
            d="M42.813723920144206,205.4267064073993
L53.2,190.8
L61.5,194.5
L72.8,169.9
L81.1,173.6
L92.2483681064744,130.09772479013427"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-1-0"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="31.066650390625"
            y="170.11666870117188"
            ><div class="graph-controller__link-label-placeholder w-md h-100 relative z-100"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-2-0"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M112,201
	          L112,136"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M112,201
	          L112,136"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-2-0"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="89"
            y="78.066650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-4"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M193.6688588712447,459.197269295792
	          A183.72152840644452,183.72152840644452,0,0,1,242.32202471488517,382.2106378370932"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M193.6688588712447,459.197269295792
	          A183.72152840644452,183.72152840644452,0,0,1,242.32202471488517,382.2106378370932"
          ></path>
          <text class="graph-controller__arc-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-4"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="203.433349609375"
            y="336.41668701171875"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-2"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 121.62120021927657 262.690524734293 L 175.78409983554258 457.98210644928025"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 121.62120021927657 262.690524734293 L 175.78409983554258 457.98210644928025"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-2"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="176.48333740234375"
            y="429.4000244140625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-6"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M178.31149920299288,457.4101906686704
	          A153.6,153.6,0,0,1,176.7486656039905,391.45307910843945"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M178.31149920299288,457.4101906686704
	          A153.6,153.6,0,0,1,176.7486656039905,391.45307910843945"
          ></path>
          <text class="graph-controller__arc-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-3-6"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="162.933349609375"
            y="334.04998779296875"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-11"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 260.98400720715404 135.9865492902038 L 266.2619945946345 329.01008803234714"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 260.98400720715404 135.9865492902038 L 266.2619945946345 329.01008803234714"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-11"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="271.88330078125"
            y="310.26666259765625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-2"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 139.75844587293756 250.9231036886194 L 246.18116559529685 338.80767223353547"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 139.75844587293756 250.9231036886194 L 246.18116559529685 338.80767223353547"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-2"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="262.26666259765625"
            y="328.48333740234375"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-3"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 207.67797528511483 457.7893621629068 A 183.72152840644452 183.72152840644452 0 0 0 256.3311411287553 380.802730704208"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 207.67797528511483 457.7893621629068 A 183.72152840644452 183.72152840644452 0 0 0 256.3311411287553 380.802730704208"
          ></path>
          <text class="graph-controller__arc-reverse-path-text" dy="20">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-3"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="220.63330078125"
            y="350.8499755859375"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-12"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M275.79772920736116,330.47354390453023
	          A175.64737401965334,175.64737401965334,0,0,1,315.33636881573483,255.97069576438176"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M275.79772920736116,330.47354390453023
	          A175.64737401965334,175.64737401965334,0,0,1,315.33636881573483,255.97069576438176"
          ></path>
          <text class="graph-controller__arc-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-4-12"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="279.13330078125"
            y="207.11669921875"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-5-3"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M183,585
	          L183,520"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M183,585
	          L183,520"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-5-3"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="160"
            y="462.066650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-6-3"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M187.68850079700712,382.5898093313296
	          A153.6,153.6,0,0,1,189.2513343960095,448.54692089156055"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M187.68850079700712,382.5898093313296
	          A153.6,153.6,0,0,1,189.2513343960095,448.54692089156055"
          ></path>
          <text class="graph-controller__arc-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-6-3"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="185.58331298828125"
            y="504.58331298828125"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-7-4"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M267,585
	          L267,392"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M267,585
	          L267,392"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-7-4"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="244"
            y="398.066650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-7-3"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 202.7516318935256 514.0977247901343 L 252.1862760798558 589.4267064073993"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 202.7516318935256 514.0977247901343 L 252.1862760798558 589.4267064073993"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-7-3"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="280.13330078125"
            y="608.1666870117188"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-8-7"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M267,713
	          L267,648"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M267,713
	          L267,648"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-8-7"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="244"
            y="590.066650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-9-8"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M267,841
	          L267,776"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M267,841
	          L267,776"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-9-8"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="244"
            y="718.066650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-11-10"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M260,73
	          L260,8"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M260,73
	          L260,8"
          ></path>
          <text class="graph-controller__line-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-11-10"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="237"
            y="-49.95001220703125"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-11"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 278.73332621631664 130.74186866267345 L 323.95000533776255 204.94359850299492"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 278.73332621631664 130.74186866267345 L 323.95000533776255 204.94359850299492"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-11"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="351.7166748046875"
            y="226.48333740234375"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-13"
            marker-end="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-\#000000)"
            d="M334.56167190272254,201.21982263136647
	          A153.76865740455693,153.76865740455693,0,0,1,336.09548191859415,135.1214833670323"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M334.56167190272254,201.21982263136647
	          A153.76865740455693,153.76865740455693,0,0,1,336.09548191859415,135.1214833670323"
          ></path>
          <text class="graph-controller__arc-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-13"
              startOffset="50%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="324.88330078125"
            y="78.0333251953125"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-4"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 289.66363118426517 328.0293042356182 A 175.64737401965334 175.64737401965334 0 0 0 329.20227079263884 253.52645609546977"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 289.66363118426517 328.0293042356182 A 175.64737401965334 175.64737401965334 0 0 0 329.20227079263884 253.52645609546977"
          ></path>
          <text class="graph-controller__arc-reverse-path-text" dy="20">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-12-4"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="300.26666259765625"
            y="218.2166748046875"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-13-12"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 345.90451808140585 192.8785166329677 A 153.76865740455693 153.76865740455693 0 0 0 347.43832809727746 126.78017736863355"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 345.90451808140585 192.8785166329677 A 153.76865740455693 153.76865740455693 0 0 0 347.43832809727746 126.78017736863355"
          ></path>
          <text class="graph-controller__arc-reverse-path-text" dy="20">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-13-12"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="346.9666748046875"
            y="69.316650390625"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
        <g class="graph-controller__link-container">
          <path
            class="graph-controller__link"
            style="stroke: rgb(0, 0, 0)"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-14-0"
            marker-start="url(#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-\#000000)"
            d="M 131.7516318935256 130.09772479013427 L 181.1862760798558 205.4267064073993"
          ></path>
          <path
            class="graph-controller__link-click-box"
            d="M 131.7516318935256 130.09772479013427 L 181.1862760798558 205.4267064073993"
          ></path>
          <text class="graph-controller__line-reverse-path-text" dy="-10">
            <textPath
              class="graph-controller__link-label-placeholder hidden not-editable"
              href="#g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-14-0"
              startOffset="46%"
            >
              add label
            </textPath>
          </text>
          <foreignObject
            class="graph-controller__link-label-mathjax-container"
            xmlns="http://www.w3.org/2000/svg"
            width="1"
            height="1"
            x="209.13330078125"
            y="224.16668701171875"
            ><div class="graph-controller__link-label-placeholder"></div
          ></foreignObject>
        </g>
      </g>
      <g class="nodes">
        <g class="graph-controller__node-container" transform="translate(112,100)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-0"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">A</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(28,228)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-1"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">B</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(112,228)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-2"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">C</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(183,484)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-3"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">D</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(267,356)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-4"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">E</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(183,612)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-5"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">F</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(183,356)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-6"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">G</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(267,612)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-7"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">H</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(267,740)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-8"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">I</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(267,868)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-9"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">J</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(260,-28)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-10"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">K</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(260,100)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-11"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">L</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(338,228)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-12"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">M</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(344,100)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-13"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">N</div></foreignObject
          >
        </g>
        <g class="graph-controller__node-container" transform="translate(196,228)">
          <circle
            class="graph-controller__node"
            id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-node-14"
            r="28"
            style="fill: rgb(153, 183, 213)"
          ></circle>
          <foreignObject
            class="graph-controller__node-label-container"
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            x="-28"
            y="-28"
            ><div class="graph-controller__node-label not-editable">O</div></foreignObject
          >
        </g>
      </g>
      <defs>
        <marker
          id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-#000000"
          viewBox="0,0,4,4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
          class="graph-controller__arrow #000000"
        >
          <path d="M0,0L0,4L4,2" style="fill: rgb(0, 0, 0)"></path>
        </marker>
      </defs>
      <defs>
        <marker
          id="g2abc8f74-dbb6-4fc7-9b93-762b5f400c27-link-arrow-reverse-#000000"
          viewBox="0,0,4,4"
          refX="2"
          refY="2"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
          class="graph-controller__arrow colored"
        >
          <path d="M0,0L0,4L4,2" style="fill: rgb(0, 0, 0)"></path>
        </marker>
      </defs>
    </g>
    <foreignObject
      v-if="isOpen"
      class="graph-controller__link-label-mathjax-container"
      xmlns="http://www.w3.org/2000/svg"
      width="1"
      height="1"
      x="731.066650390625"
      y="270.11666870117188"
      ><div class="graph-controller__link-label-placeholder w-md h-100 relative z-100">
        <ul class="dropdown menu rounded-box bg-base-100 shadow-lg">
          <li>
            <a><ArrowLongRightIcon class="size-5 opacity-70" />Attack</a>
          </li>
          <li class="bg-base-300">
            <a><ArrowTrendingUpIcon class="size-5 opacity-70 rotate-25" />Support</a>
          </li>
        </ul>
      </div></foreignObject
    >
  </svg>
</template>

<style>
.graph-controller__graph-host {
  position: absolute;
  width: 100%;
  height: 100%;
  touch-action: none;
  background-color: lightgrey;
}

.graph-controller__graph-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.graph-controller__link {
  stroke: #004c97;
  stroke-width: 4px;
  fill: none;
}
.graph-controller__link.hidden {
  stroke-width: 0;
}
.graph-controller__link.draggable {
  stroke: #007dae;
  stroke-dasharray: 8px 2px;
  pointer-events: none;
}

.graph-controller__link-click-box {
  stroke: rgba(0, 0, 0, 0);
  stroke-width: 16px;
  fill: none;
  cursor: pointer;
}

.graph-controller__arrow {
  fill: #004c97;
}
.graph-controller__arrow.draggable {
  fill: #007dae;
}

.graph-controller__line-path-text,
.graph-controller__arc-path-text,
.graph-controller__line-reverse-path-text,
.graph-controller__arc-reverse-path-text,
.graph-controller__reflexive-path-text,
.graph-controller__link-label-mathjax-container {
  text-anchor: middle;
  pointer-events: all;
  cursor: text;
  opacity: 1;
  stroke: none;
}
.graph-controller__line-path-text .graph-controller__link-label,
.graph-controller__arc-path-text .graph-controller__link-label,
.graph-controller__line-reverse-path-text .graph-controller__link-label,
.graph-controller__arc-reverse-path-text .graph-controller__link-label,
.graph-controller__reflexive-path-text .graph-controller__link-label,
.graph-controller__link-label-mathjax-container .graph-controller__link-label {
  fill: black;
  font-family: sans-serif;
  font-size: 1rem;
  stroke: none;
}
.graph-controller__line-path-text .graph-controller__link-label.hidden,
.graph-controller__arc-path-text .graph-controller__link-label.hidden,
.graph-controller__line-reverse-path-text .graph-controller__link-label.hidden,
.graph-controller__arc-reverse-path-text .graph-controller__link-label.hidden,
.graph-controller__reflexive-path-text .graph-controller__link-label.hidden,
.graph-controller__link-label-mathjax-container .graph-controller__link-label.hidden {
  visibility: hidden;
  cursor: pointer;
  pointer-events: none;
}
.graph-controller__line-path-text .graph-controller__link-label.not-editable,
.graph-controller__arc-path-text .graph-controller__link-label.not-editable,
.graph-controller__line-reverse-path-text .graph-controller__link-label.not-editable,
.graph-controller__arc-reverse-path-text .graph-controller__link-label.not-editable,
.graph-controller__reflexive-path-text .graph-controller__link-label.not-editable,
.graph-controller__link-label-mathjax-container .graph-controller__link-label.not-editable {
  cursor: pointer;
}
.graph-controller__line-path-text .graph-controller__link-label-placeholder,
.graph-controller__arc-path-text .graph-controller__link-label-placeholder,
.graph-controller__line-reverse-path-text .graph-controller__link-label-placeholder,
.graph-controller__arc-reverse-path-text .graph-controller__link-label-placeholder,
.graph-controller__reflexive-path-text .graph-controller__link-label-placeholder,
.graph-controller__link-label-mathjax-container .graph-controller__link-label-placeholder {
  fill: dimgrey;
  font-family: sans-serif;
  font-size: 0.85rem;
  font-style: oblique;
}
.graph-controller__line-path-text .graph-controller__link-label-placeholder.hidden,
.graph-controller__arc-path-text .graph-controller__link-label-placeholder.hidden,
.graph-controller__line-reverse-path-text .graph-controller__link-label-placeholder.hidden,
.graph-controller__arc-reverse-path-text .graph-controller__link-label-placeholder.hidden,
.graph-controller__reflexive-path-text .graph-controller__link-label-placeholder.hidden,
.graph-controller__link-label-mathjax-container .graph-controller__link-label-placeholder.hidden {
  visibility: hidden;
  cursor: pointer;
  pointer-events: none;
}
.graph-controller__line-path-text .graph-controller__link-label-placeholder.not-editable,
.graph-controller__arc-path-text .graph-controller__link-label-placeholder.not-editable,
.graph-controller__line-reverse-path-text .graph-controller__link-label-placeholder.not-editable,
.graph-controller__arc-reverse-path-text .graph-controller__link-label-placeholder.not-editable,
.graph-controller__reflexive-path-text .graph-controller__link-label-placeholder.not-editable,
.graph-controller__link-label-mathjax-container
  .graph-controller__link-label-placeholder.not-editable {
  cursor: pointer;
}
.graph-controller__line-path-text .graph-controller__link-label-placeholder.mjx-hidden,
.graph-controller__arc-path-text .graph-controller__link-label-placeholder.mjx-hidden,
.graph-controller__line-reverse-path-text .graph-controller__link-label-placeholder.mjx-hidden,
.graph-controller__arc-reverse-path-text .graph-controller__link-label-placeholder.mjx-hidden,
.graph-controller__reflexive-path-text .graph-controller__link-label-placeholder.mjx-hidden,
.graph-controller__link-label-mathjax-container
  .graph-controller__link-label-placeholder.mjx-hidden {
  visibility: hidden;
  cursor: pointer;
  pointer-events: none;
}

.graph-controller__node {
  fill: #eb9850;
  stroke: none;
  cursor: pointer;
}

.graph-controller__link-label-mathjax-container {
  overflow: visible;
  cursor: text;
}

.graph-controller__node-label-container {
  overflow: visible;
  cursor: pointer;
}

.graph-controller__node-label {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: all;
  font-family: sans-serif;
  font-size: 1rem;
  cursor: pointer;
}
.graph-controller__node-label.controls-node-size {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  text-align: center;
  width: auto;
  height: auto;
  padding: 4px 8px;
  white-space: nowrap;
}
.graph-controller__node-label.hidden {
  visibility: hidden;
  cursor: pointer;
  pointer-events: none;
}
.graph-controller__node-label.not-editable {
  cursor: pointer;
}

.graph-controller__node-label-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: all;
  font-family: sans-serif;
  font-style: oblique;
  font-size: 0.85rem;
  color: dimgrey;
  cursor: pointer;
}
.graph-controller__node-label-placeholder.controls-node-size {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  text-align: center;
  width: auto;
  height: auto;
  padding: 4px 8px;
  white-space: nowrap;
}
.graph-controller__node-label-placeholder.hidden {
  visibility: hidden;
  cursor: pointer;
  pointer-events: none;
}
.graph-controller__node-label-placeholder.not-editable {
  cursor: pointer;
}

.graph-controller__label-input {
  background-color: rgba(255, 255, 255, 0.9);
}

.graph-controller__info-text-background {
  color: lightgrey;
  font-family: sans-serif;
  width: 50%;
  height: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

[class^='graph-controller']:not(input):not(.selectable) {
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}
</style>
