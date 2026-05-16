import React, { createContext, useState, useEffect, ReactNode, Children, useLayoutEffect } from 'react'
import axios from 'axios';
import { privateApi } from './Interceptor';
import { setTokenStore } from '../Hooks/authStore';

// typage
type authType = {
    user: object;
    accessToken: string | null;
    isLogged: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => void;
    logout: () => void;
    fetchUserProfile: () => void;
}



const authentificationContext = createContext<authType>(null)


export const useAuthentification = () => {
    const context = React.useContext(authentificationContext);
    return context;
}


// on check l'utilisateur
export const AuthentProvider = ({ children }) => {
    // ici on met l'access token qui va être enregistré en state
    const [accessToken, setAccessToken] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    useLayoutEffect(() => {
        setIsLoading(true);
        const init = async () => {
            let sessionOk = await refreshSession();
            if (sessionOk) {

                await fetchUserProfile();
            }
            setIsLoading(false);
        };

        init();
    }, []);
    const refreshSession = async () => {

        try {

            const response = await privateApi.post('/user/refresh-token')

            if (response.data.status === 'Success') {

                const token = response.data.token


                applyToken(token)
                setIsLogged(true)
                return true;


            } else {


                applyToken(null)
                setIsLogged(false)
                return false;

            }

        } catch (err) {

            const status = err.response?.status
            const msg = err.response?.data?.message

            console.error(status, msg)

            applyToken(null)
            setIsLogged(false)

        }
    }
    async function fetchUserProfile() {
        try {

            const res = await privateApi.get('/user/me')

            if (res.data.status === 'Success') {

                console.log(`${res.status} : ${res.data.message}`)

                setUser(res.data.user)

            }

        } catch (err) {

            console.error(
                `${err.response?.status} : ${err.response?.data?.message}`
            )

        } finally {

            setIsLoading(false)
        }
    }

    function logout() {

        privateApi.post(
            "/user/logout",
            {},
            { withCredentials: true }
        )
            .then((response) => {
                if (response.data.status !== 'Success') {

                    setIsLoading(false);
                    return `Erreur : ${response}`;
                } else {


                    applyToken(null)
                    setIsLogged(false);
                    setIsLoading(false);

                }
            })

    }

    function login(email: string, password: string) {
        setIsLoading(true);
        privateApi.post(`/user/login`,
            {
                email,
                password
            })
            .then((response) => {
                if (response.data.status !== 'Success') {
                    let res = response.data.status;
                    setIsLoading(false);

                    console.log(`Erreur : ${res}`);

                    applyToken(null)

                } else {
                    let acc = response.data.accessToken;

                    applyToken(acc)
                    setIsLogged(true);
                    setIsLoading(false);

                }
            })
    }
    // apply token permet avant d'attendre que le axios récupère avec setAccessToken la validation-> il va chercher un header default
    const applyToken = (token) => {
        if (!token) {
            setAccessToken(null);
            setTokenStore(null);
            delete privateApi.defaults.headers.common.Authorization;

            return "non trouvé";
        }

        setAccessToken(token);
        setTokenStore(token);

        privateApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    };
    return (
        <authentificationContext.Provider
            value={{
                user,
                fetchUserProfile,
                accessToken,
                isLogged,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </authentificationContext.Provider>
    );


}