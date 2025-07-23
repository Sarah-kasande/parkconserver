import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialParkId = searchParams.get('park') || '';

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Company Info
  const [companyInfo, setCompanyInfo] = useState({
    companyType: '',
    providedService: '',
    companyName: '',
    taxId: '', // Added Tax ID field
  });

  // File Uploads
  const [files, setFiles] = useState({
    companyRegistration: null as File | null,
    applicationLetter: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  // Allowed file types
  const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [id]: value }));
    
    // Clear error for this field if exists
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleCompanyChange = (id: string, value: string) => {
    setCompanyInfo((prev) => ({ ...prev, [id]: value }));
    
    // Clear error for this field if exists
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = e.target;
    if (!files || !files[0]) {
      return;
    }
    
    const file = files[0];
    
    // File type validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [id]: 'Invalid file type. Please upload PDF, JPEG, or PNG files only.'
      }));
      e.target.value = '';
      return;
    }
    
    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({
        ...prev,
        [id]: 'File is too large. Maximum size is 5MB.'
      }));
      e.target.value = '';
      return;
    }
    
    // Clear error if file is valid
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
    
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate personal info
    if (!personalInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!personalInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(personalInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional field)
    if (personalInfo.phone && !/^\+?[0-9\s\-()]{8,}$/.test(personalInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Company info validation
    if (!companyInfo.companyType) newErrors.companyType = 'Company type is required';
    if (!companyInfo.providedService) newErrors.providedService = 'Service type is required';
    if (!companyInfo.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!companyInfo.taxId.trim()) newErrors.taxId = 'Tax ID is required';
    
    // File validation
    if (!files.companyRegistration) newErrors.companyRegistration = 'Company registration document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('firstName', personalInfo.firstName);
    formData.append('lastName', personalInfo.lastName);
    formData.append('email', personalInfo.email);
    formData.append('phone', personalInfo.phone);
    formData.append('companyType', companyInfo.companyType);
    formData.append('providedService', companyInfo.providedService);
    formData.append('companyName', companyInfo.companyName);
    formData.append('taxId', companyInfo.taxId); // Added Tax ID
    if (files.companyRegistration) {
      formData.append('companyRegistration', files.companyRegistration);
    }
    if (files.applicationLetter) {
      formData.append('applicationLetter', files.applicationLetter);
    }

    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({ title: 'Application submitted!', description: 'You will receive an update soon via email.' });
        navigate('/services');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-conservation-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-conservation-900">Partners & Services Form</h1>
            <p className="mt-3 text-conservation-700">Fill in the details below to collaborate with us.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>Provide accurate details for your partnership request.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 border-b pb-2">
                  <h3 className="text-lg font-medium text-conservation-700">Personal Information</h3>
                </div>

                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={personalInfo.firstName} 
                    onChange={handleInputChange} 
                    required 
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={personalInfo.lastName} 
                    onChange={handleInputChange} 
                    required 
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={personalInfo.email} 
                    onChange={handleInputChange} 
                    required 
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={personalInfo.phone} 
                    onChange={handleInputChange} 
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Company Information */}
                <div className="sm:col-span-2 border-b pb-2 pt-4">
                  <h3 className="text-lg font-medium text-conservation-700">Company Information</h3>
                </div>

                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select onValueChange={(value) => handleCompanyChange('companyType', value)}>
                    <SelectTrigger className={errors.companyType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Type">{companyInfo.companyType || 'Select Type'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companyType && <p className="text-red-500 text-sm mt-1">{errors.companyType}</p>}
                </div>

                <div>
                  <Label htmlFor="providedService">Service Offered</Label>
                  <Select onValueChange={(value) => handleCompanyChange('providedService', value)}>
                    <SelectTrigger className={errors.providedService ? "border-red-500" : ""}>
                      <SelectValue placeholder="Choose Service">{companyInfo.providedService || 'Choose Service'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Tour Guiders">Tour Guiders</SelectItem>
                      <SelectItem value="Accountants">Accountants</SelectItem>
                      <SelectItem value="Waiter/Waitress">Waiter/Waitress</SelectItem>
                      <SelectItem value="Housekeeper">Housekeeper</SelectItem>
                      <SelectItem value="Boat Tour Guiders">Boat Tour Guiders</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.providedService && <p className="text-red-500 text-sm mt-1">{errors.providedService}</p>}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyInfo.companyName} 
                    onChange={(e) => handleCompanyChange('companyName', e.target.value)} 
                    required 
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input 
                    id="taxId" 
                    value={companyInfo.taxId} 
                    onChange={(e) => handleCompanyChange('taxId', e.target.value)} 
                    required 
                    className={errors.taxId ? "border-red-500" : ""}
                  />
                  {errors.taxId && <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>}
                </div>

                <div>
                  <Label htmlFor="companyRegistration">Company Registration Document</Label>
                  <Input 
                    id="companyRegistration" 
                    type="file" 
                    onChange={handleFileChange} 
                    required 
                    className={errors.companyRegistration ? "border-red-500" : ""}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  {errors.companyRegistration && <p className="text-red-500 text-sm mt-1">{errors.companyRegistration}</p>}
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Allowed formats: PDF, PNG, JPEG</p>
                </div>

                <div>
                  <Label htmlFor="applicationLetter">Application Letter</Label>
                  <Input 
                    id="applicationLetter" 
                    type="file" 
                    onChange={handleFileChange} 
                    className={errors.applicationLetter ? "border-red-500" : ""}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  {errors.applicationLetter && <p className="text-red-500 text-sm mt-1">{errors.applicationLetter}</p>}
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Allowed formats: PDF, PNG, JPEG</p>
                </div>

                {/* Terms */}
                <div className="sm:col-span-2 flex items-start space-x-2 mt-6 text-sm text-gray-700">
                  <Info className="h-5 w-5 flex-shrink-0 text-gray-500" />
                  <p>
                    By submitting, you agree to our <a href="#" className="text-conservation-700 underline">terms and conditions</a>.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-conservation-600 hover:bg-conservation-700">
                    {isSubmitting ? 'Processing...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;