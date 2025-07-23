
                    # Park Conservation Hub - Rwanda Tourism Management System

## Project Overview
The Park Conservation Hub is a comprehensive tourism management system designed for Rwanda's national parks. The system facilitates park management, tourism activities, and conservation efforts through various user roles and features.

## Local Development Environment

### System Requirements
- Windows 10 Operating System
- Node.js v16 or higher
- Python 3.x
- MySQL Server
- phpMyAdmin
- Git
- VS Code (recommended)
- Modern web browser (Chrome/Firefox/Edge)
- Minimum 4GB RAM
- 2GHz processor
- 20GB storage space

### Development Tools
- VS Code with extensions:
  - Python
  - JavaScript/TypeScript
  - MySQL
  - Git
  - ESLint
  - Prettier
- phpMyAdmin for database management
- Postman for API testing
- Git for version control

## System Architecture

### Frontend
- Built with React + TypeScript
- Uses Vite as the build tool
- Implements Tailwind CSS for styling
- Features a modern, responsive UI design
- Component-based architecture
- State management with React Query
- Form handling with React Hook Form
- UI components from shadcn/ui
- Local development server (port 3000)

### Backend
- Flask-based REST API
- MySQL database (via phpMyAdmin)
- JWT-based authentication
- CORS-enabled for secure cross-origin requests
- Python 3.x
- Flask-SQLAlchemy for ORM
- Flask-JWT-Extended for authentication
- Flask-CORS for cross-origin support
- Local development server (port 5000)

### Database
- MySQL Server
- phpMyAdmin interface
- Local database connection
- Database backup system
- Query optimization
- Index management
- User permissions
- Data migration tools

## Local Development Setup

### 1. Database Setup
1. Install MySQL Server
2. Install phpMyAdmin
3. Create database:
   ```sql
   CREATE DATABASE park_conservation;
   ```
4. Import schema from `Backend/newpark_conservation.sql`
5. Configure database connection in `Backend/server.py`

### 2. Backend Setup
1. Create Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r Backend/requirements.txt
   ```
3. Configure environment variables:
   - Create `.env` file in Backend directory
   - Set required environment variables
4. Run Flask server:
   ```bash
   python Backend/server.py
   ```

### 3. Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   - Create `.env` file in root directory
   - Set required environment variables
3. Start development server:
   ```bash
   npm run dev
   ```

### 4. Development Workflow
1. Database Management:
   - Use phpMyAdmin for database operations
   - Regular database backups
   - Monitor query performance
   - Manage user permissions

2. Backend Development:
   - Follow Python coding standards
   - Use virtual environment
   - Regular dependency updates
   - API documentation
   - Unit testing

3. Frontend Development:
   - Follow React best practices
   - Component documentation
   - State management
   - Responsive design
   - Cross-browser testing

4. Version Control:
   - Use Git for version control
   - Regular commits
   - Feature branches
   - Pull requests
   - Code review

## User Roles and Features

### 1. Visitors
- Register and login to the system
- Book tours to national parks
- View available services
- Make donations to parks
- Manage personal profile
- View booking history
- Access park information
- Submit feedback

### 2. Park Staff
- Manage park operations
- Submit fund requests
- Track park activities
- Manage visitor services
- Update park information
- Handle emergency situations
- Monitor park resources
- Generate daily reports

### 3. Finance Officers
- Manage financial transactions
- Process donations
- Handle tour bookings
- Manage fund requests
- Create and manage budgets
- Process emergency requests
- Track extra funds requests
- Generate financial reports

### 4. Government Officers
- Oversee park operations
- Approve/reject budgets
- Monitor park income and expenses
- Handle emergency requests
- Manage extra funds allocation
- View comprehensive park statistics
- Set park policies
- Monitor conservation efforts

### 5. Auditors
- Review financial transactions
- Generate financial reports
- Monitor budget compliance
- Track fund utilization
- Verify financial records
- Conduct system audits
- Generate compliance reports
- Monitor system security

### 6. Administrators
- Manage user accounts
- Monitor system activities
- View system statistics
- Handle email communications
- Manage overall system configuration
- Set user permissions
- Monitor system performance
- Manage system backups

## Key Features

### Tour Management
- Tour booking system
- Tour scheduling
- Payment processing
- Booking history tracking
- Tour guide assignment
- Visitor capacity management
- Tour package customization
- Special requirements handling

### Financial Management
- Donation processing
- Budget creation and approval
- Fund request management
- Emergency fund requests
- Financial reporting
- Payment gateway integration
- Transaction tracking
- Financial analytics

### Park Services
- Service provider management
- Service booking
- Service status tracking
- Service provider payments
- Service quality monitoring
- Service feedback system
- Service scheduling
- Resource allocation

### Emergency Management
- Emergency fund requests
- Emergency situation tracking
- Quick response system
- Emergency fund allocation
- Emergency contact management
- Resource mobilization
- Incident reporting
- Response coordination

### Reporting and Analytics
- Financial reports
- Visitor statistics
- Park performance metrics
- Budget utilization reports
- Conservation impact reports
- Service quality reports
- Emergency response reports
- System usage analytics

## Detailed Feature Descriptions

### 1. User Management System
#### Authentication & Authorization
- **User Registration**: Secure registration process for all user types with email verification
- **Login System**: JWT-based authentication with role-based access control
- **Password Management**: Secure password hashing, reset functionality, and change password features
- **Session Management**: Secure session handling with automatic timeout and refresh tokens
- **Role-Based Access**: Granular permissions for different user types (Visitors, Park Staff, Finance, Government, Auditors, Administrators)

#### Profile Management
- **Personal Information**: Users can update their personal details, contact information, and preferences
- **Profile Picture**: Upload and manage profile pictures with automatic resizing
- **Account Settings**: Manage notification preferences, language settings, and security options
- **Activity History**: View login history, actions performed, and system interactions

### 2. Tour Management System
#### Booking System
- **Tour Selection**: Browse available tours with detailed descriptions, schedules, and pricing
- **Booking Process**: Step-by-step booking wizard with real-time availability checking
- **Payment Integration**: Secure payment processing with multiple payment options
- **Booking Confirmation**: Automated email/SMS confirmations with booking details
- **Cancellation Management**: Handle tour cancellations with refund processing

#### Tour Operations
- **Schedule Management**: Create and manage tour schedules with capacity limits
- **Guide Assignment**: Assign and manage tour guides based on availability and expertise
- **Visitor Tracking**: Real-time tracking of visitors during tours
- **Special Requirements**: Handle special needs, dietary requirements, and accessibility needs
- **Tour Packages**: Create and manage different tour packages with varying durations and activities

### 3. Financial Management System
#### Donation Processing
- **Donation Types**: Support for one-time and recurring donations
- **Payment Methods**: Multiple payment gateway integration
- **Donation Tracking**: Track donation history and impact
- **Receipt Generation**: Automated receipt generation and email delivery
- **Anonymous Donations**: Support for anonymous donations with proper tracking

#### Budget Management
- **Budget Creation**: Create and manage budgets for different departments
- **Approval Workflow**: Multi-level approval process for budget requests
- **Expense Tracking**: Track expenses against budget allocations
- **Financial Reports**: Generate comprehensive financial reports
- **Budget Analytics**: Analyze budget utilization and performance

#### Fund Request System
- **Request Submission**: Submit fund requests with detailed justifications
- **Approval Process**: Multi-level approval workflow
- **Tracking System**: Track request status and history
- **Emergency Funds**: Special handling for emergency fund requests
- **Documentation**: Attach supporting documents and receipts

### 4. Emergency Management System
#### Emergency Response
- **Quick Response**: Rapid emergency fund request processing
- **Resource Allocation**: Efficient allocation of emergency resources
- **Situation Tracking**: Real-time tracking of emergency situations
- **Communication System**: Automated notifications to relevant stakeholders
- **Documentation**: Maintain emergency response records

#### Resource Management
- **Inventory Tracking**: Track emergency resources and supplies
- **Resource Allocation**: Manage resource distribution during emergencies
- **Maintenance Schedule**: Track maintenance of emergency equipment
- **Training Records**: Maintain staff training records for emergency response
- **Resource Analytics**: Analyze resource utilization and needs

### 5. Park Services Management
#### Service Provider Management
- **Provider Registration**: Register and manage service providers
- **Service Catalog**: Maintain catalog of available services
- **Quality Control**: Monitor and maintain service quality
- **Payment Processing**: Handle service provider payments
- **Performance Tracking**: Track provider performance and ratings

#### Service Booking
- **Service Selection**: Browse and select available services
- **Booking Management**: Handle service bookings and cancellations
- **Schedule Management**: Manage service schedules and availability
- **Customer Feedback**: Collect and analyze customer feedback
- **Service Analytics**: Track service performance and popularity

### 6. Reporting and Analytics
#### Financial Reports
- **Revenue Reports**: Track revenue from tours, donations, and services
- **Expense Reports**: Monitor expenses and budget utilization
- **Profit Analysis**: Analyze profit margins and financial performance
- **Tax Reports**: Generate tax-related reports and documentation
- **Audit Reports**: Prepare reports for internal and external audits

#### Operational Reports
- **Visitor Statistics**: Track visitor numbers and demographics
- **Tour Performance**: Analyze tour popularity and performance
- **Service Metrics**: Monitor service quality and customer satisfaction
- **Resource Utilization**: Track resource usage and efficiency
- **Emergency Response**: Analyze emergency response effectiveness

#### Conservation Impact
- **Conservation Metrics**: Track conservation efforts and impact
- **Environmental Impact**: Monitor environmental changes and effects
- **Community Impact**: Measure impact on local communities
- **Sustainability Metrics**: Track sustainability initiatives
- **Progress Reports**: Generate progress reports for conservation projects

### 7. Communication System
#### Internal Communication
- **Staff Messaging**: Internal messaging system for staff
- **Announcements**: System-wide announcements and notifications
- **Task Management**: Assign and track tasks
- **Document Sharing**: Secure document sharing and collaboration
- **Meeting Management**: Schedule and manage meetings

#### External Communication
- **Visitor Communication**: Automated communication with visitors
- **Email Notifications**: Automated email notifications
- **SMS Alerts**: Important alerts via SMS
- **Social Media Integration**: Share updates on social media
- **Newsletter System**: Regular newsletter distribution

### 8. Security and Compliance
#### Data Security
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **Access Control**: Granular access control for all features
- **Audit Logging**: Comprehensive audit logging of all actions
- **Data Backup**: Regular automated backups
- **Recovery System**: Data recovery procedures

#### Compliance Management
- **Regulatory Compliance**: Ensure compliance with local regulations
- **Data Protection**: Implement data protection measures
- **Privacy Controls**: Manage user privacy settings
- **Compliance Reporting**: Generate compliance reports
- **Policy Management**: Maintain and update policies

## Security Features
- JWT-based authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints
- CORS security
- Data encryption
- Session management
- Audit logging
- Local development security
- Database access control

## Database Structure
The system uses a MySQL database with tables for:
- User management (multiple user types)
- Tour bookings
- Donations
- Fund requests
- Budgets
- Services
- Emergency requests
- Financial transactions
- Park resources
- Visitor feedback
- System logs
- Audit trails

## API Endpoints
The system provides RESTful API endpoints for:
- User authentication
- Tour management
- Financial operations
- Park services
- Emergency management
- Reporting and analytics
- Resource management
- System administration

## Local Development Best Practices
1. Code Organization:
   - Follow project structure
   - Use meaningful names
   - Document code
   - Regular refactoring

2. Database Management:
   - Regular backups
   - Optimize queries
   - Monitor performance
   - Secure access

3. Testing:
   - Unit tests
   - Integration tests
   - API testing
   - UI testing
   - Cross-browser testing

4. Documentation:
   - Code documentation
   - API documentation
   - Database documentation
   - Setup guides
   - User guides

## Troubleshooting Guide
1. Database Issues:
   - Check MySQL service
   - Verify credentials
   - Check connection settings
   - Review error logs

2. Backend Issues:
   - Check Python version
   - Verify dependencies
   - Check environment variables
   - Review server logs

3. Frontend Issues:
   - Check Node.js version
   - Clear npm cache
   - Verify dependencies
   - Check browser console

4. General Issues:
   - Check port availability
   - Verify network settings
   - Review error logs
   - Check file permissions

## Future Enhancements
- Mobile application development
- Real-time monitoring system
- Advanced analytics dashboard
- Integration with external payment gateways
- Enhanced emergency response system
- Wildlife tracking integration
- Visitor feedback system
- AI-powered park management
- Virtual tour experiences
- Conservation impact tracking
- Community engagement features
- Environmental monitoring integration
