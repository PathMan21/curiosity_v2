import NavbarSite from '../../Components/NavbarSite'
import FooterSite from '../../Components/FooterSite'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
      <NavbarSite />

      <main>
        <Outlet />
      </main>

      <FooterSite />
    </>
  )
}

export default Layout
