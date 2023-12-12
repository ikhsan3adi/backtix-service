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

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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

  @Groups(Group.ADMIN)
  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return new Event(await this.eventService.approve(id))
  }

  @Get()
  async findAllPublished() {
    return (await this.eventService.findPublished()).map((e) => new Event(e))
  }

  @Get(':id')
  async findOnePublished(@Param('id') id: string) {
    return new Event(await this.eventService.findOnePublished(id))
  }

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
