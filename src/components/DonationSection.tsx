import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, CreditCard, PiggyBank, Leaf, Shield, Landmark, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const predefinedAmounts = [25, 50, 100, 250, 500];

interface DonationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const categories: DonationCategory[] = [
  {
    id: 'wildlife',
    name: 'Wildlife Conservation',
    description: 'Help protect endangered species and their habitats',
    icon: <PiggyBank className="h-10 w-10 text-primary" />
  },
  {
    id: 'forest',
    name: 'Forest Preservation',
    description: 'Support efforts to prevent deforestation and plant new trees',
    icon: <Leaf className="h-10 w-10 text-primary" />
  },
  {
    id: 'education',
    name: 'Environmental Education',
    description: 'Fund educational programs for schools and local communities',
    icon: <Landmark className="h-10 w-10 text-primary" />
  },
  {
    id: 'protection',
    name: 'Park Protection',
    description: 'Support park rangers and security measures',
    icon: <Shield className="h-10 w-10 text-primary" />
  }
];

const DonationSection = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('wildlife');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    
    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Please select a donation category');
      return;
    }
    
    setIsPaymentDialogOpen(true);
  };

  const processDonation = () => {
    const { name, email, cardNumber, cardName, expiry, cvv } = donorInfo;
    
    if (!name || !email || !cardNumber || !cardName || !expiry || !cvv) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentDialogOpen(false);
      
      // Reset form
      setSelectedAmount(null);
      setCustomAmount('');
      setDonorInfo({
        name: '',
        email: '',
        message: '',
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
      });
      
      toast.success('Thank you for your donation! A confirmation has been sent to your email.');
    }, 1500);
  };

  const getEffectiveAmount = () => {
    return selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  };

  return (
    <section id="donate" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary-100 text-primary px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Support Our Mission</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Make a Donation Today
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Your contribution helps us protect wildlife, preserve habitats, and educate future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <form onSubmit={handleDonationSubmit}>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-primary" />
                  Choose Amount
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={`py-3 px-4 rounded-lg border ${
                        selectedAmount === amount
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-primary hover:text-primary'
                      } transition-colors duration-200 text-center font-medium`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="customAmount">Custom Amount</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      id="customAmount"
                      name="customAmount"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="Enter amount"
                      className="pl-7"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5 text-primary" />
                  Select Category
                </h3>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className={`p-4 rounded-lg border cursor-pointer hover:border-primary transition-colors ${
                      selectedCategory === category.id ? 'border-primary bg-primary-50' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem
                        value={category.id}
                        id={category.id}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={category.id}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="mb-2">{category.icon}</div>
                        <div className="font-medium">{category.name}</div>
                        <p className="text-sm text-gray-500 text-center mt-1">
                          {category.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={donorInfo.name}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={donorInfo.email}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Share why you're donating..."
                    value={donorInfo.message}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                <Heart className="mr-2 h-5 w-5" /> Donate ${getEffectiveAmount() > 0 ? getEffectiveAmount().toFixed(2) : '0.00'}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold mb-3 text-primary-900">Your Impact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                  </div>
                  <p className="text-gray-700">$25 can provide a day of ranger patrol to protect wildlife</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                  </div>
                  <p className="text-gray-700">$50 can plant 10 new trees in areas affected by deforestation</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                  </div>
                  <p className="text-gray-700">$100 can provide educational materials for 20 students</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                  </div>
                  <p className="text-gray-700">$250 can fund habitat restoration for endangered species</p>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Why Donate?</h3>
              <p className="text-gray-700 mb-4">
                Your donation directly supports our conservation efforts and helps preserve natural habitats for future generations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <span>Tax-deductible contribution</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <span>100% of funds go to conservation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <span>Regular impact updates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                  <span>Donor recognition program</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete your payment to process your donation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardNumber" className="text-right">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={donorInfo.cardNumber}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardName" className="text-right">
                Name on Card
              </Label>
              <Input
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                value={donorInfo.cardName}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                name="expiry"
                placeholder="MM/YY"
                value={donorInfo.expiry}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cvv" className="text-right">
                CVV
              </Label>
              <Input
                id="cvv"
                name="cvv"
                type="password"
                placeholder="123"
                value={donorInfo.cvv}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="col-span-4 pt-2">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex justify-between">
                  <span>Donation Amount:</span>
                  <span className="font-medium">${getEffectiveAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Category:</span>
                  <span className="font-medium">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={processDonation} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Complete Donation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DonationSection;
