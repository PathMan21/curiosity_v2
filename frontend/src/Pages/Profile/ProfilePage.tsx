import React from "react";
import ProfileInfo from "./ProfileInfo";
import NavbarSite from "../../Components/NavbarSite";
import FooterSite from "../../Components/FooterSite";

function Profile() {
  return (
    
    <><NavbarSite />
    <div className="bg-light min-vh-100 py-5">
        <ProfileInfo img="" username="test"></ProfileInfo>
    </div>
    <FooterSite />
    </>
  );
}

export default Profile;
