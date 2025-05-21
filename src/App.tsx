import { BrowserRouter as Router, Routes, Route } from 'react-router';

import Home from './pages/Home';
import VisualizerIndex from './pages/visualizer';
import CanvasVisualizer from './pages/visualizer/Canvas';
import SVGVisualizer from './pages/visualizer/SVG';
import WebGLVisualizer from './pages/visualizer/WebGL';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/visualizer" element={<VisualizerIndex />} />
        <Route path="/visualizer/svg" element={<SVGVisualizer />} />
        <Route path="/visualizer/canvas" element={<CanvasVisualizer />} />
        <Route path="/visualizer/webgl" element={<WebGLVisualizer />} />
      </Routes>
    </Router>
  );
}
