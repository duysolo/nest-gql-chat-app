import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
  Subscription,
} from '@nestjs/graphql'
import { Conversation, Message } from './chat.model'
import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { PubsubService } from './pubsub.service'

const inMemoryConversations: Record<string, Conversation> = {}

const inMemoryMessages: Record<string, Message[]> = {}

@Injectable()
export class ChatHandler implements OnApplicationBootstrap {
  public constructor(private readonly _pubSubService: PubsubService) {}

  public onApplicationBootstrap() {
    const userNames = [
      'Emily',
      'Jacob',
      'Sophia',
      'Liam',
      'Olivia',
      'David',
      'Zhang',
    ]

    userNames.forEach((item) => {
      const id = getNewConversationId()

      inMemoryConversations[id] = {
        id,
        name: item,
        createdAt: new Date(),
      }

      inMemoryMessages[id] = []
    })
  }

  @Query(() => [Conversation])
  public async conversationsList(): Promise<Conversation[]> {
    console.log(`calling conversationsList`)

    return Object.values(inMemoryConversations)
  }

  @Query(() => Conversation)
  public async conversationById(@Args('id', { type: () => ID }) id: string) {
    console.log(`calling conversationById`, { id })

    return inMemoryConversations[id]
  }

  @Mutation(() => Conversation)
  public async conversationCreate(
    @Args('senderId', { type: () => ID }) senderId: string,
    @Args('name') name: string,
    @Args('message') message: string
  ) {
    console.log(`calling conversationCreate`, { name, message, senderId })

    const conversationId = getNewConversationId()

    const newConversation = new Conversation({
      name,
      id: conversationId,
    })

    inMemoryMessages[newConversation.id] = [
      new Message({
        id: getNewMessageId(),
        senderId,
        conversationId: newConversation.id,
        content: message,
      }),
    ]

    inMemoryConversations[newConversation.id] = newConversation

    return newConversation
  }

  @Mutation(() => Message)
  public async messageCreate(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('senderId', { type: () => ID }) senderId: string,
    @Args('content') content: string
  ) {
    console.log(`calling messageCreate`, { conversationId, content, senderId })

    if (!inMemoryConversations[conversationId]) {
      throw new BadRequestException()
    }

    const newMessage = new Message({
      id: getNewMessageId(),
      conversationId,
      senderId,
      content,
    })

    inMemoryMessages[conversationId].push(newMessage)

    void this._pubSubService.publish('NEW_MESSAGE_SENT', newMessage)

    return newMessage
  }

  @Subscription(() => Message, {
    filter(
      this: ChatHandler,
      __: Message,
      variables: { conversationId: string }
    ) {
      console.log(`onNewMessageSent`, {
        variables,
        inMemoryConversations: inMemoryConversations[variables.conversationId],
      })
      return !!inMemoryConversations[variables.conversationId]
    },
    resolve(payload: Message) {
      return payload
    },
  })
  public onNewMessageSent(
    @Args('conversationId', { type: () => ID }) __: string
  ) {
    return this._pubSubService.asyncIterator('NEW_MESSAGE_SENT')
  }
}

@Resolver(() => Conversation)
export class ConversationResolver {
  @ResolveField(() => [Message])
  public async messages(@Parent() conversation: Conversation) {
    return inMemoryMessages[conversation.id] || []
  }

  @ResolveField(() => Message, { nullable: true })
  public async lastMessage(@Parent() conversation: Conversation) {
    const items = inMemoryMessages[conversation.id]

    if (!items) {
      return null
    }

    return items[items.length - 1]
  }
}

function getNewConversationId() {
  return `conversation_${Object.values(inMemoryConversations).length + 1}`
}

function getNewMessageId() {
  return `message_${Object.values(inMemoryMessages).length + 1}`
}
