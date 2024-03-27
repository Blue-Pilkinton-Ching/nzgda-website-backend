import {
  AdminDashboard,
  Game,
  GameListItem,
  GamesList,
  User,
  UserPrivilege,
  UserTypes,
} from '../../types'
import * as admin from 'firebase-admin'
import privilege from './../authenticate'
import { Router } from 'express'

import { multer } from './../server'

import { uploadFile, uploadFolder } from '../util/uploadToS3'
import AdmZip from 'adm-zip'

import * as fs from 'fs'

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

// Add Game

dashboard.post(
  '/add',
  multer.fields([
    { name: 'game', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    const privilege = req.headers['privilege'] as UserPrivilege

    const game = JSON.parse(req.body.data) as Game

    let statusCode = 500

    const files = req.files as {
      thumbnail: Express.Multer.File[]
      game: Express.Multer.File[] | undefined
    }

    if (files.thumbnail == undefined) {
      res.status(400).json({ error: 'No thumbnail provided' })
      return
    }

    if (privilege === 'admin' || privilege === 'privileged') {
      const latestID = (
        await admin.firestore().doc('gameslist/latest-id').get()
      ).data() as { id: number }

      latestID.id += 1

      try {
        await admin
          .firestore()
          .doc('gameslist/latest-id')
          .set({ id: latestID.id })
      } catch (error) {
        console.error(error)
        statusCode = 500
        res.status(statusCode).json({})
      }

      const id = latestID.id

      if (privilege === 'admin') {
        try {
          const func1 = async () => {
            try {
              await uploadFile(
                'heihei-game-content',
                `${id}/thumbnail.png`,
                files.thumbnail[0].path
              )

              fs.unlink(files.thumbnail[0].path, (err) => {
                if (err) throw err
              })

              if (files.game) {
                var zip = new AdmZip(files.game[0].path)

                zip.extractAllTo(`tmp/${id}/game`, true)

                await uploadFolder(
                  'heihei-game-content',
                  `tmp/${id}/game/`,
                  `${id}/game/`
                )
                fs.unlink(files.game[0].path, (err) => {
                  if (err) throw err
                })
                fs.rm(`tmp/${id}`, { recursive: true, force: true }, (err) => {
                  if (err) throw err
                })
              }
            } catch (error) {
              console.error('Error uploading game content')
              throw error
            }

            const d = (
              await admin
                .firestore()
                .doc('gameslist/BrHoO8yuD3JdDFo8F2BC')
                .get()
            ).data() as GamesList

            d.data.push({
              app: game.displayAppBadge,
              id,
              hidden: false,
              exclude: game.exclude || '',
              name: game.name,
              partner: game.partner,
              thumbnail: `https://heihei-game-content.s3.ap-southeast-2.amazonaws.com/${id}/thumbnail.png`,
              featured: false,
              // banner: "NEED TO IMPLEMENT",
            })

            await admin.firestore().doc(`gameslist/BrHoO8yuD3JdDFo8F2BC`).set(d)
          }

          const func2 = async () => {
            admin
              .firestore()
              .doc(`games/${id}`)
              .set({
                ...game,
                id: id,
                ...(files.game && {
                  url: `https://heihei-game-content.s3.ap-southeast-2.amazonaws.com/${id}/game/index.html`,
                }),
                thumbnail: `https://heihei-game-content.s3.ap-southeast-2.amazonaws.com/${id}/thumbnail.png`,
              })
          }

          await Promise.all([func1(), func2()])

          statusCode = 200
        } catch (error) {
          console.error(error)
          statusCode = 500
        }
      }
    } else {
      statusCode = 401
    }

    res.status(statusCode).json({})
  }
)

// Game Settings

dashboard.patch('/:gameID', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const gameChanges = await JSON.parse(req.body)

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const query = admin
        .firestore()
        .collection('games')
        .where('id', '==', Number(req.params.gameID))
        .limit(1)
      const query2 = admin.firestore().collection('gameslist').limit(1)

      const updateGame1 = async () => {
        await (await query.get()).docs[0].ref.update(gameChanges)
      }
      const updateGame2 = async () => {
        const doc = (await query2.get()).docs[0]
        const data = doc.data() as { data: GameListItem[] }

        const item =
          data.data[
            data.data.findIndex((item) => item.id === Number(req.params.gameID))
          ]

        item.name = gameChanges.name
        item.partner = gameChanges.partner
        item.exclude = gameChanges.exclude
        item.app = gameChanges.displayAppBadge

        await doc.ref.set(data)
      }

      await Promise.all([updateGame1(), updateGame2()])

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

dashboard.patch('/:gameID/visibility', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const hidden = (await JSON.parse(req.body)).hidden as boolean

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const query = admin.firestore().collection('gameslist').limit(1)

      const doc = (await query.get()).docs[0]
      const data = doc.data() as { data: GameListItem[] }

      data.data[
        data.data.findIndex((item) => item.id === Number(req.params.gameID))
      ].hidden = hidden

      await doc.ref.set(data)

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

dashboard.patch('/:gameID/feature', async (req, res) => {
  const privilege = req.headers['privilege'] as UserPrivilege

  const featured = (await JSON.parse(req.body)).featured as boolean

  let statusCode = 500

  if (privilege === 'admin') {
    try {
      const query = admin.firestore().collection('gameslist').limit(1)

      const doc = (await query.get()).docs[0]
      const data = doc.data() as { data: GameListItem[] }

      data.data.map((x) => {
        if (x.id === Number(req.params.gameID)) {
          x.featured = featured
        } else {
          x.featured = false
        }
        return x
      })

      await doc.ref.set(data)

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
