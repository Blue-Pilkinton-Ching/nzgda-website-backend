import { nextTick } from 'process'
import {
  AdminDashboard,
  GamesList,
  User,
  UserPrivilege,
  UserTypes,
} from '../../types'
import * as admin from 'firebase-admin'
import privilege from './../authenticate'
import { Router } from 'express'

export const dashboard = Router()
dashboard.use(privilege)

dashboard.get('/dashboard', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege
  let body: AdminDashboard | {} = {}
  let statusCode = 500
  if (privilege === 'admin') {
    let users
    let gameslist
    let authRequests
    let partners
    try {
      const func1 = async () => {
        const d = (
          await admin.firestore().doc('gameslist/BrHoO8yuD3JdDFo8F2BC').get()
        ).data() as GamesList
        gameslist = d.data
        partners = d.partners
      }
      const func2 = async () =>
        (authRequests = (
          await admin
            .firestore()
            .collection('users/privileged/requests')
            .limit(100)
            .get()
        ).docs.map((doc) => doc.data()) as User[])
      const func3 = async () =>
        (users = (
          await admin.firestore().doc('users/privileged').get()
        ).data() as UserTypes)
      await Promise.all([func1(), func2(), func3()])
      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
    body = { users, gameslist, authRequests, partners }
  } else {
    statusCode = 401
  }
  return res.setHeader('privilege', privilege).status(statusCode).json(body)
})
