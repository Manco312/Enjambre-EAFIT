import { Test, TestingModule } from '@nestjs/testing';
import { PermanencesService } from './permanences.service.js';

describe('PermanencesService', () => {
  let service: PermanencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermanencesService],
    }).compile();

    service = module.get<PermanencesService>(PermanencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
