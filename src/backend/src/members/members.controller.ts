import {
  Controller,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';

import { Member } from './entities/member.entity.js';
import { MembersService } from './members.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
  ): Promise<Member[]> {
    return groupId === undefined
      ? await this.membersService.findAll()
      : await this.membersService.findByGroup(groupId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Member> {
    return await this.membersService.findById(id);
  }

  @Post()
  async create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return await this.membersService.create(createMemberDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return await this.membersService.update(id, updateMemberDto);
  }

  // Con `groupId` solo se saca al integrante de ese grupo (y se borra del todo
  // si no pertenece a ningún otro). Sin `groupId` se borra de todos los grupos.
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId?: number,
  ): Promise<DeleteResult> {
    return await this.membersService.remove(id, groupId);
  }
}
