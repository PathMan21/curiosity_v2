import React from 'react'
import ProfileInfo from './ProfileInfo'
import NavbarSite from '../../Components/NavbarSite'
import FooterSite from '../../Components/FooterSite'
import { useAuth } from '../../Context/AuthContext'

function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        <div className="bg-light min-vh-100 py-5">
          <div className="container mt-4">
            <p>Chargement du profil...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="bg-light min-vh-100 py-5">
        <ProfileInfo
          img={user.picture}
          email={user.email}
          interests={user.interests}
          username={user.username}
        ></ProfileInfo>
      </div>
    </>
  )
}

export default Profile
