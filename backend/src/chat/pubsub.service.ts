import { Injectable } from '@nestjs/common'
import { PubSubEngine } from 'graphql-subscriptions'

@Injectable()
export abstract class PubsubService extends PubSubEngine {}
