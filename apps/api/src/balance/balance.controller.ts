import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Groups } from '../auth/decorators/groups.decorator'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { BalanceService } from './balance.service'
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto'
import { WithdrawRequestEntity } from './entities/withdraw-request.entity'

@ApiTags('balance')
@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('balance/withdraw/my')
  async getUserBalanceWithAdminFee(@User() user: UserEntity) {
    return await this.balanceService.getUserBalanceWithAdminFee(user)
  }

  @Get('withdraw/my')
  async myWithdrawals(
    @User() user: UserEntity,
    @Query('status') status: string,
    @Query('page') page: number,
  ) {
    return (await this.balanceService.myWithdrawals(page, user, status)).map(
      (e) => new WithdrawRequestEntity(e),
    )
  }

  @Post('withdraw')
  async requestWithdrawal(
    @User() user: UserEntity,
    @Body() withdrawRequestDto: CreateWithdrawRequestDto,
  ) {
    return new WithdrawRequestEntity(
      await this.balanceService.requestWithdrawal(user, withdrawRequestDto),
    )
  }

  @Groups(Group.ADMIN)
  @Get('withdraw')
  async withdrawRequests(@Query('status') status: string) {
    return (await this.balanceService.withdrawRequests(status)).map(
      (e) => new WithdrawRequestEntity(e),
    )
  }
}
