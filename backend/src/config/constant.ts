export const USER_ROLES = {
    VOTER: 'voter',
    ADMIN: 'admin'
} as const

export const USER_GROUPS = {
    ALL_USERS: [USER_ROLES.VOTER, USER_ROLES.ADMIN],
    ADMINS_ONLY: [USER_ROLES.ADMIN]
}
