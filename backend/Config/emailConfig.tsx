import nodemailer from 'nodemailer'

import "../Helpers/configLink";
export const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.AUTH_PWD,
  },
})
