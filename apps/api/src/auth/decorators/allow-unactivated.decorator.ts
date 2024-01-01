import { SetMetadata } from '@nestjs/common'

export const ALLOW_UNACTIVATED_KEY = 'ALLOW_UNACTIVATED'
export const AllowUnactivated = () => SetMetadata(ALLOW_UNACTIVATED_KEY, true)
