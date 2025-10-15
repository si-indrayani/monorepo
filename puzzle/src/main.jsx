import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Wait for the root element to be available
const waitForRoot = (callback, maxAttempts = 50) => {
  let attempts = 0;
  const checkElement = () => {
    const rootElement = document.getElementById('game-root') || document.getElementById('root');
    if (rootElement) {
      console.log('Puzzle game found root element:', rootElement);
      console.log('Element nodeType:', rootElement.nodeType);
      console.log('Element nodeName:', rootElement.nodeName);
      console.log('Element is connected:', rootElement.isConnected);
      console.log('Element ownerDocument:', rootElement.ownerDocument);
      console.log('Document body contains element:', document.body.contains(rootElement));

      // Additional React validation checks
      const isValid = rootElement &&
                     rootElement.nodeType === 1 &&
                     rootElement.nodeName === 'DIV' &&
                     rootElement.isConnected;

      console.log('Element passes basic validation:', isValid);

      if (isValid) {
        callback(rootElement);
      } else {
        console.error('Element failed validation, retrying...');
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkElement, 100);
        } else {
          console.error('Puzzle game: Root element validation failed after', maxAttempts, 'attempts');
        }
      }
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkElement, 100);
    } else {
      console.error('Puzzle game: Root element not found after', maxAttempts, 'attempts');
      console.error('Available elements with id containing "root":', Array.from(document.querySelectorAll('[id*="root"]')).map(el => el.id));
    }
  };
  checkElement();
};

waitForRoot((rootElement) => {
  console.log('Puzzle game mounting to validated element:', rootElement);
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App gameInstance={window.currentGameInstance} />
      </StrictMode>,
    );
    console.log('Puzzle game mounted successfully');
  } catch (error) {
    console.error('Puzzle game mounting failed:', error);
  }
});

