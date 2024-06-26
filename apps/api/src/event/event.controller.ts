import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
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
import { Groups } from '../auth/decorators/groups.decorator'
import { imageValidators } from '../common/files/file-validators'
import { PurchaseEntity } from '../purchase/entities/purchase.entity'
import { PurchaseEventService } from '../purchase/event/event.service'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { EventEntity } from './entities/event.entity'
import { EventService } from './event.service'

@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
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
    return new EventEntity(
      await this.eventService.create(user.id, createEventDto, files),
    )
  }

  @ApiOperation({ summary: '[Admin] Approve draft event' })
  @ApiTags('admin')
  @Groups(Group.ADMIN)
  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return new EventEntity(await this.eventService.approve(id))
  }

  @ApiOperation({ summary: '[Admin] Reject draft event' })
  @ApiTags('admin')
  @Groups(Group.ADMIN)
  @Put(':id/reject')
  async reject(@Param('id') id: string) {
    return new EventEntity(await this.eventService.reject(id))
  }

  @ApiOperation({ summary: 'Retry request draft event approval' })
  @Put(':id/retry')
  async retryPublish(@Param('id') id: string) {
    return new EventEntity(await this.eventService.retry(id))
  }

  @Get()
  async findAllPublished(
    @Query('page') page: number,
    @Query('byStartDate') byStartDate: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('search') search: string,
    @Query('location') location: string,
    @Query('categories', new ParseArrayPipe({ optional: true }))
    categories: string[],
    @Query('endedOnly', new ParseBoolPipe({ optional: true }))
    endedOnly?: boolean,
    @Query('ongoingOnly', new ParseBoolPipe({ optional: true }))
    ongoingOnly?: boolean,
  ) {
    return (
      await this.eventService.findPublished(
        page,
        byStartDate ? Boolean(byStartDate) : false,
        from,
        to,
        search ? search : undefined,
        location,
        categories,
        endedOnly,
        ongoingOnly,
      )
    ).map((e) => new EventEntity(e))
  }

  @ApiOperation({
    summary: 'Find events near to the user location',
    description: 'distance in KM',
  })
  @Get('nearby')
  async findNearestPublishedEvents(
    @User() user: UserEntity,
    @Query('count') count: number,
    @Query('distance') distance: number,
  ) {
    return (
      await this.eventService.findNearestPublishedEvents(user, count, distance)
    ).map((e) => new EventEntity(e))
  }

  @Get('my')
  async myEvents(
    @User() user: UserEntity,
    @Query('status') status?: string,
    @Query('byStartDate') byStartDate?: string,
    @Query('page') page?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('categories', new ParseArrayPipe({ optional: true }))
    categories?: string[],
    @Query('endedOnly', new ParseBoolPipe({ optional: true }))
    endedOnly?: boolean,
    @Query('ongoingOnly', new ParseBoolPipe({ optional: true }))
    ongoingOnly?: boolean,
  ) {
    return (
      await this.eventService.myEvents(
        user,
        status as any,
        page,
        byStartDate ? Boolean(byStartDate) : false,
        from,
        to,
        search ? search : undefined,
        location,
        categories,
        endedOnly,
        ongoingOnly,
      )
    ).map((e) => new EventEntity(e))
  }

  @Get('my/:id')
  async myEventDetail(@User() user: UserEntity, @Param('id') id: string) {
    return new EventEntity(await this.eventService.findOne(id, user, false))
  }

  @Get(':id')
  async findOnePublished(@Param('id') id: string) {
    return new EventEntity(await this.eventService.findOne(id))
  }

  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('event', 10))
  async update(
    @User() user: UserEntity,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    event?: Express.Multer.File[],
  ) {
    return new EventEntity(
      await this.eventService.update(user, id, updateEventDto, event),
    )
  }

  @Delete(':id')
  async softDelete(@User() user: UserEntity, @Param('id') id: string) {
    return new EventEntity(await this.eventService.softDelete(user, id))
  }

  @Get(':id/purchases')
  async purchasesByEvent(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('status')
    status?: string,
    @Query('refundStatus')
    refundStatus?: string,
    @Query('used', new ParseBoolPipe({ optional: true }))
    used?: boolean,
  ) {
    return (
      await this.purchaseEventService.purchasesByEvent(
        id,
        page,
        status as any,
        refundStatus as any,
        used,
      )
    ).map((e) => new PurchaseEntity(e))
  }
}
