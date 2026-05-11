import React, { createContext, useState, useEffect, ReactNode, Children } from 'react'
import axios from 'axios';


// typage
type authType = {
        accessToken: string;
        isLogged: boolean;
        isLoading: boolean;
        login: (email: string, password: string) => void;
}



const authentificationContext = createContext<authType>(null)


export const useAuthentification = () => {
    const context = React.useContext(authentificationContext);
    return context;
}


// on check l'utilisateur
const AuthentProvider = ({ children }) => {
    // ici on met l'access token qui va être enregistré en state
    const [accessToken, setAccessToken] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = `${import.meta.env.VITE_SERVER_URL}`;

    function login(email: string, password: string) {
        setIsLoading(true);
        axios.post(`${API_URL}/api/users/login`,
            {
                email,
                password
            })
            .then((response) => {
                if (response.data.status !== 'success') {
                    let res = response.data.status;
                    setIsLoading(false);

                    return `Erreur : ${res}`;

                } else {
                    let acc = response.data.accessToken;
                    setAccessToken(acc);
                    setIsLogged(true);
                    setIsLoading(false);

                }
            })
    }


    return (
    <authentificationContext.Provider
      value={{
        accessToken,
        isLogged,
        isLoading,
        login,
      }}
    >
      {children}
    </authentificationContext.Provider>
  );


}