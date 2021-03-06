import Repository from '../../../repository'

import { setHttpToken } from '../../../helpers'
import localforage from 'localforage'
import { isEmpty } from 'lodash'

export const login = ({ dispatch }, { payload, context }) => {
    context.errors = []
    context.message = null
    return Repository.post('/auth/login', payload)
        .then((response) => {
            dispatch('setToken', response.data.token)
        })
        .catch((error) => {
            context.errors = error.response.data.errors || []
            context.message = error.response.data.message
        })
}

export const logout = ({ dispatch }) => {
    return Repository.get('/auth/logout')
        .then(() => {
            dispatch('clearAuth')
        })
        .catch((error) => {
            dispatch('clearAuth')
            console.log(error)
        })
}

export const fetchUser = async ({ commit }) => {
    try {
        const response = await Repository.get('/user/me')
        commit('setAuthenticated', true)
        commit('setUserData', response.data)

        if (response.data.roles) {
            var permissions = []

            response.data.roles.forEach((role) => {
                permissions = [
                    ...role.permissions.map((permission) => {
                        return permission.title
                    }),
                ]
            })
            commit(
                'setPermissions',
                permissions.filter((value, index, arr) => arr.indexOf(value) === index)
            )
        }
    } catch (error) {
        return
    }
}

export const setToken = ({ commit, dispatch }, token) => {
    if (isEmpty(token)) {
        return dispatch('checkTokenExists')
            .then((token) => {
                commit('setToken', token)
                setHttpToken(token)
            })
            .catch(() => {})
    } else {
        commit('setToken', token)
        setHttpToken(token)
    }
}

export const checkTokenExists = ({ commit, dispatch }, token) => {
    return localforage.getItem('auth_token').then((token) => {
        if (isEmpty(token)) {
            return Promise.reject('AUTH_TOKEN_NULL')
        }

        return Promise.resolve(token)
    })
}

export const clearAuth = ({ commit }) => {
    commit('setAuthenticated', false)
    commit('setToken', null)
    commit('setUserData', null)
    setHttpToken(null)
}

export const refreshToken = async ({ dispatch }) => {
    try {
        const response = await Repository.get('/auth/refresh-token')
        dispatch('setToken', response.data.token)
        return response.data.token
    } catch (err) {
        return
    }
}

export const hydrate = async ({ dispatch }) => {
    try {
        const token = await localforage.getItem('auth_token')
        dispatch('setToken', token)
        return token
    } catch (err) {
        return
    }
}

export const forgot = ({ dispatch }, { payload, context }) => {
    context.errors = []
    context.errorMessage = null
    context.message = null

    return Repository.post('/auth/forgot', payload)
        .then((response) => {
            context.message = response.data.message
        })
        .catch((error) => {
            context.errors = error.response.data.errors || []
            context.errorMessage = error.response.data.message
        })
}

export const checkToken = async ({ commit }, payload) => {
    try {
        const response = await Repository.get(`/auth/check-token/${payload}`)
        return response.data
    } catch (error) {
        console.log(error)
        return
    }
}

export const reset = ({ dispatch }, { payload, context }) => {
    context.errors = []
    context.errorMessage = null
    context.message = null

    return Repository.put('/auth/password-reset', payload)
        .then((response) => {
            context.message = response.data.message
        })
        .catch((error) => {
            context.errors = error.response.data.errors || []
            context.errorMessage = error.response.data.message
        })
}
