import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import BlurDetection from './BlurDetection';
import Camera  from './Camera';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlurDetection />} />
        <Route path="/camera" element={<Camera />} />
      </Routes>
    </Router>
  );
};

export default App;
