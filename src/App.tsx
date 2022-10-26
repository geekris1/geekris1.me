/// <reference types="vite-plugin-pages/client-react" />
import { Suspense } from "react";
import Nav from "@/component/Nav";
import "./App.css";
import routes from "~react-pages";
import { useRoutes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Nav></Nav> <Suspense>{useRoutes(routes)} </Suspense>
    </div>
  );
}

export default App;

type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};

type TupleTest = Tuple<number, 3>;

let a: TupleTest = [1, 2, 3];
