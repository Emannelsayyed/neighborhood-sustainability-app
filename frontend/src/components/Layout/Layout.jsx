import React from 'react';
import { Leaf, BarChart3, Users, DollarSign, Github, ExternalLink } from 'lucide-react';

// Header Component
export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sustainability Index</h1>
                <p className="text-sm text-gray-500">Neighborhood Assessment Tool</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>Environmental</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Social</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span>Economic</span>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-900">Sustainability Index</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A comprehensive tool for measuring neighborhood sustainability across environmental, 
              social, and economic dimensions using validated urban planning frameworks.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>14 Key Indicators</span>
              </li>
              <li className="flex items-center space-x-2">
                <Leaf className="w-4 h-4" />
                <span>Environmental Assessment</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Social Equity Analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Economic Vitality Metrics</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>LEED ND Framework</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Neighborhood Sustainability Index. Built with React and FastAPI.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Layout Component
export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;