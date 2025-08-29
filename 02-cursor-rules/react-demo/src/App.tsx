import { Routes, Route, Link } from 'react-router-dom'
import WithRules from './with-rules/pages'
import WithoutRules from './without-rules/pages'
import ProductDetail from './without-rules/pages/product-detail'
import ProductDetailWithRules from './with-rules/pages/product-detail'
import './App.css'

function App() {
  return (
    <div>
      <nav>
        <Link to="/with-rules">With Rules</Link> | <Link to="/without-rules">Without Rules</Link>
      </nav>
      <Routes>
        <Route path="/with-rules" element={<WithRules />} />
        <Route path="/with-rules/product/:id" element={<ProductDetailWithRules />} />
        <Route path="/without-rules" element={<WithoutRules />} />
        <Route path="/without-rules/product-detail" element={<ProductDetail />} />
        <Route path="/" element={<div>Select a page from the navigation</div>} />
      </Routes>
    </div>
  )
}

export default App
