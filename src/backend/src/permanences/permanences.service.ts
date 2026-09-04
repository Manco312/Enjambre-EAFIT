import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permanence } from './entities/permanence.entity.js';
import { CreatePermanenceDto } from './dto/create-permanence.dto.js';
import { UpdatePermanenceDto } from './dto/update-permanence.dto.js';

@Injectable()
export class PermanencesService {
  constructor(
    @InjectRepository(Permanence)
    private permanencesRepository: Repository<Permanence>,
  ) {}

  async findById(id: number): Promise<Permanence> {
    const permanence = await this.permanencesRepository.findOneBy({ id });

    if (!permanence) {
      throw new NotFoundException(`Permanence with id ${id} not found`);
    }

    return permanence;
  }

  async create(createPermanenceDto: CreatePermanenceDto): Promise<Permanence> {
    const permanence = this.permanencesRepository.create(createPermanenceDto);

    return this.permanencesRepository.save(permanence);
  }

  async update(
    id: number,
    updatePermanenceDto: UpdatePermanenceDto,
  ): Promise<Permanence> {
    const permanence = await this.findById(id);
    Object.assign(permanence, updatePermanenceDto);

    return this.permanencesRepository.save(permanence);
  }

  async remove(id: number): Promise<void> {
    const permanence = await this.findById(id);

    await this.permanencesRepository.remove(permanence);
  }
}
