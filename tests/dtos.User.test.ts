import { createUserSchema, updateUserSchema } from '../backend/dtos/User'

describe('dtos/User – createUserSchema', () => {
  it('valide un utilisateur complet', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('valide avec des champs optionnels', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
      picture: 'https://example.com/pic.jpg',
      interests: ['IA', 'physique'],
      verified: true,
      isTemporary: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un username trop court', () => {
    const result = createUserSchema.safeParse({
      username: 'ab',
      password: 'Test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un username trop long (>50 caractères)', () => {
    const result = createUserSchema.safeParse({
      username: 'a'.repeat(51),
      password: 'Test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un username avec des caractères spéciaux', () => {
    const result = createUserSchema.safeParse({
      username: 'John<script>',
      password: 'Test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe sans majuscule', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe sans minuscule', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'TEST@123ABC',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe sans chiffre', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@abcdef',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe sans caractère spécial', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test1234abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe trop court (<8 caractères)', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Te@1ab',
      email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un email invalide', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it("rejette une picture qui n'est pas une URL", () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
      picture: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepte picture à null', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
      picture: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejette si interests dépasse 10 éléments', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
      interests: Array(11).fill('topic'),
    })
    expect(result.success).toBe(false)
  })

  it('accepte interests à null', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
      interests: null,
    })
    expect(result.success).toBe(true)
  })

  it('applique les valeurs par défaut de verified et isTemporary', () => {
    const result = createUserSchema.safeParse({
      username: 'JohnDoe',
      password: 'Test@123abc',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.verified).toBe(false)
      expect(result.data.isTemporary).toBe(false)
    }
  })
})

describe('dtos/User – updateUserSchema', () => {
  it('valide une mise à jour avec seulement le username', () => {
    const result = updateUserSchema.safeParse({ username: 'NewName' })
    expect(result.success).toBe(true)
  })

  it("valide une mise à jour avec seulement l'email", () => {
    const result = updateUserSchema.safeParse({ email: 'new@example.com' })
    expect(result.success).toBe(true)
  })

  it('valide une mise à jour vide (tous les champs optionnels)', () => {
    const result = updateUserSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejette un username trop court', () => {
    const result = updateUserSchema.safeParse({ username: 'ab' })
    expect(result.success).toBe(false)
  })

  it('rejette un email invalide', () => {
    const result = updateUserSchema.safeParse({ email: 'not-valid' })
    expect(result.success).toBe(false)
  })

  it("rejette une picture qui n'est pas une URL", () => {
    const result = updateUserSchema.safeParse({ picture: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('accepte picture à null', () => {
    const result = updateUserSchema.safeParse({ picture: null })
    expect(result.success).toBe(true)
  })

  it('rejette si interests dépasse 10 éléments', () => {
    const result = updateUserSchema.safeParse({
      interests: Array(11).fill('topic'),
    })
    expect(result.success).toBe(false)
  })

  it('accepte interests à null', () => {
    const result = updateUserSchema.safeParse({ interests: null })
    expect(result.success).toBe(true)
  })
})
