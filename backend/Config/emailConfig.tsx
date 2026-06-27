import nodemailer from 'nodemailer'

import "../Helpers/configLink";
export const transport = nodemailer.createTransport({
    host: "smtp.tem.scaleway.com",
    port: 465,
    secure: false,
    auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.AUTH_PWD,
  },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
})
