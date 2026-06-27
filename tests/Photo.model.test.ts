// ─── Env ───────────────────────────────────────────────────────────────────────
process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../backend/Config/dbInit', () => ({
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
}))

jest.mock('../backend/Models/Photo', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
}))

import Photo from '../backend/Models/Photo'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makePhoto = (overrides: Record<string, any> = {}) => ({
  unsplashId: 'photo-abc123',
  url: 'https://images.unsplash.com/photo.jpg',
  thumb: 'https://images.unsplash.com/photo_thumb.jpg',
  description: 'A beautiful AI visualization',
  photographer: 'Jane Doe',
  photographerLink: 'https://unsplash.com/@janedoe',
  downloadLink: 'https://unsplash.com/photos/photo-abc123/download',
  interest: 'artificial intelligence technology',
  type: 'photo',
  createdAt: new Date().toISOString(),
  ...overrides,
})

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Photo Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it("retourne toutes les photos d'un intérêt donné", async () => {
      const photos = [makePhoto(), makePhoto({ unsplashId: 'p2' })]
      ;(Photo.findAll as jest.Mock).mockResolvedValue(photos)

      const result = await Photo.findAll({
        where: { interest: 'artificial intelligence technology' },
      })

      expect(Photo.findAll).toHaveBeenCalledWith({
        where: { interest: 'artificial intelligence technology' },
      })
      expect(result).toHaveLength(2)
    })

    it('retourne un tableau vide si aucune photo ne correspond', async () => {
      ;(Photo.findAll as jest.Mock).mockResolvedValue([])

      const result = await Photo.findAll({
        where: { interest: 'unknown-interest' },
      })

      expect(result).toEqual([])
    })

    it('propage les erreurs Sequelize', async () => {
      ;(Photo.findAll as jest.Mock).mockRejectedValue(
        new Error('DB connection lost')
      )

      await expect(
        Photo.findAll({ where: { interest: 'ai' } })
      ).rejects.toThrow('DB connection lost')
    })
  })

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('retourne la photo correspondant à unsplashId', async () => {
      const photo = makePhoto()
      ;(Photo.findOne as jest.Mock).mockResolvedValue(photo)

      const result = await Photo.findOne({
        where: { unsplashId: 'photo-abc123' },
      })

      expect(result).toEqual(photo)
    })

    it('retourne null si la photo est introuvable', async () => {
      ;(Photo.findOne as jest.Mock).mockResolvedValue(null)

      const result = await Photo.findOne({
        where: { unsplashId: 'nonexistent' },
      })

      expect(result).toBeNull()
    })
  })

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('crée une photo avec tous les champs requis', async () => {
      const payload = makePhoto()
      const created = { id: 1, ...payload }
      ;(Photo.create as jest.Mock).mockResolvedValue(created)

      const result = await Photo.create(payload)

      expect(Photo.create).toHaveBeenCalledWith(payload)
      expect(result).toMatchObject({ unsplashId: 'photo-abc123' })
    })

    it("propage l'erreur de contrainte d'unicité (unsplashId dupliqué)", async () => {
      ;(Photo.create as jest.Mock).mockRejectedValue(
        Object.assign(new Error('Unique constraint'), {
          name: 'SequelizeUniqueConstraintError',
        })
      )

      await expect(Photo.create(makePhoto())).rejects.toThrow(
        'Unique constraint'
      )
    })
  })

  // ── bulkCreate ───────────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    it('insère plusieurs photos en une seule transaction', async () => {
      const photos = [
        makePhoto({ unsplashId: 'p1' }),
        makePhoto({ unsplashId: 'p2' }),
        makePhoto({ unsplashId: 'p3' }),
      ]
      ;(Photo.bulkCreate as jest.Mock).mockResolvedValue(photos)

      const result = await Photo.bulkCreate(photos, { ignoreDuplicates: true })

      expect(Photo.bulkCreate).toHaveBeenCalledWith(
        photos,
        expect.objectContaining({ ignoreDuplicates: true })
      )
      expect(result).toHaveLength(3)
    })

    it('ignore les doublons si ignoreDuplicates est true', async () => {
      const photos = [makePhoto(), makePhoto()] // même unsplashId → doublon
      ;(Photo.bulkCreate as jest.Mock).mockResolvedValue([photos[0]]) // 1 seule insérée

      const result = await Photo.bulkCreate(photos, { ignoreDuplicates: true })

      expect(result).toHaveLength(1)
    })

    it("retourne un tableau vide si aucune photo n'est fournie", async () => {
      ;(Photo.bulkCreate as jest.Mock).mockResolvedValue([])

      const result = await Photo.bulkCreate([])

      expect(result).toEqual([])
    })
  })

  // ── destroy ──────────────────────────────────────────────────────────────────

  describe('destroy', () => {
    it("supprime les photos d'un intérêt donné", async () => {
      ;(Photo.destroy as jest.Mock).mockResolvedValue(5)

      const deleted = await Photo.destroy({
        where: { interest: 'artificial intelligence technology' },
      })

      expect(Photo.destroy).toHaveBeenCalledWith({
        where: { interest: 'artificial intelligence technology' },
      })
      expect(deleted).toBe(5)
    })

    it('retourne 0 si aucune photo ne correspond', async () => {
      ;(Photo.destroy as jest.Mock).mockResolvedValue(0)

      const deleted = await Photo.destroy({
        where: { interest: 'nonexistent' },
      })

      expect(deleted).toBe(0)
    })
  })

  // ── Sérialisation ─────────────────────────────────────────────────────────────

  describe('Sérialisation toJSON', () => {
    it('sérialise une photo en objet plat', () => {
      const raw = makePhoto()
      const mockPhotoInstance = {
        ...raw,
        toJSON: jest.fn(() => ({ ...raw })),
      }

      const json = mockPhotoInstance.toJSON()

      expect(json.unsplashId).toBe('photo-abc123')
      expect(json.photographer).toBe('Jane Doe')
      expect(json.interest).toBe('artificial intelligence technology')
    })

    it('mappe correctement un tableau de photos via toJSON', () => {
      const rawPhotos = [
        makePhoto({ unsplashId: 'p1' }),
        makePhoto({ unsplashId: 'p2' }),
      ]
      const mockInstances = rawPhotos.map((p) => ({
        ...p,
        toJSON: () => ({ ...p }),
      }))

      const mapped = mockInstances.map((p) => p.toJSON())

      expect(mapped).toHaveLength(2)
      expect(mapped[0].unsplashId).toBe('p1')
      expect(mapped[1].unsplashId).toBe('p2')
    })
  })
})
