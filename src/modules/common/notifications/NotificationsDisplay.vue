<!--
  Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.

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
<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

import {
  type Notification,
  NotificationType,
} from '@/modules/common/notifications/useNotifications'
const { notifications } = defineProps<{
  notifications: Notification[]
}>()
</script>

<template>
  <div class="toast toast-top toast-end">
    <div
      v-for="notification of notifications"
      :key="notification.key"
      class="alert max-w-92"
      :class="{
        'alert-success': notification.type === NotificationType.SUCCESS,
        'alert-error': notification.type === NotificationType.ERROR,
      }"
    >
      <div>
        <h3 class="font-bold">{{ notification.title }}</h3>
        <div v-if="notification.description" class="text-xs whitespace-pre-wrap">
          {{ notification.description }}
        </div>
      </div>
      <button
        v-if="notification.type === NotificationType.ERROR"
        class="btn btn-square btn-xs ml-2 btn-ghost"
        @click="notification.remove()"
        title="Dismiss"
      >
        <XMarkIcon class="size-4"></XMarkIcon>
      </button>
    </div>
  </div>
</template>
