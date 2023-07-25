import { useQuery, gql, useMutation, useSubscription } from '@apollo/client'
import { mainGqlClient } from './gql.setup'

export type Nullable<T> = T | null | undefined

export interface IMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: Date
}

export interface IConversation {
  id: string
  name: string
  messages: IMessage[]
  lastMessage?: Nullable<IMessage>
  createdAt: Date
}

export interface IConversationWithoutMessages
  extends Omit<IConversation, 'messages'> {}

export const SEND_NEW_MESSAGE = gql`
  mutation SendNewMessage(
    $conversationId: ID!
    $senderId: ID!
    $content: String!
  ) {
    messageCreate(
      conversationId: $conversationId
      senderId: $senderId
      content: $content
    ) {
      id
      conversationId
      content
      createdAt
      senderId
    }
  }
`

export const GET_CONVERSATION_DETAILS = gql`
  query GetConversationDetails($id: ID!) {
    conversationById(id: $id) {
      id
      name
      createdAt
    }
  }
`

export const GET_CONVERSATION_MESSAGES = gql`
  query GetConversationMessages($conversationId: ID!) {
    conversationById(id: $conversationId) {
      messages {
        id
        content
        createdAt
        senderId
      }
    }
  }
`

export const GET_CONVERSATIONS_LIST = gql`
  query GetConversationsList {
    conversationsList {
      id
      name
      createdAt
      lastMessage {
        id
        senderId
        content
        createdAt
      }
    }
  }
`

const NEW_MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription OnNewMessageSent($conversationId: ID!) {
    onNewMessageSent(conversationId: $conversationId) {
      content
      conversationId
      senderId
      createdAt
      id
    }
  }
`

export const getConversationDetails = (id: string) => {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATION_DETAILS, {
    variables: { id },
    fetchPolicy: 'no-cache',
  })

  return {
    conversation:
      data?.conversationById as Nullable<IConversationWithoutMessages>,
    loading,
    error,
    refetch,
  }
}

export const getConversationMessages = (conversationId: string) => {
  const { data, loading, error, refetch } = useQuery(
    GET_CONVERSATION_MESSAGES,
    {
      variables: { conversationId },
      fetchPolicy: 'no-cache',
    }
  )

  return {
    messages: data?.conversationById?.messages as IMessage[],
    loading,
    error,
    refetch,
  }
}

export const getConversationsList = () => {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATIONS_LIST, {
    fetchPolicy: 'no-cache',
  })

  return {
    conversations: data?.conversationsList as IConversationWithoutMessages[],
    loading,
    error,
    refetch,
  }
}

export const sendNewMessage = (
  conversationId: string,
  senderId: string,
  content: string
) => {
  const [createMessage, { data, loading, error }] = useMutation(
    SEND_NEW_MESSAGE,
    {
      variables: { conversationId, senderId, content },
      fetchPolicy: 'no-cache',
    }
  )

  return {
    createMessage,
    message: data?.messageCreate as IMessage,
    loading,
    error,
  }
}

export const subscribeToConversation = (conversationId: string) => {
  const { data, loading, error } = useSubscription(
    NEW_MESSAGE_SENT_SUBSCRIPTION,
    {
      variables: { conversationId },
      fetchPolicy: 'no-cache',
    }
  )

  return {
    message: data?.onNewMessageSent as IMessage,
    loading,
    error,
  }
}

export const sendNewMessageAsync = (
  conversationId: string,
  senderId: string,
  content: string
) =>
  mainGqlClient
    .mutate({
      mutation: SEND_NEW_MESSAGE,
      variables: {
        conversationId,
        senderId,
        content,
      },
      fetchPolicy: 'no-cache',
    })
    .then(({ data }) => {
      return data?.messageCreate as IMessage
    })

export const getConversationsListAsync = () =>
  mainGqlClient
    .query({
      query: GET_CONVERSATIONS_LIST,
      fetchPolicy: 'no-cache',
    })
    .then(({ data }) => {
      return data?.conversationsList as IConversationWithoutMessages[]
    })

export const getConversationDetailsAsync = (conversationId: string) =>
  mainGqlClient
    .query({
      query: GET_CONVERSATION_DETAILS,
      variables: {
        conversationId,
      },
      fetchPolicy: 'no-cache',
    })
    .then(({ data }) => {
      return data?.conversationById as IMessage[]
    })

export const getConversationMessagesAsync = (conversationId: string) =>
  mainGqlClient
    .query({
      query: GET_CONVERSATION_MESSAGES,
      variables: {
        conversationId,
      },
      fetchPolicy: 'no-cache',
    })
    .then(({ data }) => {
      console.log({ data })
      return data?.conversationById?.messages as IMessage[]
    })
