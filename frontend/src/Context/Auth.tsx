import React, { createContext, useState, useEffect, ReactNode, Children, useLayoutEffect } from 'react'
import axios from 'axios';
import { privateApi } from './Interceptor';
import { setTokenStore } from '../Hooks/authStore';

// typage
type authType = {
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
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
useEffect(() => {

    const refreshSession = async () => {

        try {

            const response = await privateApi.post('/refresh-token')

            if (response.data.status === 'Success') {

                const token = response.data.accessToken

                setAccessToken(token)
                setTokenStore(token)
                setIsLogged(true)

            } else {

                setAccessToken(null)
                setTokenStore(null)
                setIsLogged(false)

            }

        } catch (err) {

            const status = err.response?.status
            const msg = err.response?.data?.message

            console.error(status, msg)

            setAccessToken(null)
            setTokenStore(null)
            setIsLogged(false)

        }
    }

    refreshSession()

}, [])

    function fetchUserProfile() {
        privateApi.get('/me').then((res) => {
            if (!res || res.data.status != 'success') {


            } else {

             setUser(res.data.user)
            }
        })
    }

    function logout() {

        privateApi.post(
            "/logout",
            {},
            { withCredentials: true }
        )
            .then((response) => {
                if (response.data.status !== 'Success') {

                    setIsLoading(false);
                    return `Erreur : ${response}`;
                } else {

                    setAccessToken(null);
                    setTokenStore(null);
                    setIsLogged(false);
                    setIsLoading(false);

                }
            })

    }

    function login(email: string, password: string) {
        setIsLoading(true);
        privateApi.post(`/login`,
            {
                email,
                password
            })
            .then((response) => {
                if (response.data.status !== 'Success') {
                    let res = response.data.status;
                    setIsLoading(false);

                    console.log(`Erreur : ${res}`) ;


                } else {
                    let acc = response.data.accessToken;

                    setAccessToken(acc);
                    setTokenStore(acc);
                    setIsLogged(true);
                    setIsLoading(false);

                }
            })
    }


    return (
        <authentificationContext.Provider
            value={{
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