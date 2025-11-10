import { pgTable, uuid, varchar, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum('Gender', ['male', 'female'])
export const userRoleEnum = pgEnum('User_Role', ['user', 'admin'])

const usersTable = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('FirstName', { length: 255 }).notNull(),
    lastName: varchar('LastName', { length: 255 }),
    email: varchar('Email', { length: 255 }).notNull(),
    gender: genderEnum('Gender').notNull(),
    password: varchar('Password').notNull(),
    role: userRoleEnum('Role').notNull().default('user'),
    profileImage: varchar('ProfileImage')
})

const resetPasswordTable = pgTable("reset_password", {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('User_Id').notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    otp: varchar('Otp').notNull(),
    expiresAt: timestamp('Expires_At').notNull()
})

export { usersTable, resetPasswordTable }