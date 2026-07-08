import nodemailer from 'nodemailer'
import { Resend } from 'resend'

import '../Helpers/configLink'
export const transport = new Resend(process.env.RESEND_API_KEY)
