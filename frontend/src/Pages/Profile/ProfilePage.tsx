import React from "react";
import ProfileInfo from "./ProfileInfo";
import NavbarSite from "../../Components/NavbarSite";
import FooterSite from "../../Components/FooterSite";
import { useAuth } from "../../Context/AuthContext";
import { jwtDecode } from 'jwt-decode';

function Profile() {

  const { token } = useAuth();
  let tokenDecoded = jwtDecode(token);
  console.log(tokenDecoded);

  return (
    
    <><NavbarSite />
    <div className="bg-light min-vh-100 py-5">
        <ProfileInfo img={ tokenDecoded['img'] } email={ tokenDecoded['email'] } interests={ tokenDecoded['interests'] } username={ tokenDecoded['username'] }></ProfileInfo>
    </div>
    <FooterSite />
    </>
  );
}

export default Profile;
