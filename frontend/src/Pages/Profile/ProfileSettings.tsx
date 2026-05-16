import { useEffect, useRef, useState } from "react"
import { useAuthentification } from "../../Context/Auth"
import { privateApi } from "../../Context/Interceptor"

import ProfileAccessibility from "./ProfileAccessibility"
import interestsData from "../../Assets/interests.json"

function ProfileSettings() {
    const { user, isLoading, fetchUserProfile } = useAuthentification()

    const statusRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [username, setUsername] = useState("")
    const [interests, setSelectedInterests] = useState<string[]>([])
    const [picture, setPicture] = useState<string | null>(null)


    
    const parseInterests = (value: any): string[] => {
        if (!value) return []

        try {
            return typeof value === "string"
                ? JSON.parse(value)
                : value
        } catch {
            return []
        }
    }

    useEffect(() => {
        if (!user) return

        setUsername(user.username || "")
        setSelectedInterests(parseInterests(user.interests))
        setPicture(user.picture || null)
    }, [user])

    const handleInterests = (value: string) => {
        setSelectedInterests((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setError("")
        setSuccess("")
        setLoading(true)

        try {
            const response = await privateApi.post("/updated-profile", {
                username,
                interests,
                picture
            })

            if (response.data.status !== "Success") {
                setError("Erreur lors de la mise à jour du profil")
                return
            }

            // refresh user state
            await fetchUserProfile()

            setSuccess("Profil mis à jour avec succès !")

            setTimeout(() => setSuccess(""), 3000)

        } catch (err: any) {
            console.error("Erreur mise à jour profil:", err)
            setError(err.message || "Erreur serveur")
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return <div className="container py-5">Chargement...</div>
    }

    return (
        <main id="contenu-principal" className="container py-5">

            <h1 className="mb-4">Paramètres du profil</h1>

            <div
                ref={statusRef}
                aria-live="polite"
                aria-atomic="true"
                className={`alert ${
                    error
                        ? "alert-danger"
                        : success
                            ? "alert-success"
                            : "d-none"
                }`}
                role={error ? "alert" : "status"}
            >
                {error || success}
            </div>

            <ProfileAccessibility />

            <form onSubmit={handleSubmit} noValidate>

                <div className="mb-3">
                    <label htmlFor="settings-username" className="form-label">
                        Nom d'utilisateur
                    </label>

                    <input
                        id="settings-username"
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                </div>

                <fieldset className="mb-3">
                    <legend className="form-label">
                        Centres d'intérêt
                    </legend>

                    {interestsData?.interests.map((item) => (
                        <div key={item.id} className="form-check">

                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`interest-${item.id}`}
                                checked={interests.includes(item.id)}
                                onChange={() => handleInterests(item.id)}
                            />

                            <label
                                htmlFor={`interest-${item.id}`}
                                className="form-check-label"
                            >
                                {item.label}
                            </label>

                        </div>
                    ))}
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                >
                    {loading ? "Sauvegarde en cours…" : "Valider"}
                </button>

            </form>
        </main>
    )
}

export default ProfileSettings