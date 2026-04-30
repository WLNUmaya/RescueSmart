import { Routes, Route } from "react-router-dom";
import VictimWizard from "./pages/VictimWizard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityRegister from "./pages/AuthorityRegister";
import Home from "./pages/home";
import VictimLogin from "./pages/VictimLogin"; 
import VictimRegister from "./pages/VictimRegister"; 

 

export default function App() {
  return (
    <Routes>
      <Route path="/victim" element={<VictimWizard />} />
      <Route path="/authority" element={<AuthorityDashboard />} />
      <Route path="/authority/login" element={<AuthorityLogin />} />
      <Route path="/authority/register" element={<AuthorityRegister />} />
      <Route path="/" element ={<Home/>}/>
      <Route path ="victim/login" element={<VictimLogin/>}/>
      <Route path="victim/register" element ={<VictimRegister/>}/>
    </Routes>
  );
}
