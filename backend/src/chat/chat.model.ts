import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Message {
  @Field(() => ID)
  public id!: string

  @Field(() => ID)
  public conversationId!: string

  @Field(() => ID)
  public senderId!: string

  @Field(() => String)
  public content!: string

  @Field(() => GraphQLISODateTime)
  public createdAt!: Date

  public constructor(partial: Omit<Message, 'createdAt'>) {
    Object.assign(this, partial)

    this.createdAt = new Date()
  }
}

@ObjectType()
export class Conversation {
  @Field(() => ID)
  public id!: string

  @Field(() => String)
  public name!: string

  @Field(() => GraphQLISODateTime)
  public createdAt!: Date

  public constructor(partial: Omit<Conversation, 'createdAt'>) {
    Object.assign(this, partial)

    this.createdAt = new Date()
  }
}
