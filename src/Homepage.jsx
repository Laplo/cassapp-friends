import React, {useState} from "react";

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from "@material-ui/core/Button";

import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SendIcon from '@material-ui/icons/Send';

import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";

import create from 'zustand';
import {useMutation} from "@apollo/client";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";

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

function QueryAlcohols() {
    const GET_ALCOHOLS = gql`
        query QueryAlcohols {
            alcohols {
                alcohol_id
                alcohol_name
            }
        }
    `;
    return useQuery(GET_ALCOHOLS);
}

function QuerySofts() {
    const GET_SOFTS = gql`
        query QuerySofts {
            softs {
                soft_id
                soft_name
            }
        }
    `;
    return useQuery(GET_SOFTS);
}

function MutationOrder() {
    const ADD_ORDER = gql`
        mutation AddOrder($alcohol_id: uuid, $comment: String, $soft_id: uuid, $user_id: uuid!) {
            insert_orders(objects: {alcohol_id: $alcohol_id, comment: $comment, soft_id: $soft_id, user_id: $user_id}) {
                returning {
                    order_id
                }
            }
        }
    `;
    return useMutation(ADD_ORDER);
}

const [useUserStore, userApi] = create(() => ({
    user: undefined
}));
const [useAlcoholStore, alcoholApi] = create(() => ({
    alcohol: undefined
}));
const [useSoftStore, softApi] = create(() => ({
    soft: undefined
}));
const [useCommentStore, commentApi] = create(() => ({
    comment: undefined
}));

function Users() {
    const {data: dataUsers, loading: loadingUsers} = QueryUsers();

    const handleOnChange = (event, value) => {
        if (value) {
            const user = (dataUsers ? dataUsers.users.find(({id}) => id === value.id) : undefined);
            userApi.setState({
                user: user ? user.user_id : undefined
            });
            localStorage.setItem('user', user ? user.user_id : undefined);
        }
    };

    return (
        <Autocomplete
            id="searchUsers"
            loading={loadingUsers}
            options={dataUsers ? dataUsers.users : [] }
            getOptionLabel={(option) => option.user_name}
            onChange={handleOnChange}
            noOptionsText="Aucun utilisateur correspondant"
            loadingText="Chargement des utilisateurs..."
            renderInput={(params) => <TextField {...params} label="Qui êtes vous ?" variant="outlined" />}
        />
    );
}

function Logout() {

    const handleOnClick = () => {
        userApi.setState({
            user: undefined
        });
        localStorage.removeItem('user');
    };

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<PowerSettingsNewIcon />}
            onClick={handleOnClick}
        >
            Déconnexion
        </Button>
    );
}

function Alcohol() {
    const {data: dataAlcohols, loading: loadingAlcohols} = QueryAlcohols();

    const handleOnChange = (event, value) => {
        const alcohol = (dataAlcohols ? dataAlcohols.alcohols.find(({id}) => id === value.id) : undefined);
        alcoholApi.setState({
            alcohol: alcohol ? alcohol.alcohol_id : undefined
        });
    };

    return (
        <Autocomplete
            id="searchAlcohols"
            style={{
                marginBottom: '1em'
            }}
            loading={loadingAlcohols}
            options={dataAlcohols ? dataAlcohols.alcohols : [] }
            getOptionLabel={(option) => option.alcohol_name}
            onChange={handleOnChange}
            noOptionsText="Aucun alcool correspondant"
            loadingText="Chargement des alcools..."
            renderInput={(params) => <TextField {...params} label="Choisissez votre alcool" variant="outlined" />}
        />
    );
}

function Soft() {
    const {data: dataSofts, loading: loadingSofts} = QuerySofts();

    const handleOnChange = (event, value) => {
        const soft = (dataSofts ? dataSofts.softs.find(({id}) => id === value.id) : undefined);
        softApi.setState({
            soft: soft ? soft.soft_id : undefined
        });
    };

    return (
        <Autocomplete
            id="searchSofts"
            style={{
                marginBottom: '1em'
            }}
            loading={loadingSofts}
            options={dataSofts ? dataSofts.softs : [] }
            getOptionLabel={(option) => option.soft_name}
            onChange={handleOnChange}
            noOptionsText="Aucun soft correspondant"
            loadingText="Chargement des softs..."
            renderInput={(params) => <TextField {...params} label="Choisissez votre soft" variant="outlined" />}
        />
    );
}

function SendOrder() {
    const {alcohol} = useAlcoholStore(state => ({
        alcohol: state.alcohol
    }));
    const {soft} = useSoftStore(state => ({
        soft: state.soft
    }));
    const {comment} = useCommentStore(state => ({
        comment: state.comment
    }));
    const userSt = useUserStore(state => ({
        user: state.user
    })).user;
    const userLs = localStorage.getItem('user');
    const [addOrder] = MutationOrder();
    const [open, setOpen] = useState(false);

    const handleOnClick = () => {
        addOrder({
            variables: {
                user_id: userLs || userSt,
                comment,
                soft_id: soft,
                alcohol_id: alcohol
            }
        }).then(() => {
            setOpen(true);
        });
    };

    return (
        <>
            <Button
                style={{
                    marginTop: '1em'
                }}
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleOnClick}
            >
                Passer la commande
            </Button>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={() => setOpen(false)}
                autoHideDuration={3000}
                open={open}
                message="Commande passée avec succès"
            />
        </>
    );
}

function Connection() {

    const {userSt} = useUserStore(state => ({
        user: state.user
    }));
    const userLs = localStorage.getItem('user');

    return (
        !userSt && !userLs ?
            <>
                <h2>D'abord, dites moi qui vous êtes</h2>
                <div style={{
                    margin: 0,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '60%',
                    transform: 'translate(-50%, -50%)'
                }}>
                        <Users/>
                </div>
            </>
            :
            <>
                <h2>Passez maintenant votre commande ou déconnectez vous</h2>
                <Logout />
                <Grid container style={{
                    marginTop: '1em'
                }}>
                    <Grid item xs={2} />
                    <Grid item xs={8}>
                        <Alcohol />
                    </Grid>
                    <Grid item xs={2} />
                    <Grid item xs={2} />
                    <Grid item xs={8}>
                        <Soft />
                    </Grid>
                    <Grid item xs={2} />
                    <Grid item xs={2} />
                    <Grid item xs={8}>
                        <Comment />
                    </Grid>
                    <Grid item xs={2} />
                    <Grid item xs={7} />
                    <Grid item xs={4}>
                        <SendOrder />
                    </Grid>
                    <Grid item xs={2} />
                </Grid>
            </>
    );
}

function Comment() {

    const handleOnChange = ({target: {value}}) => {
        commentApi.setState({
            comment: value
        });
    };

    return (
        <TextField
            id="comment-text"
            label="Commentaire"
            variant="outlined"
            onChange={handleOnChange}
            fullWidth
        />
    );
}

export function Homepage() {
    return (
        <>
            <Connection />
        </>
    );
}

export default Homepage;
