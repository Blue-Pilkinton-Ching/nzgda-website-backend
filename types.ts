export interface Game {
  id: number
  name: string
  description: string
  thumbnail: string
  screenshot?: string
  approved: number
  partner: string
  url?: string
  userId: number
  type: string
  tags?: string
  uploadStatus: string
  iosLink?: string
  androidLink?: string
  gamefrootLink?: string
  fileSize?: number
  exclude?: string
  width?: number
  height?: number
  orientation?: string
  createdAt?: string
  updatedAt?: string
  playableOnHeihei?: boolean
  displayAppBadge?: boolean
}

export interface UserTypes {
  admins: User[]
  privileged: User[]
}

export interface AdminDashboard {
  users: UserTypes
  partners: Partner[]
  gameslist: GameListItem[]
  authRequests: User[]
}

export interface User {
  email: string
  uid: string
}

export type UserPrivilege =
  | 'missing'
  | 'invalid'
  | 'error'
  | 'noprivilege'
  | 'admin'
  | 'privileged'

export interface GameListItem {
  id: number
  name: string
  thumbnail: string
  hidden: boolean
  partner: string
  exclude: string
  app?: boolean
  featured: boolean
  banner?: string
}

export interface Partner {
  hidden: boolean
  name: string
}

export interface GamesList {
  data: GameListItem[]
  partners: Partner[]
}

export interface s3Object {
  Key: string
  filepath: string
}
