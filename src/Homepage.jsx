import React, {useEffect, useState} from "react";

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SendIcon from '@material-ui/icons/Send';

import {gql} from "apollo-boost";
import {useQuery, useMutation} from "@apollo/react-hooks";

import create from 'zustand';
import Snackbar from "@material-ui/core/Snackbar";
import Fab from "@material-ui/core/Fab";

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
            const user = (dataUsers ? dataUsers.users.find(({user_id}) => user_id === value.user_id) : undefined);
            userApi.setState({
                user
            });
            localStorage.setItem('username', user.user_name);
            localStorage.setItem('userid', user.user_id);
        }
    };

    return (
        <Autocomplete
            id="searchUsers"
            loading={loadingUsers}
            options={dataUsers ? dataUsers.users.sort((a, b) => a.user_name.localeCompare(b.user_name)) : [] }
            getOptionLabel={(option) => option.user_name}
            onChange={handleOnChange}
            noOptionsText="Aucun utilisateur correspondant"
            loadingText="Chargement des utilisateurs..."
            renderInput={(params) => <TextField {...params} label="Qui êtes vous ?" variant="outlined" />}
            ListboxProps={{ style: { maxHeight: '10rem' } }}
        />
    );
}

function Logout() {
    const handleOnClick = () => {
        userApi.setState({
            user: undefined
        });
        localStorage.removeItem('username');
        localStorage.removeItem('userid');
    };

    return (
        <Fab
            color="primary"
            aria-label="logout"
            style={{
                position: 'absolute',
                zIndex: 1,
                bottom: '10%',
                left: '10%',
                margin: '0 auto',
            }}
            onClick={handleOnClick}
        >
            <PowerSettingsNewIcon />
        </Fab>
    );
}

function Alcohol() {
    const {data: dataAlcohols, loading: loadingAlcohols} = QueryAlcohols();
    const handleOnChange = (event, value) => {
        if (value) {
            const alcohol = (dataAlcohols ? dataAlcohols.alcohols.find(({alcohol_id}) => alcohol_id === value.alcohol_id) : undefined);
            alcoholApi.setState({
                alcohol
            });
        } else {
            alcoholApi.setState({
                alcohol: undefined
            });
        }
    };
    const [option, setOption] = useState('an');
    alcoholApi.subscribe(({alcohol}) =>
        setOption(alcohol ? 'ann' : 'an')
    );
    useEffect(() => {
        if (option === 'an') {
            setOption('ann');
        }
    }, [option]);

    return (
        <Autocomplete
            key={option}
            id="searchAlcohols"
            style={{
                marginBottom: '1em'
            }}
            loading={loadingAlcohols}
            options={dataAlcohols ? dataAlcohols.alcohols.sort((a, b) => a.alcohol_name.localeCompare(b.alcohol_name)) : [] }
            getOptionLabel={(option) => option.alcohol_name}
            onChange={handleOnChange}
            noOptionsText="Aucun alcool correspondant"
            loadingText="Chargement des alcools..."
            renderInput={(params) => <TextField {...params} label="Choisissez votre alcool" variant="outlined" />}
            ListboxProps={{ style: { maxHeight: '10rem' } }}
        />
    );
}

function Soft() {
    const {data: dataSofts, loading: loadingSofts} = QuerySofts();

    const handleOnChange = (event, value) => {
        if (value) {
            const soft = (dataSofts ? dataSofts.softs.find(({soft_id}) => soft_id === value.soft_id) : undefined);
            softApi.setState({
                soft
            });
        } else {
            softApi.setState({
                soft: undefined
            });
        }
    };
    const [option, setOption] = useState('sn');
    softApi.subscribe(({soft}) =>
        setOption(soft ? 'snn' : 'sn')
    );
    useEffect(() => {
        if (option === 'sn') {
            setOption('snn');
        }
    }, [option]);

    return (
        <Autocomplete
            key={option}
            id="searchSofts"
            style={{
                marginBottom: '1em'
            }}
            loading={loadingSofts}
            options={dataSofts ? dataSofts.softs.sort((a, b) => a.soft_name.localeCompare(b.soft_name)) : [] }
            getOptionLabel={(option) => option.soft_name}
            onChange={handleOnChange}
            noOptionsText="Aucun soft correspondant"
            loadingText="Chargement des softs..."
            renderInput={(params) => <TextField {...params} label="Choisissez votre soft" variant="outlined" />}
            ListboxProps={{ style: { maxHeight: '10rem' } }}
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
    const {user} = useUserStore(state => ({
        user: state.user
    }));
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userid');
    const [addOrder] = MutationOrder();
    const [open, setOpen] = useState(false);

    const handleOnClick = () => {
        addOrder({
            variables: {
                user_id: userId || user.user_id,
                comment,
                soft_id: soft.soft_id,
                alcohol_id: alcohol.alcohol_id
            }
        }).then(() => {
            const body = JSON.stringify({
                username: username || user.user_name,
                alcohol: alcohol.alcohol_name,
                soft: soft.soft_name,
                comment
            });
            fetch('https://sweet-liberating-practice.glitch.me/', {
                method: 'POST',
                body,
                headers: { 'Content-Type': 'application/json' },
            }).then(() => {
                setOpen(true);
                alcoholApi.setState({
                    alcohol: undefined
                });
                softApi.setState({
                    soft: undefined
                });
                commentApi.setState({
                    comment: undefined
                });
            });
        });
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="send"
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    bottom: '10%',
                    right: '10%',
                    margin: '0 auto',
                }}
                onClick={handleOnClick}
                disabled={!soft && !alcohol}
            >
                <SendIcon />
            </Fab>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    const userLs = localStorage.getItem('userid');

    return (
        !userSt && !userLs ?
            <>
                <div style={{
                    margin: 0,
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    width: '95%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <Users/>
                </div>
            </>
            :
            <>
                <Logout />
                <div style={{
                    margin: 0,
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    width: '95%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <Alcohol />
                    <Soft />
                    <Comment />
                </div>
                <SendOrder />
            </>
    );
}

function Comment() {
    const [option, setOption] = useState('cn');
    commentApi.subscribe(({comment}) =>
        setOption(comment ? 'cnn' : 'cn')
    );
    useEffect(() => {
        if (option === 'cn') {
            setOption('cnn');
        }
    }, [option]);

    const handleOnChange = ({target: {value}}) => {
        commentApi.setState({
            comment: value
        });
    };

    return (
        <TextField
            key={option}
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
