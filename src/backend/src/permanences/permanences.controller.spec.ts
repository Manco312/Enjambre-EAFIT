import { Test, TestingModule } from '@nestjs/testing';
import { PermanencesController } from './permanences.controller.js';

describe('PermanencesController', () => {
  let controller: PermanencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermanencesController],
    }).compile();

    controller = module.get<PermanencesController>(PermanencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
