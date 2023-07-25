import { Injectable } from '@nestjs/common'
import { Field, ObjectType, Query } from '@nestjs/graphql'

@ObjectType()
export class DefaultResponse {
  @Field(() => String)
  public message: string
}

@Injectable()
export class RootQuery {
  @Query(() => DefaultResponse)
  public async health(): Promise<DefaultResponse> {
    return {
      message: 'Ok',
    }
  }
}