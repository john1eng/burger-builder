import axios from 'axios';
import * as actionTypes from './actionTypes';

const authSuccess = (token, userId) => {
    return{
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: userId
    }
}

const authFail = (error) => {
    return{
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate')
    localStorage.removeItem('userId')
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

const checkAuthTimeout = (experationTime) => {
    return dispatch => {
        setTimeout(()=>{
            dispatch(logout())
        },experationTime * 1000)
    }
}

export const auth = (email, password, mode) => {
    return dispatch => {
        dispatch(authStart())
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        }
        const API_KEY = process.env.REACT_APP_API_KEY 
        let url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`
        if(!mode)
            url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`
        
            axios.post(url, authData)
            .then(resp => {
                const expirationDate = new Date(new Date().getTime() + resp.data.expiresIn * 1000)
                localStorage.setItem('token', resp.data.idToken)
                localStorage.setItem('expirationDate', expirationDate)
                localStorage.setItem('userId', resp.data.localId )
                dispatch(authSuccess(resp.data.idToken, resp.data.localId))
                dispatch(checkAuthTimeout(resp.data.expiresIn))
            })
            .catch(err => {
                dispatch(authFail(err.response.data.error));
            })

    }
}

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        authRedirectPath: path
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if(!token){
            dispatch(logout());
        }else{
            const expirationDate = new Date(localStorage.getItem('expirationDate'))
            if(expirationDate > new Date()){
                const userId = localStorage.getItem('userId')
                dispatch(authSuccess(token, userId))
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000))
            }else{
                dispatch(logout())
            }

        }
    }
}