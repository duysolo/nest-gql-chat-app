import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Enhancer, GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'
import { RootQuery } from './root.query'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => {
        return {
          debug: config.get('GRAPHQL_DEBUG') === 'true',
          playground: config.get('GRAPHQL_PLAYGROUND') === 'true',
          autoSchemaFile: join(process.cwd(), 'src/generated/schema.gql'),
          sortSchema: true,
          fieldResolverEnhancers: ['interceptors'] as Enhancer[],
          autoTransformHttpErrors: true,
          context: (context) => context,
          subscriptions: {
            'graphql-ws': true,
          },
        }
      },
      inject: [ConfigService],
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, RootQuery],
})
export class AppModule {}
