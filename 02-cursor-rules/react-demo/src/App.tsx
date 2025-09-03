import { Routes, Route, Link } from 'react-router-dom'
import WithRules from './with-rules/pages'
import WithoutRules from './without-rules/pages'
import ProductDetail from './without-rules/pages/product-detail'
import ProductDetailWithRules from './with-rules/pages/product-detail'
import WishlistPage from './with-rules/pages/wishlist'
import WishlistSummary from './with-rules/widgets/wishlist/WishlistSummary'
import './App.css'

function App() {
  return (
    <div>
      {/* 개선된 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link 
              to="/with-rules"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              With Rules
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              to="/without-rules"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Without Rules
            </Link>
          </div>
          
          {/* 위시리스트 요약 */}
          <WishlistSummary />
        </div>
      </nav>

      <Routes>
        <Route path="/with-rules" element={<WithRules />} />
        <Route path="/with-rules/product/:id" element={<ProductDetailWithRules />} />
        <Route path="/with-rules/wishlist" element={<WishlistPage />} />
        <Route path="/without-rules" element={<WithoutRules />} />
        <Route path="/without-rules/product-detail" element={<ProductDetail />} />
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                상품 검색 데모
              </h1>
              <p className="text-gray-600 mb-6">
                Cursor Rules 적용 여부에 따른 코드 품질 비교를 확인해보세요
              </p>
              <div className="space-x-4">
                <Link 
                  to="/with-rules"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  With Rules 보기
                </Link>
                <Link 
                  to="/without-rules"
                  className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Without Rules 보기
                </Link>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
