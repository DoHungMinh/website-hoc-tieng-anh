import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Practice from './components/Practice';
import Progress from './components/Progress';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setShowAuth(true)} />
      <Hero />
      <Features />
      <Practice />
      <Progress />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;