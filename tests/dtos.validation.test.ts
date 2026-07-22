import { createArticleSchema } from '../backend/dtos/Article'
import { createPhotosSchema } from '../backend/dtos/Photos'


describe('DTOs Zod — Validation des schémas', () => {

  describe('createArticleSchema', () => {
    const validArticle = {
      openAlexId: 'https://openalex.org/W1234',
      title: 'Deep Learning in 2024',
      authors: ['Alice Martin', 'Bob Dupont'],
      published: '2024-01-15',
      summary: 'A comprehensive study on deep learning.',
      doi: 'https://doi.org/10.1234/test',
      pdfUrl: 'https://arxiv.org/pdf/1234.pdf',
      isOpenAccess: true,
      publicationYear: 2024,
      type: 'article',
      link: 'https://openalex.org/works/W1234',
      mainTopic: 'Machine Learning',
      topicScore: 0.92,
      concepts: ['Neural Networks', 'Computer Vision'],
      subfield: '1702',
    }

    it('accepte un article valide complet', () => {
      expect(() => createArticleSchema.parse(validArticle)).not.toThrow()
    })

    it("retourne l'objet parsé avec tous les champs", () => {
      const result = createArticleSchema.parse(validArticle)
      expect(result.openAlexId).toBe(validArticle.openAlexId)
      expect(result.title).toBe(validArticle.title)
      expect(result.authors).toEqual(validArticle.authors)
      expect(result.isOpenAccess).toBe(true)
    })

    it('rejette si openAlexId est absent', () => {
      const { openAlexId, ...rest } = validArticle
      expect(() => createArticleSchema.parse(rest)).toThrow()
    })

    it('rejette si title est absent', () => {
      const { title, ...rest } = validArticle
      expect(() => createArticleSchema.parse(rest)).toThrow()
    })

    it('rejette si subfield est absent', () => {
      const { subfield, ...rest } = validArticle
      expect(() => createArticleSchema.parse(rest)).toThrow()
    })

    it('accepte pdfUrl null (article non open access)', () => {
      const article = { ...validArticle, pdfUrl: null, isOpenAccess: false }
      expect(() => createArticleSchema.parse(article)).not.toThrow()
    })

    it('accepte summary null (résumé absent)', () => {
      const article = { ...validArticle, summary: null }
      expect(() => createArticleSchema.parse(article)).not.toThrow()
    })

    it('accepte doi null', () => {
      const article = { ...validArticle, doi: null }
      expect(() => createArticleSchema.parse(article)).not.toThrow()
    })

    it('accepte authors vide', () => {
      const article = { ...validArticle, authors: [] }
      expect(() => createArticleSchema.parse(article)).not.toThrow()
    })

    it('accepte concepts vide', () => {
      const article = { ...validArticle, concepts: [] }
      expect(() => createArticleSchema.parse(article)).not.toThrow()
    })

    it('rejette topicScore en dehors de [0, 1]', () => {
      const article = { ...validArticle, topicScore: 1.5 }
      expect(() => createArticleSchema.parse(article)).toThrow()
    })

    it('rejette un type inconnu', () => {
      const article = { ...validArticle, type: 'book' }
      expect(() => createArticleSchema.parse(article)).toThrow()
    })

    it('rejette publicationYear non numérique', () => {
      const article = { ...validArticle, publicationYear: 'two-thousand' }
      expect(() => createArticleSchema.parse(article)).toThrow()
    })
  })


  describe('createPhotosSchema', () => {
    const validPhoto = {
      unsplashId: 'abc123XYZ',
      url: 'https://images.unsplash.com/photo.jpg',
      thumb: 'https://images.unsplash.com/photo_thumb.jpg',
      description: 'A beautiful AI visualization',
      photographer: 'Jane Doe',
      photographerLink: 'https://unsplash.com/@janedoe',
      downloadLink: 'https://unsplash.com/photos/abc123XYZ/download',
      interest: 'artificial intelligence technology',
      type: 'photo',
    }

    it('accepte une photo valide complète', () => {
      expect(() => createPhotosSchema.parse(validPhoto)).not.toThrow()
    })

    it("retourne l'objet parsé avec tous les champs", () => {
      const result = createPhotosSchema.parse(validPhoto)
      expect(result.unsplashId).toBe(validPhoto.unsplashId)
      expect(result.url).toBe(validPhoto.url)
      expect(result.photographer).toBe(validPhoto.photographer)
    })

    it('rejette si unsplashId est absent', () => {
      const { unsplashId, ...rest } = validPhoto
      expect(() => createPhotosSchema.parse(rest)).toThrow()
    })

    it('rejette si url est absent', () => {
      const { url, ...rest } = validPhoto
      expect(() => createPhotosSchema.parse(rest)).toThrow()
    })

    it('rejette si interest est absent', () => {
      const { interest, ...rest } = validPhoto
      expect(() => createPhotosSchema.parse(rest)).toThrow()
    })

    it('accepte description null (pas toutes les photos ont une description)', () => {
      const photo = { ...validPhoto, description: null }
      expect(() => createPhotosSchema.parse(photo)).not.toThrow()
    })

    it('rejette un type inconnu', () => {
      const photo = { ...validPhoto, type: 'video' }
      expect(() => createPhotosSchema.parse(photo)).toThrow()
    })

    it("rejette si url n'est pas une URL valide", () => {
      const photo = { ...validPhoto, url: 'not-a-url' }
      expect(() => createPhotosSchema.parse(photo)).toThrow()
    })

    it("rejette si downloadLink n'est pas une URL valide", () => {
      const photo = { ...validPhoto, downloadLink: 'not-a-url' }
      expect(() => createPhotosSchema.parse(photo)).toThrow()
    })

    it('rejette si unsplashId est une chaîne vide', () => {
      const photo = { ...validPhoto, unsplashId: '' }
      expect(() => createPhotosSchema.parse(photo)).toThrow()
    })
  })
})
