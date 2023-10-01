/* @refresh reload */
import './index.css';
import '@arcgis/core/assets/esri/themes/light/main.css'
import { render } from 'solid-js/web';
import { Router } from "@solidjs/router";

import App from './App';

render(() => (
    <Router>
        <App />
    </Router>
), document.getElementById('root') as HTMLElement);
