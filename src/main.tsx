import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import "uno.css";
import "./index.css";
import "./style/nav.css";
import "./style/markdown.css";
import "./style/prose.css";
dayjs.extend(utc);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
