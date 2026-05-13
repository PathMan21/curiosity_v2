import React from 'react'
import ProfileInfo from './ProfileInfo'
import NavbarSite from '../../Components/NavbarSite'
import FooterSite from '../../Components/FooterSite'
import { useAuthentification } from '../../Context/Auth'

function Profile() {
  const { fetchUserProfile } = useAuthentification()

  if (!fetchUserProfile) {
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
    <div>
    <NavbarSite></NavbarSite>
      <div className="bg-light min-vh-100 py-5">
        <ProfileInfo
          img={user.picture}
          email={user.email}
          interests={user.interests}
          username={user.username}
        ></ProfileInfo>
        
    </div>
    <FooterSite></FooterSite>
    </div>
  )
}

export default Profile
