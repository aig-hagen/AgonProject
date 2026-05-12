import { ref } from 'vue'

import { generateUUID } from '@/modules/common/ids'

export enum NotificationType {
  SUCCESS,
  ERROR,
}

export interface Notification {
  key: string
  title: string
  description?: string
  type: NotificationType
  remove(): void
}

export function useNotifications() {
  const notifications = ref<Notification[]>([])

  function addSuccessNotification(title: string, description?: string, timeout = 1_000) {
    const notification = addNotification(title, NotificationType.SUCCESS, description)

    setTimeout(() => {
      notification.remove()
    }, timeout)
  }

  function addErrorNotification(title: string, description?: string) {
    addNotification(title, NotificationType.ERROR, description)
  }

  function addNotification(title: string, type: NotificationType, description?: string) {
    const key = generateUUID()
    const notification = {
      key,
      title,
      description,
      type,
      remove() {
        removeNotification(notification)
      },
    }
    notifications.value.push(notification)
    return notification
  }

  function removeNotification(notificationToRemove: Notification) {
    notifications.value = notifications.value.filter(
      (notification) => notification.key != notificationToRemove.key,
    )
  }

  return {
    notifications,
    addSuccessNotification,
    addErrorNotification,
  }
}
