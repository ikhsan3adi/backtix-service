import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  Put,
  Query,
} from '@nestjs/common'
import { EventService } from './event.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express'
import { imageValidators } from '../common/files/file-validators'
import { Event } from './entities/event.entity'
import { UserEntity } from '../user/entities/user.entity'
import { User } from '../user/decorators/user.decorator'
import { Groups } from '../auth/decorators/groups.decorator'
import { Group } from '../user/enums/group.enum'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
    @Query('byStartDate') byStartDate: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return (
      await this.eventService.findPublished(
        byStartDate ? Boolean(byStartDate) : false,
        from,
        to,
      )
    ).map((e) => new Event(e))
  }

  @Get(':id')
  async findOnePublished(@Param('id') id: string) {
    return new Event(await this.eventService.findOnePublished(id))
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
}
