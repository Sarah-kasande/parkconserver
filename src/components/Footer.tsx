
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-conservation-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <span className="ml-2 text-xl font-semibold">
              PARK PRO
              </span>
            </Link>
            <p className="mt-2 text-conservation-200 text-sm">
              Dedicated to preserving natural habitats and promoting sustainable environmental practices.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-conservation-200 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-conservation-200 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-conservation-200 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-conservation-200 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-conservation-200">
              <li><Link to="/" className="nav-item nav-item-active">Home</Link></li>
              <li><Link to="/services" className="nav-item">Partnaire Services</Link></li>
              <li><Link to="/book-tour" className="nav-item">Book Tours</Link></li>
              <li><Link to="/donate" className="nav-item">Make Donations</Link></li>
              <li><Link to="/visitors" className="nav-item">Visitors</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2 text-conservation-200">
              <li><Link to="#" className="hover:text-white">Volunteer</Link></li>
              <li><Link to="#" className="hover:text-white">Partner With Us</Link></li>
              <li><Link to="#" className="hover:text-white">Career Opportunities</Link></li>
              <li><Link to="#" className="hover:text-white">Research</Link></li>
              <li><Link to="#" className="hover:text-white">Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4 text-conservation-200">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-conservation-400" />
                <span>Akagera Motors National Office | CHIC Building</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 flex-shrink-0 text-conservation-400" />
                <span>(+250) 781 846 877</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 flex-shrink-0 text-conservation-400" />
                <span>contact@parkpro.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-conservation-800 mt-12 pt-8 text-sm text-conservation-300 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} PARK PRO. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="#" className="hover:text-white">Privacy Policy</Link>
            <Link to="#" className="hover:text-white">Terms of Service</Link>
            <Link to="#" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
