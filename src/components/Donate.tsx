import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Heart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const parkTours = [
  {
    id: 1,
    name: 'Volcanoes National Park',
    features: ['Mountain Gorillas', 'Volcanoes', 'Golden Monkeys']
  },
  {
    id: 2,
    name: 'Nyungwe National Park',
    features: ['Canopy Walkway', 'Chimpanzees', 'Rainforest']
  },
  {
    id: 3,
    name: 'Akagera National Park',
    features: ['Big Five', 'Savannah', 'Lakes']
  },
  {
    id: 4,
    name: 'Gishwati-Mukura National Park',
    features: ['Primates', 'Bird Watching', 'Restored Forest']
  }
];


const donationAmounts = [25, 50, 100, 250, 500];

const Donate = () => {
  const [searchParams] = useSearchParams();
  const initialParkId = searchParams.get('park') || '';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPark, setSelectedPark] = useState(initialParkId);
  const [donationType, setDonationType] = useState('oneTime');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setAmount('custom');
    }
  };

  const getDonationAmount = () => {
    if (amount === 'custom' && customAmount) {
      return parseFloat(customAmount);
    }
    return amount ? parseFloat(amount) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const donationAmount = getDonationAmount();

    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: 'Invalid donation amount',
        description: 'Please enter a valid donation amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!firstName || !lastName || !email || !selectedPark) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationType,
          amount: donationAmount,
          parkName: selectedPark,
          firstName,
          lastName,
          email,
          message,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Thank you for your donation!',
          description: "You'll receive an email confirmation shortly.",
        });
        navigate('/payment', {
          state: {
            type: 'donation',
            amount: donationAmount,
            details: {
              donationType,
              parkName: selectedPark,
              email,
              message,
            },
          },
        });
      } else {
        throw new Error('Failed to submit donation');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit donation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>Support the conservation of natural habitats.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Label>Donation Type</Label>
                <RadioGroup value={donationType} onValueChange={setDonationType} className="flex space-x-4 mt-2">
                  <RadioGroupItem value="oneTime" id="oneTime" />
                  <Label htmlFor="oneTime">One-time</Label>
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </RadioGroup>

                <Label>Amount</Label>
                <RadioGroup value={amount} onValueChange={handleAmountChange} className="grid grid-cols-3 gap-2 mt-2">
                  {donationAmounts.map((amt) => (
                    <div key={amt} className="flex items-center">
                      <RadioGroupItem value={amt.toString()} id={`amount-${amt}`} />
                      <Label htmlFor={`amount-${amt}`}>${amt}</Label>
                    </div>
                  ))}
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Custom Amount"
                    className="mt-2"
                  />
                </RadioGroup>

                <Label>Select Park</Label>
                <Select value={selectedPark} onValueChange={setSelectedPark}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a park" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkTours.map((park) => (
                      <SelectItem key={park.id} value={park.name}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />

                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <Label>Message (Optional)</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />

                <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full mt-5 bg-conservation-600 hover:bg-conservation-700 ${isSubmitting && "opacity-50 cursor-not-allowed"}`}
              >
              <Heart className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Complete Donation'}
            </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Donate;
