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
            <ApolloProvider client={client}>
                <Homepage />
            </ApolloProvider>
            <div style={{
                margin: 0,
                position: 'absolute',
                top: '55%',
                left: '50%',
                width: '95%',
                transform: 'translate(-50%, -50%)'
            }}>
                <h1>Cassapp</h1>
                <img width={100} src='android-chrome-192x192.png' alt='Cassapp logo'/>
            </div>
        </div>
    );
}

export default App;
