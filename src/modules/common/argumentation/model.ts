import { LINK_BLACK, NODE_BLUE } from '../colors'

export const ARGUMENT_RADIUS_IN_PX = 28
export const ARGUMENT_COLOR = NODE_BLUE
export const ATTACK_COLOR = LINK_BLACK

export type ArgumentId = number

export interface ArgumentData {
  name: string
  x: number
  y: number
}
