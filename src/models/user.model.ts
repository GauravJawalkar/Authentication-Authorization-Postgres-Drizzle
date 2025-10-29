import { pgTable, integer, uuid, varchar, pgEnum } from "drizzle-orm/pg-core";
export const genderEnum = pgEnum('Gender', ['male', 'female'])

const usersTable = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstNam: varchar('FirstName', { length: 255 }).notNull(),
    lastName: varchar('LastName', { length: 255 }),
    email: varchar('Email', { length: 255 }).notNull(),
    gender: genderEnum('Gender').notNull(),
    password: varchar('Password', { length: 16 }).notNull(),
    profileImage: varchar('ProfileImage')
})

export { usersTable }