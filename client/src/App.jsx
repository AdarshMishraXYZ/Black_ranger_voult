import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateIdentity from './pages/CreateIdentity';
import GenerateQR from './pages/GenerateQR';
import VerifyQR from './pages/VerifyQR';
import Logs from './pages/Logs';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-identity" element={<CreateIdentity />} />
              <Route path="/generate-qr" element={<GenerateQR />} />
              <Route path="/verify-qr" element={<VerifyQR />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

