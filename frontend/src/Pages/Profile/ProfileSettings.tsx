function ProfileSettings(props) {
    return(
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title mb-4">Paramètres de profil</h3>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="email" placeholder="Email" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <input type="password" className="form-control" id="password" placeholder="Password" />
                                </div>
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="default-remember" />
                                    <label className="form-check-label" htmlFor="default-remember">
                                        Se souvenir de moi
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Valider les modifications</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ProfileSettings;
