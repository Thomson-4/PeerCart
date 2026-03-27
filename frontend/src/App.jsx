import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import HomeFeed from './pages/HomeFeed';
import NeedBoard from './pages/NeedBoard';
import AddItem from './pages/AddItem';
import Profile from './pages/Profile';
import useTheme from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}>
          {/* Default Marketing Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Application Features */}
          <Route path="/feed" element={<HomeFeed />} />
          <Route path="/needs" element={<NeedBoard />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
