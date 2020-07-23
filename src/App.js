import React from 'react';
import './App.css';

import {ApolloProvider} from "@apollo/react-hooks";
import {HttpLink} from "apollo-link-http";
import ApolloClient from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";

import Homepage from "./Homepage";

function App() {
    const headers = {
        'x-hasura-admin-secret': process.env.REACT_APP_APOLLO_ADMIN_KEY
    };
    const httpLink = new HttpLink({
        uri: process.env.REACT_APP_APOLLO_URL,
        headers
    });
    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache()
    });
    return (
        <div className="App">
            <h1>Cassapp</h1>
            <img width={100} src='android-chrome-192x192.png' alt='Cassapp logo'/>
            <ApolloProvider client={client}>
                <Homepage />
            </ApolloProvider>
        </div>
    );
}

export default App;
