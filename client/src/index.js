import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: 'http://localhost:8090/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('access-token');
    return {
        headers: {
            ...headers,
            "access-token": token,
        }
    }
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
  document.getElementById('root')
);

