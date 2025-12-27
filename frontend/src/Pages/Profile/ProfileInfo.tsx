function ProfileInfo(props) {

    let interestArray = JSON.parse(props.interests);
    console.log(props.img);
    return(
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body text-center">
                            {props.img && <img src={props.img} alt="profile" className="rounded-circle mb-3" style={{width: '100px', height: '100px', objectFit: 'cover'}} referrerPolicy="no-referrer" />}
                            <h3 className="card-title mb-3">{props.username}</h3>
                            <h6 className="card-subtitle mb-2 text">{props.email}</h6>

                            <p className="card-subtitle mb-2 text-muted">
                                {interestArray.map((object, i) => (
                                    object + " "
                                ))}
                            </p>

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
