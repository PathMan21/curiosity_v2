function ProfileInfo(props) {


    return(
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body text-center">
                            {props.img && <img src={props.img} alt="profile" className="rounded-circle mb-3" style={{width: '150px', height: '150px', objectFit: 'cover'}} />}
                            <h3 className="card-title mb-3">{props.username}</h3>
                            <p className="card-text text-muted">Bienvenue sur votre profil</p>
                            <div className="mt-4">
                                <a href="/Profile/settings" className="btn btn-outline-primary me-2">Paramètres</a>
                                <a href="#" className="btn btn-outline-secondary">Favoris</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ProfileInfo;
