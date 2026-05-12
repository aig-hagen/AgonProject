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
