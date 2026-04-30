// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'
// // import VictimWizard from "./pages/VictimWizard"

// // export default function App() {
// //   return <VictimWizard />;
// // }

// import { Routes, Route } from "react-router-dom";
// import VictimWizard from "./pages/VictimWizard";
// import AuthorityDashboard from "./pages/AuthorityDashboard";

// function App() {
//   return (
//     <Routes>
//       {/* Default page */}
//       <Route path="/" element={<VictimWizard />} />

//       {/* Other interface */}
//       <Route path="/authority" element={<AuthorityDashboard />} />
//     </Routes>
//   );
// }

// export default App;


import { Routes, Route } from "react-router-dom";
import VictimWizard from "./pages/VictimWizard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityRegister from "./pages/AuthorityRegister";
import Home from "./pages/home";


export default function App() {
  return (
    <Routes>
      <Route path="/victim" element={<VictimWizard />} />

      <Route path="/authority" element={<AuthorityDashboard />} />
      <Route path="/authority/login" element={<AuthorityLogin />} />
      <Route path="/authority/register" element={<AuthorityRegister />} />
      <Route path="/" element ={<Home/>}/>
    </Routes>
  );
}
