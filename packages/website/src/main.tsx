import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '../app/globals.css';
import { isProd } from './lib/utils.ts';

if (isProd()) {
	console.log = () => {};
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
