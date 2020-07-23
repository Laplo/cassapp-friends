import React from "react";

import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";

function QueryUsers() {
    const GET_USERS = gql`
        query QueryUsers {
            users {
                user_id
                user_name
            }
        }
    `;
    return useQuery(GET_USERS);
}

function QueryDrinks() {
    const GET_DRINKS = gql`
        query QueryDrinks {
            alcohols {
                alcohol_id
                alcohol_name
            }
            softs {
                soft_id
                soft_name
            }
        }
    `;
    return useQuery(GET_DRINKS);
}

export function Homepage() {

    const {data: dataDrinks, loading: loadingDrinks, error: errorDrinks} = QueryDrinks();
    const {data: dataUsers, loading: loadingUsers, error: errorUsers} = QueryUsers();

    console.log(loadingDrinks, errorDrinks, dataDrinks)
    console.log(loadingUsers, errorUsers, dataUsers);

    return (
        <div>
            Hello cass
        </div>
    );
}

export default Homepage;
