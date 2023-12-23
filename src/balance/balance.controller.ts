import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Groups } from '../auth/decorators/groups.decorator'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { BalanceService } from './balance.service'
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto'
import { WithdrawRequest } from './entities/withdraw-request.entity'

@ApiTags('balance')
@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('withdraw/my')
  async myWithdrawals(
    @User() user: UserEntity,
    @Query('status') status: string,
  ) {
    return (await this.balanceService.myWithdrawals(user, status)).map(
      (e) => new WithdrawRequest(e),
    )
  }

  @Post('withdraw')
  async requestWithdrawal(
    @User() user: UserEntity,
    @Body() withdrawRequestDto: CreateWithdrawRequestDto,
  ) {
    return new WithdrawRequest(
      await this.balanceService.requestWithdrawal(user, withdrawRequestDto),
    )
  }

  @Groups(Group.ADMIN)
  @Get('withdraws')
  async withdrawRequests(@Query('status') status: string) {
    return (await this.balanceService.withdrawRequests(status)).map(
      (e) => new WithdrawRequest(e),
    )
  }
}
