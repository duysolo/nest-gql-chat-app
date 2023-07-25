import { useEffect, useState } from 'react'
import {
  getConversationMessagesAsync,
  getConversationsList,
  IConversationWithoutMessages,
  IMessage,
  Nullable,
  sendNewMessageAsync,
  subscribeToConversation,
} from './../helpers/gql.request'

const demoUserId = 'Qo952C9SB2RtXc0Qtrx'

export default function Home() {
  return (
    <div className="shadow-lg rounded-lg flex-1 relative flex flex-col">
      <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
        <div className="font-bold text-2xl">Demo Chat App</div>
        <div className="w-1/2 text-center text-xl font-semibold">
          Built on top of NestJS & GraphQL, and NextJS
        </div>
        <div className="h-12 font-semibold flex items-center justify-center">
          <AvatarItem className="w-12 rounded-full mr-2" />
          <span className="whitespace-nowrap">Justin Phan</span>
        </div>
      </div>
      <ConversationsBox />
    </div>
  )
}

const ConversationsBox = () => {
  const { conversations, loading } = getConversationsList()

  const [current, setCurrent] =
    useState<Nullable<IConversationWithoutMessages>>(null)

  useEffect(() => {
    if (!loading) {
      setCurrent(conversations[0])
    }
  }, [conversations])

  return (
    <div className="flex-1 flex flex-row justify-between bg-white">
      <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
        <ConversationsList
          conversations={conversations || []}
          currentConversationId={current?.id}
          onSelectItem={(item) => {
            setCurrent(item)
          }}
        />
      </div>
      {current && (
        <ConversationDetailsBox
          conversation={current}
          onNewMessageSent={(msg) => {
            setCurrent({
              ...current,
              lastMessage: msg,
            })
          }}
        />
      )}
    </div>
  )
}

const ConversationsList = (props: {
  conversations: IConversationWithoutMessages[]
  currentConversationId: Nullable<string>
  onSelectItem: (item: IConversationWithoutMessages) => void
}) => {
  return (
    <>
      {props.conversations.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            props.onSelectItem(item)
          }}
          className={`flex flex-row cursor-pointer ease-in-out duration-300 hover:bg-gray-200 py-4 px-2 justify-center items-center border-b-2 border-l-4 ${
            props.currentConversationId === item.id
              ? 'border-blue-400 bg-gray-100'
              : ''
          }`}
        >
          <div className="w-1/4">
            <AvatarItem
              className="object-cover h-12 w-12 rounded-full"
              isMySelf={false}
            />
          </div>
          <div className="d-flex w-full overflow-hidden">
            <div className="text-lg font-semibold">{item.name}</div>
          </div>
        </div>
      ))}
    </>
  )
}

const ConversationDetailsBox = (props: {
  conversation: IConversationWithoutMessages
  onNewMessageSent: (newMessage: IMessage) => void
}) => {
  const [messages, setMessages] = useState<IMessage[]>([])

  const { message: newMessage } = subscribeToConversation(props.conversation.id)

  useEffect(() => {
    if (newMessage) {
      setMessages([...messages, newMessage])
    }
  }, [newMessage])

  useEffect(() => {
    fetchMessages()
  }, [props.conversation.id])

  function fetchMessages() {
    getConversationMessagesAsync(props.conversation.id).then((res) => {
      setMessages(res)
    })
  }

  return (
    <div className="w-full px-5 flex flex-col justify-between">
      <div className="pt-3 text text-xs">
        <span>
          <span>Chat ID: </span>
          <span className="text-red-500">{props.conversation.id}</span>
        </span>
        <br />
        <span>
          <span>Your user ID: </span>
          <span className="text-red-500">{demoUserId}</span>
        </span>
      </div>
      <div className="flex flex-col mt-5">
        {!!messages &&
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              isMySelf={`${msg.senderId}` === demoUserId}
              message={msg}
            />
          ))}
      </div>
      <div className="mt-auto pb-5 w-full">
        <form
          method="POST"
          onSubmit={(e) => {
            e.preventDefault()

            const formData = new FormData(e.currentTarget)

            const content = formData.get('content')?.toString()

            const input = document.getElementById(
              'input_new_message'
            ) as HTMLInputElement

            if (content) {
              sendNewMessageAsync(
                props.conversation.id,
                demoUserId,
                content
              ).then((res) => {
                // props.onNewMessageSent(res)
              })

              input.value = ''
            }
          }}
          className="flex-1 flex flex-row justify-between bg-white"
        >
          <input
            required
            name="content"
            id="input_new_message"
            className="w-full bg-gray-300 py-5 px-3 rounded-xl"
            type="text"
            placeholder="type your message here..."
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  )
}

const MessageItem = ({
  isMySelf,
  message,
}: {
  isMySelf: boolean
  message: IMessage
}) => {
  if (!message) return

  return (
    <div className={`flex ${isMySelf ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`${
          isMySelf
            ? 'mr-2 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl'
            : 'order-1 ml-2 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl'
        } text-white py-3 px-4`}
      >
        {message.content}
      </div>
      <AvatarItem
        className="object-cover h-8 w-8 rounded-full"
        isMySelf={isMySelf}
      />
    </div>
  )
}

const AvatarItem = ({
  className,
  isMySelf = true,
}: {
  className: string
  isMySelf?: boolean
}) => {
  return (
    <img
      src={
        isMySelf
          ? 'https://i.pinimg.com/564x/28/64/a9/2864a9a9976a30753c3af93f4597d513.jpg'
          : 'https://i.pinimg.com/564x/a1/06/d9/a106d9a78d1190cb521d39ec938f4033.jpg'
      }
      className={className}
      alt=""
    />
  )
}
