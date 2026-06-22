/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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

  function addErrorNotification(title: string, description?: string, timeout = 5_000) {
    const notification = addNotification(title, NotificationType.ERROR, description)

    setTimeout(() => {
      notification.remove()
    }, timeout)
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
