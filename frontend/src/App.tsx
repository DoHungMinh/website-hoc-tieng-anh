import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Practice from './components/Practice';
import Progress from './components/Progress';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
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