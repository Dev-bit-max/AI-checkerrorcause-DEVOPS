import React from 'react'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Overview from "./components/Overview";
import Incidents from "./components/Incidents";
import AnalyzeLogs from "./components/AnalyzeLogs";
import Reports from "./components/Reports";

const App = () => {
  return (
 <BrowserRouter>
 
 <Routes>

<Route path="/" element={<Overview/>}/>

<Route path="/incidents" element={<Incidents/>}/>

<Route path="/analyze" element={<AnalyzeLogs/>}/>

<Route path="/reports" element={<Reports/>}/>



 </Routes>

 
 
 

 </BrowserRouter>
  )
}

export default App