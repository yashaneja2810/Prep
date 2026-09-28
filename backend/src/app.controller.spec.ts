import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './services/supabase.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockSupabaseService = {
      getClient: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Supabase client initialized"', () => {
      expect(appController.getHello()).toBe('Supabase client initialized');
    });
  });
});
