import nodemailer from 'nodemailer'
import UserVerification from '../Models/UserVerifications'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { transport } from '../Config/emailConfig'

const validateByMail = () => {
  return new Promise((resolve, reject) => {
    transport.verify((err, success) => {
      if (err) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}

export default validateByMail
