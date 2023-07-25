import { Module } from '@nestjs/common'
import { ChatHandler, ConversationResolver } from './chat.handler'
import { PubsubService } from './pubsub.service'
import { PubSub } from 'graphql-subscriptions'

export const PUB_SUB: symbol = Symbol('PUB_SUB')

@Module({
  imports: [],
  providers: [
    ChatHandler,
    ConversationResolver,
    {
      provide: PUB_SUB,
      useFactory: () => {
        return new PubSub()
      },
      inject: [],
    },
    {
      provide: PubsubService,
      useFactory: (pubsub) => pubsub,
      inject: [PUB_SUB],
    },
  ],
})
export class ChatModule {}
