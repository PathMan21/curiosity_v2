import {
  isArticlesTooOld,
  isPhotosTooOld,
} from '../backend/Helpers/CheckTooOld'

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('CheckTooOld Helper', () => {
  // ── isArticlesTooOld ─────────────────────────────────────────────────────────

  describe('isArticlesTooOld', () => {
    it("retourne false si les articles sont récents (aujourd'hui)", () => {
      const articles = [{ published: new Date().toISOString() }]
      expect(isArticlesTooOld(articles)).toBe(false)
    })

    it("retourne false si les articles ont moins d'un mois", () => {
      const recent = new Date()
      recent.setDate(recent.getDate() - 15)
      const articles = [{ published: recent.toISOString() }]
      expect(isArticlesTooOld(articles)).toBe(false)
    })

    it("retourne true si les articles ont plus d'un mois", () => {
      const old = new Date()
      old.setDate(old.getDate() - 40)
      const articles = [{ published: old.toISOString() }]
      expect(isArticlesTooOld(articles)).toBe(true)
    })

    it("retourne true si les articles ont plus d'un an", () => {
      const veryOld = new Date()
      veryOld.setFullYear(veryOld.getFullYear() - 2)
      const articles = [{ published: veryOld.toISOString() }]
      expect(isArticlesTooOld(articles)).toBe(true)
    })

    it('retourne true si le tableau est vide', () => {
      expect(isArticlesTooOld([])).toBe(true)
    })

    it('retourne true si le tableau est null ou undefined', () => {
      expect(isArticlesTooOld(null as any)).toBe(true)
      expect(isArticlesTooOld(undefined as any)).toBe(true)
    })

    it('se base sur le premier article du tableau', () => {
      const old = new Date()
      old.setDate(old.getDate() - 40)
      const recent = new Date()

      // Premier article vieux → true même si le deuxième est récent
      const articles = [
        { published: old.toISOString() },
        { published: recent.toISOString() },
      ]
      expect(isArticlesTooOld(articles)).toBe(true)
    })

    it('retourne true si la date est invalide', () => {
      const articles = [{ published: 'not-a-date' }]
      expect(isArticlesTooOld(articles)).toBe(true)
    })

    it('retourne true si le champ published est absent', () => {
      const articles = [{ openAlexId: 'W1' }]
      expect(isArticlesTooOld(articles as any)).toBe(true)
    })
  })

  // ── isPhotosTooOld ───────────────────────────────────────────────────────────

  describe('isPhotosTooOld', () => {
    it("retourne false si les photos sont récentes (aujourd'hui)", () => {
      const photos = [{ createdAt: new Date().toISOString() }]
      expect(isPhotosTooOld(photos)).toBe(false)
    })

    it('retourne false si les photos ont moins de 3 mois', () => {
      const recent = new Date()
      recent.setDate(recent.getDate() - 60)
      const photos = [{ createdAt: recent.toISOString() }]
      expect(isPhotosTooOld(photos)).toBe(false)
    })

    it('retourne true si les photos ont plus de 3 mois', () => {
      const old = new Date()
      old.setDate(old.getDate() - 100)
      const photos = [{ createdAt: old.toISOString() }]
      expect(isPhotosTooOld(photos)).toBe(true)
    })

    it('retourne true si le tableau est vide', () => {
      expect(isPhotosTooOld([])).toBe(true)
    })

    it('retourne true si le tableau est null ou undefined', () => {
      expect(isPhotosTooOld(null as any)).toBe(true)
      expect(isPhotosTooOld(undefined as any)).toBe(true)
    })

    it('retourne true si la date est invalide', () => {
      const photos = [{ createdAt: 'invalid-date' }]
      expect(isPhotosTooOld(photos)).toBe(true)
    })

    it('retourne true si le champ createdAt est absent', () => {
      const photos = [{ unsplashId: 'p1' }]
      expect(isPhotosTooOld(photos as any)).toBe(true)
    })

    it('se base sur le premier élément du tableau', () => {
      const old = new Date()
      old.setDate(old.getDate() - 100)
      const recent = new Date()

      const photos = [
        { createdAt: old.toISOString() },
        { createdAt: recent.toISOString() },
      ]
      expect(isPhotosTooOld(photos)).toBe(true)
    })
  })
})
