
const mockVerify = jest.fn()

jest.mock('../backend/Config/emailConfig', () => {
  return {
    __esModule: true,
    transport: {
      verify: (...args: any[]) => mockVerify(...args),
    },
  }
})


import validateByMail from '../backend/middlewares/mail.middlewares'


describe('mail.middlewares – validateByMail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('résout avec le résultat de transport.verify en cas de succès', async () => {
    mockVerify.mockImplementation((cb: (err: any, success: any) => void) => {
      cb(null, true)
    })

    const result = await validateByMail()
    expect(result).toBe(true)
    expect(mockVerify).toHaveBeenCalledTimes(1)
  })

  it("rejette avec l'erreur de transport.verify en cas d'échec", async () => {
    const error = new Error('SMTP connection failed')
    mockVerify.mockImplementation((cb: (err: any, success: any) => void) => {
      cb(error, null)
    })

    await expect(validateByMail()).rejects.toThrow('SMTP connection failed')
    expect(mockVerify).toHaveBeenCalledTimes(1)
  })

  it('appelle transport.verify exactement une fois', async () => {
    mockVerify.mockImplementation((cb: (err: any, success: any) => void) => {
      cb(null, 'OK')
    })

    await validateByMail()
    expect(mockVerify).toHaveBeenCalledTimes(1)
  })

  it('résout avec la valeur exacte retournée par le callback', async () => {
    mockVerify.mockImplementation((cb: (err: any, success: any) => void) => {
      cb(null, 'Server ready')
    })

    const result = await validateByMail()
    expect(result).toBe('Server ready')
  })
})
