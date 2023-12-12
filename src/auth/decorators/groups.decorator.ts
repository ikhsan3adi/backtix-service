import { SetMetadata } from '@nestjs/common'
import { Group } from '../../user/enums/group.enum'

export const GROUPS_KEY = 'groups'
export const Groups = (...groups: Group[]) => SetMetadata(GROUPS_KEY, groups)
