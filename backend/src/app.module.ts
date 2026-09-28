import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration, { validationSchema } from './config/configuration';
import { SupabaseModule } from './core/supabase/supabase.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { OutcomesModule } from './modules/outcomes/outcomes.module';
import { ModulesModule } from './modules/modules/modules.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { TopicsModule } from './modules/topics/topics.module';
import { NotesModule } from './modules/notes/notes.module';
import { PptModule } from './modules/ppt/ppt.module';
import { VideosModule } from './modules/videos/videos.module';
import { NODE_ENV } from './common/helpers/string-const';
import { CpsModule } from './modules/cps/cps.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ApsModule } from './modules/aps/aps.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompletionsModule } from './modules/completions/completions.module';
import { PointsModule } from './modules/points/points.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { CohortsModule } from './modules/cohorts/cohorts.module';
import { CohortSessionsModule } from './modules/cohort-sessions/cohort-sessions.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { LearnersModule } from './modules/learners/learners.module';
import { TrainersModule } from './modules/trainers/trainers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        `.env.${process.env.NODE_ENV || NODE_ENV.DEVELOPMENT}`,
      ],
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    TrainersModule,
    OrganizationsModule,
    TopicsModule,
    CpsModule,
    DocumentsModule,
    ApsModule,
    NotesModule,
    PptModule,
    VideosModule,
    ObjectivesModule,
    OutcomesModule,
    ModulesModule,
    ProgramsModule,
    CompletionsModule,
    PointsModule,
    SubmissionsModule,
    CohortsModule,
    CohortSessionsModule,
    LearnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
