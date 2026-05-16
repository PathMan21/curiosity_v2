let accessToken = null

export const setTokenStore = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

