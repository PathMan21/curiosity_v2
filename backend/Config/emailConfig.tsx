import nodemailer from 'nodemailer'

import "../Helpers/configLink";
export const transport = nodemailer.createTransport({
    host: "smtp.scaleway.com",
    port: 587,
    auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.AUTH_PWD,
  },
})
