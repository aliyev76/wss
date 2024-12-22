// import './App.css'
import Navbar from './components/HomeComponent/Navbar/Navbar'
import Footer from './components/HomeComponent/Footer/Footer'
import { Outlet } from "react-router-dom";
import './index.css';
import './styles/super_styles.css';
function App() {

  return (
    <>
      <Navbar/>
<Outlet/>
      <Footer/>

    </>
  )
}

export default App
