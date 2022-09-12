/// <reference types="vite-plugin-pages/client-react" />
import { useState } from "react";
import Nav from "@/component/Nav";
import "./App.css";
import routes from "~react-pages";
import { useRoutes } from "react-router-dom";
function App() {
  const [count, setCount] = useState(0);
  console.log(routes, "routes");
  return (
    <div className="App">
      <Nav></Nav>
      {useRoutes(routes)}
    </div>
  );
}

export default App;
