import { Request, Response } from 'express'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import * as admin from 'firebase-admin'
import { UserTypes } from '../types'

export default async function privilege(
  req: Request,
  res: Response,
  next: () => void
) {
  if (req.headers.authorization == undefined) {
    res.send('Authorization header is missing')
    return
  }

  let credential: DecodedIdToken

  try {
    credential = await admin
      .auth()
      .verifyIdToken(req.headers.authorization.split('Bearer ')[1])
  } catch (error) {
    res.status(401).send('Invalid token')
    return
  }

  const adminData = (
    await admin.firestore().doc('users/privileged').get()
  ).data() as UserTypes

  if (adminData == undefined) {
    console.error('adminData is undefined')
    res.status(500).send('Server Error is undefined')
    return
  }

  const a = adminData.admins.find((x) => x.uid === credential.uid)
  const p = adminData.privileged.find((x) => x.uid === credential.uid)

  if (a) {
    req.headers['privilege'] = 'admin'
    return res
  }

  if (p) {
    req.headers['privilege'] = 'privileged'
    return res
  }

  req.headers['privilege'] = 'noprivilege'
  next()
}
