import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, DollarSign, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { generateTransactionId } from '@/lib/utils';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { type, amount, details } = location.state || { type: '', amount: 0, details: {} };
  
  useEffect(() => {
    if (!type || !amount) {
      navigate('/');
    }
  }, [type, amount, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpiryDate(formatExpiryDate(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all required payment fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const paymentData = {
        paymentType: type, // 'donation' or 'tour'
        amount: amount,
        cardName: cardName,
        cardNumber: cardNumber,
        expiryDate: expiryDate,
        cvv: cvv,
        customerEmail: details.email || '',
        parkName: details.park || details.parkName // Handle both formats
      };

      console.log('Sending payment data:', paymentData);

      const response = await fetch('http://localhost:5000/api/process_payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment processing failed');
      }

      setIsComplete(true);
      toast({
        title: "Payment successful!",
        description: `Your ${type} has been processed successfully.`,
      });
      
      // Store transaction ID for display
      sessionStorage.setItem('lastTransactionId', result.transactionId);

      // Redirect based on payment type
      setTimeout(() => {
        if (type === 'donation') {
          navigate('/donate', { 
            state: { 
              transactionId: result.transactionId,
              amount: amount,
              date: result.date
            }
          });
        } else {
          navigate('/book-tour', { 
            state: { 
              transactionId: result.transactionId,
              amount: amount,
              date: result.date
            }
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-conservation-50">
        <div className="max-w-2xl mx-auto">
          {!isComplete ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-conservation-900">Complete Your Payment</h1>
                <p className="mt-3 text-conservation-700">
                  {type === 'tour' ? 'Secure your tour booking with payment' : 'Finalize your donation'}
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    {type === 'tour' ? 
                      'Tour booking for ' + details.park : 
                      'Donation to ' + details.park
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center p-4 bg-conservation-100 rounded-lg mb-6">
                    <div className="font-medium">Total Amount:</div>
                    <div className="text-xl font-bold text-conservation-900">${amount.toFixed(2)}</div>
                  </div>
                
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                            className="pl-10"
                          />
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-conservation-500" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-conservation-600 hover:bg-conservation-700"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Payment'}
                  </Button>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-conservation-600">
                    <Lock className="h-4 w-4" />
                    <span>Secured by 256-bit encryption</span>
                  </div>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card className="border-conservation-300 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="mt-3 text-lg font-medium text-conservation-900">Payment Successful!</h2>
                  <p className="mt-2 text-conservation-700">
                    {type === 'tour' 
                      ? 'Your tour has been booked successfully.' 
                      : 'Thank you for your generous donation!'}
                  </p>
                  
                  <div className="mt-6 p-4 bg-conservation-50 rounded-lg text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-conservation-700">Amount:</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-conservation-700">Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-conservation-700">Transaction ID:</span>
                      <span className="font-medium">
                        {sessionStorage.getItem('lastTransactionId') || 
                        `TR-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-conservation-700">Status:</span>
                      <span className="font-medium text-green-600">Completed</span>
                    </div>
                  </div>
                  
                  <p className="mt-6 text-sm text-conservation-700">
                    {type === 'tour' 
                      ? 'A confirmation email has been sent to your email address.' 
                      : 'A receipt has been sent to your email for your records.'}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4 pt-0">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
                {type === 'tour' ? (
                  <Button 
                    className="bg-conservation-600 hover:bg-conservation-700"
                    onClick={() => window.print()}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                ) : (
                  <Button 
                    className="bg-conservation-600 hover:bg-conservation-700"
                    onClick={() => window.print()}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
