
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-conservation-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-semibold text-conservation-800">
              PARK PRO
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link to="/" className="nav-item nav-item-active">Home</Link>
            <Link to="/services" className="nav-item">Partnaire Services</Link>
            <Link to="/book-tour" className="nav-item">Book Tours</Link>
            <Link to="/donate" className="nav-item">Make Donations</Link>
            <Link to="/visitors" className="nav-item">Visitors</Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button asChild variant="default" className="bg-conservation-600 hover:bg-conservation-700">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-conservation-500 hover:text-conservation-600 hover:bg-conservation-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-conservation-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-conservation-700 bg-conservation-100">
              Home
            </Link>
            <Link to="#" className="block px-3 py-2 rounded-md text-base font-medium text-conservation-600 hover:text-conservation-700 hover:bg-conservation-100">
              About
            </Link>
            <Link to="#" className="block px-3 py-2 rounded-md text-base font-medium text-conservation-600 hover:text-conservation-700 hover:bg-conservation-100">
              Parks
            </Link>
            <Link to="#" className="block px-3 py-2 rounded-md text-base font-medium text-conservation-600 hover:text-conservation-700 hover:bg-conservation-100">
              Contact
            </Link>
            <div className="mt-4 px-3">
              <Button asChild variant="default" className="w-full bg-conservation-600 hover:bg-conservation-700">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
