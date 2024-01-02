import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { $Enums } from '@prisma/client'
import { Groups } from '../auth/decorators/groups.decorator'
import { imageValidators } from '../common/files/file-validators'
import { Purchase } from '../purchase/entities/purchase.entity'
import { PurchaseEventService } from '../purchase/event/event.service'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { Event } from './entities/event.entity'
import { EventService } from './event.service'

@ApiBearerAuth()
@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly purchaseEventService: PurchaseEventService,
  ) {}

  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'event', maxCount: 10 },
      { name: 'ticket', maxCount: 64 },
    ]),
  )
  async create(
    @User() user: UserEntity,
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles(new ParseFilePipe({ validators: imageValidators }))
    files: {
      event?: Express.Multer.File[]
      ticket?: Express.Multer.File[]
    },
  ) {
    return new Event(
      await this.eventService.create(user.id, createEventDto, files),
    )
  }

  @ApiOperation({ summary: '[Admin] Approve draft event' })
  @ApiTags('admin')
  @Groups(Group.ADMIN)
  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return new Event(await this.eventService.approve(id))
  }

  @ApiOperation({ summary: '[Admin] Reject draft event' })
  @ApiTags('admin')
  @Groups(Group.ADMIN)
  @Put(':id/reject')
  async reject(@Param('id') id: string) {
    return new Event(await this.eventService.reject(id))
  }

  @ApiOperation({ summary: 'Retry request draft event approval' })
  @Put(':id/retry')
  async retryPublish(@Param('id') id: string) {
    return new Event(await this.eventService.retry(id))
  }

  @Get()
  async findAllPublished(
    @Query('page') page: number,
    @Query('byStartDate') byStartDate: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return (
      await this.eventService.findPublished(
        byStartDate ? Boolean(byStartDate) : false,
        from,
        to,
        page,
      )
    ).map((e) => new Event(e))
  }

  @Get('my')
  async myEvents(
    @User() user: UserEntity,
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return (await this.eventService.myEvents(user, status as any, page)).map(
      (e) => new Event(e),
    )
  }

  @Get('my/:id')
  async myEventDetail(
    @User() user: UserEntity,
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return new Event(await this.eventService.findOne(id, status as any, user))
  }

  @Get(':id')
  async findOnePublished(@Param('id') id: string) {
    return new Event(await this.eventService.findOne(id))
  }

  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('event', 10))
  async update(
    @User() user: UserEntity,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles(new ParseFilePipe({ validators: imageValidators }))
    event?: Express.Multer.File[],
  ) {
    return new Event(
      await this.eventService.update(user, id, updateEventDto, event),
    )
  }

  @Delete(':id')
  async softDelete(@User() user: UserEntity, @Param('id') id: string) {
    return new Event(await this.eventService.softDelete(user, id))
  }

  @Get(':id/purchase')
  async purchasesByEvent(
    @Param('id') id: string,
    @Query(
      'status',
      new ParseEnumPipe($Enums.PurchaseStatus, { optional: true }),
    )
    status?: $Enums.PurchaseStatus,
    @Query(
      'refundStatus',
      new ParseEnumPipe($Enums.PurchaseRefundStatus, { optional: true }),
    )
    refundStatus?: $Enums.PurchaseRefundStatus,
    @Query('used', new ParseBoolPipe({ optional: true }))
    used?: boolean,
  ) {
    return (
      await this.purchaseEventService.purchasesByEvent(
        id,
        status,
        refundStatus,
        used,
      )
    ).map((e) => new Purchase(e))
  }
}
