import '@/styles/globals.css'
import { ApolloProvider } from '@apollo/client'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { mainGqlClient } from './../helpers/gql.setup'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={mainGqlClient}>
      <Component {...pageProps} />
      <Head>
        <title>
          Demo Chat App - Built on top of NestJS & GraphQL, and NextJS
        </title>
      </Head>
    </ApolloProvider>
  )
}
