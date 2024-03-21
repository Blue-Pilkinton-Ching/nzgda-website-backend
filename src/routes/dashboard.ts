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

// Route

dashboard.get('/', async (req, res) => {
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

// Users

dashboard.post('/users', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const reqBody = (await JSON.parse(req.body)) as { user: User }

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const func1 = async () => {
        const d = (
          await admin.firestore().doc('users/privileged').get()
        ).data() as UserTypes

        d.privileged.push(reqBody.user)

        await admin.firestore().doc('users/privileged').set(d)

        await (
          await admin
            .firestore()
            .collection('users/privileged/requests')
            .limit(1)
            .where('uid', '==', reqBody.user.uid)
            .get()
        ).docs[0].ref.delete()
      }

      func1()

      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }

  res.status(statusCode).json({})
})

dashboard.delete('/users', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const reqBody = (await JSON.parse(req.body)) as { user: User }

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const func1 = async () => {
        const d = (
          await admin.firestore().doc('users/privileged').get()
        ).data() as UserTypes

        d.privileged = d.privileged.filter((x) => x.uid !== reqBody.user.uid)

        await admin.firestore().doc('users/privileged').set(d)
      }

      func1()

      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }

  res.status(statusCode).json({})
})

// Requests

dashboard.delete('/requests', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege
  const reqBody = (await JSON.parse(req.body)) as { user: User }
  let statusCode = 500
  if (privilege === 'admin') {
    try {
      const updateData = async () => {
        const query = admin
          .firestore()
          .collection('users/privileged/requests')
          .limit(1)
          .where('uid', '==', reqBody.user.uid)
        await (await query.get()).docs[0].ref.delete()
      }
      await updateData()
      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }
  res.status(statusCode).json({})
})

// Partners

dashboard.patch('/partners', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const reqBody = await JSON.parse(req.body)

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const updateData = async () => {
        const query = admin.firestore().collection('gameslist').limit(1)

        const doc = (await query.get()).docs[0]
        const data = doc.data() as GamesList

        data.partners[
          data.partners.findIndex((item) => item.name === reqBody.name)
        ].hidden = reqBody.hidden

        await doc.ref.set(data)
      }

      await updateData()

      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }

  res.status(statusCode).json({})
})

dashboard.post('/partners', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const reqBody = await JSON.parse(req.body)

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const updateData = async () => {
        const query = admin.firestore().collection('gameslist').limit(1)

        const doc = (await query.get()).docs[0]
        const data = doc.data() as GamesList

        data.partners.push({ name: reqBody, hidden: false })

        await doc.ref.set(data)
      }

      await updateData()

      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }

  res.status(statusCode).json({})
})

dashboard.delete('/partners', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const reqBody = await JSON.parse(req.body)

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const updateData = async () => {
        const query = admin.firestore().collection('gameslist').limit(1)

        const doc = (await query.get()).docs[0]
        const data = doc.data() as GamesList

        data.partners = data.partners.filter((item) => item.name !== reqBody)

        await doc.ref.set(data)
      }

      await updateData()

      statusCode = 200
    } catch (error) {
      console.error(error)
      statusCode = 500
    }
  } else {
    statusCode = 401
  }

  res.status(statusCode).json({})
})
