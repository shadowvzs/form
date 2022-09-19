import React from "react";
import { createRoot } from "react-dom/client";
import App from './app';
import "./app.css";

const handler = () => {
    document.removeEventListener('DOMContentLoaded', handler);
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
};

document.addEventListener('DOMContentLoaded', handler);
