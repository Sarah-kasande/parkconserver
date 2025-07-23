import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Save, Trash2, Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface BudgetData {
  id: string;
  title: string;
  fiscal_year: string;
  total_amount: number;
  park_name: string;
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
  created_by_full_name: string; 
  items: BudgetItem[];
}

interface ParkIncome {
  donations: number;
  tours: number;
  government_support: number;
  total_income: number;
}

interface ParkExpenses {
  fund_requests: number;
  extra_funds: number;
  emergency: number;
  total_expenses: number;
}

const PARKS = [
  'Volcanoes National Park',
  'Nyungwe National Park',
  'Akagera National Park',
  'Gishwati-Mukura National Park',
];

const Budget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null);
  const [budgetTitle, setBudgetTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [parkName, setParkName] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvedBudgets, setApprovedBudgets] = useState<BudgetData[]>([]);
  const [rejectedBudgets, setRejectedBudgets] = useState<BudgetData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [parkIncome, setParkIncome] = useState<ParkIncome | null>(null);
  const [parkExpenses, setParkExpenses] = useState<ParkExpenses | null>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  useEffect(() => {
    fetchBudgets();
    fetchBudgetHistory();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/government/budgets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budgets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetHistory = async () => {
    setLoadingHistory(true);
    try {
      const [approvedResponse, rejectedResponse] = await Promise.all([
        fetch('http://localhost:5000/api/government/budgets/approved', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('http://localhost:5000/api/government/budgets/rejected', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      ]);

      if (!approvedResponse.ok || !rejectedResponse.ok) {
        throw new Error('Failed to fetch budget history');
      }

      const approvedData = await approvedResponse.json();
      const rejectedData = await rejectedResponse.json();

      setApprovedBudgets(approvedData);
      setRejectedBudgets(rejectedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budget history',
        variant: 'destructive',
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchParkFinancials = async (parkName: string) => {
    setLoadingFinancials(true);
    try {
      const [incomeRes, expensesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/government/park-income/${encodeURIComponent(parkName)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`http://localhost:5000/api/government/park-expenses/${encodeURIComponent(parkName)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        })
      ]);

      if (!incomeRes.ok || !expensesRes.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const income = await incomeRes.json();
      const expenses = await expensesRes.json();

      setParkIncome(income);
      setParkExpenses(expenses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive',
      });
    } finally {
      setLoadingFinancials(false);
    }
  };

  const selectBudget = async (budget: BudgetData) => {
    setSelectedBudget(budget);
    setBudgetTitle(budget.title);
    setFiscalYear(budget.fiscal_year);
    setParkName(budget.park_name);
    setBudgetItems(budget.items.map((item, index) => ({ ...item, id: `${index + 1}` })));
    await fetchParkFinancials(budget.park_name);
  };

  const addNewBudgetItem = () => {
    setBudgetItems([
      ...budgetItems,
      { id: `${budgetItems.length + 1}`, category: '', description: '', amount: 0 },
    ]);
  };

  const removeBudgetItem = (idToRemove: string) => {
    if (budgetItems.length === 1) {
      toast({
        title: 'Cannot remove item',
        description: 'A budget must have at least one item',
        variant: 'destructive',
      });
      return;
    }
    setBudgetItems(budgetItems.filter(item => item.id !== idToRemove));
  };

  const updateBudgetItem = (id: string, field: string, value: string | number) => {
    setBudgetItems(
      budgetItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getTotalAmount = () => {
    return budgetItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const validateBudget = () => {
    if (!budgetTitle.trim() || !fiscalYear.trim() || !parkName) {
      return 'Please fill in the budget title, fiscal year, and park name';
    }
    const invalidItems = budgetItems.filter(
      item => !item.category.trim() || !item.description.trim() || item.amount <= 0
    );
    if (invalidItems.length > 0) {
      return 'Please fill in all budget items with valid amounts';
    }
    return null;
  };

  const handleUpdateBudget = async () => {
    const validationError = validateBudget();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/government/budgets/${selectedBudget?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: budgetTitle,
          fiscal_year: fiscalYear,
          park_name: parkName,
          items: budgetItems,
          total_amount: getTotalAmount(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update budget');
      }

      toast({
        title: 'Success',
        description: `Budget "${budgetTitle}" updated successfully`,
      });
      resetForm();
      await fetchBudgets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update budget',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/government/budgets/${selectedBudget?.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status,
          reason: `Budget ${status} by government officer`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${status} budget`);
      }

      toast({
        title: `Budget ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Budget "${selectedBudget?.title}" has been ${status}`,
      });
      resetForm();
      await Promise.all([fetchBudgets(), fetchBudgetHistory()]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${status} budget`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
    }
  };

  const resetForm = () => {
    setSelectedBudget(null);
    setBudgetTitle('');
    setFiscalYear('');
    setParkName('');
    setBudgetItems([]);
  };

  const renderBudgetTable = (budgets: BudgetData[], loading: boolean, title: string) => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Fiscal Year</TableHead>
              <TableHead>Park Name</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No {title.toLowerCase()} budgets found.</TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.title}</TableCell>
                  <TableCell>{budget.fiscal_year}</TableCell>
                  <TableCell>{budget.park_name}</TableCell>
                  <TableCell>${budget.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{budget.created_by_full_name}</TableCell>
                  <TableCell>{new Date(budget.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => selectBudget(budget)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const FinancialDetails = ({ income, expenses, loading }: { 
    income: ParkIncome | null; 
    expenses: ParkExpenses | null;
    loading: boolean;
  }) => {
    if (loading) {
      return <div className="text-center py-4">Loading financial data...</div>;
    }

    if (!income || !expenses) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Park Income</CardTitle>
            <CardDescription>Breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Donations</TableCell>
                  <TableCell>${income.donations.toLocaleString()}</TableCell>
                  <TableCell>{((income.donations / income.total_income) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tour Bookings</TableCell>
                  <TableCell>${income.tours.toLocaleString()}</TableCell>
                  <TableCell>{((income.tours / income.total_income) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Government Support</TableCell>
                  <TableCell>${income.government_support.toLocaleString()}</TableCell>
                  <TableCell>{((income.government_support / income.total_income) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Total Income</TableCell>
                  <TableCell>${income.total_income.toLocaleString()}</TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Park Expenses</CardTitle>
            <CardDescription>Breakdown of expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Fund Requests</TableCell>
                  <TableCell>${expenses.fund_requests.toLocaleString()}</TableCell>
                  <TableCell>{((expenses.fund_requests / expenses.total_expenses) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Extra Funds</TableCell>
                  <TableCell>${expenses.extra_funds.toLocaleString()}</TableCell>
                  <TableCell>{((expenses.extra_funds / expenses.total_expenses) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Emergency Requests</TableCell>
                  <TableCell>${expenses.emergency.toLocaleString()}</TableCell>
                  <TableCell>{((expenses.emergency / expenses.total_expenses) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell>${expenses.total_expenses.toLocaleString()}</TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Budget Review"
            subtitle="Review and manage park budgets"
          />
          <main className="p-6 space-y-6">
            {selectedBudget ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Budget: {selectedBudget.title}</CardTitle>
                  <CardDescription>Modify budget details and items before approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FinancialDetails 
                    income={parkIncome} 
                    expenses={parkExpenses}
                    loading={loadingFinancials}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budget-title">Budget Title</Label>
                      <Input
                        id="budget-title"
                        value={budgetTitle}
                        onChange={(e) => setBudgetTitle(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscal-year">Fiscal Year</Label>
                      <Input
                        id="fiscal-year"
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="park-name">National Park</Label>
                      <Select value={parkName} onValueChange={setParkName} disabled={isSubmitting}>
                        <SelectTrigger id="park-name">
                          <SelectValue placeholder="Select a park" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARKS.map((park) => (
                            <SelectItem key={park} value={park}>{park}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Budget Items</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNewBudgetItem}
                        className="flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        <PlusCircle size={16} />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {budgetItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-md">
                          <div className="col-span-12 md:col-span-3 space-y-2">
                            <Label htmlFor={`category-${item.id}`}>Category</Label>
                            <Input
                              id={`category-${item.id}`}
                              value={item.category}
                              onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-span-12 md:col-span-5 space-y-2">
                            <Label htmlFor={`description-${item.id}`}>Description</Label>
                            <Input
                              id={`description-${item.id}`}
                              value={item.description}
                              onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-span-10 md:col-span-3 space-y-2">
                            <Label htmlFor={`amount-${item.id}`}>Amount ($)</Label>
                            <Input
                              id={`amount-${item.id}`}
                              type="number"
                              min="0"
                              value={item.amount || ''}
                              onChange={(e) => updateBudgetItem(item.id, 'amount', Number(e.target.value))}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1 flex items-end justify-end h-full pb-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeBudgetItem(item.id)}
                              disabled={isSubmitting}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-6">
                      <div className="bg-gray-100 px-6 py-3 rounded-md">
                        <span className="text-gray-700">Total: </span>
                        <span className="font-bold text-lg">${getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateBudget}
                      className="flex items-center gap-1"
                      disabled={isSubmitting}
                    >
                      <Save size={16} />
                      Update Budget
                    </Button>
                    <Button
                      onClick={() => setShowApproveDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setShowRejectDialog(true)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <>
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Budgets</CardTitle>
                  <CardDescription>Review budgets submitted by finance officers</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading budgets...</p>
                  ) : budgets.length === 0 ? (
                    <p>No submitted budgets found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Fiscal Year</TableHead>
                          <TableHead>Park Name</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgets.map((budget) => (
                          <TableRow key={budget.id}>
                            <TableCell>{budget.title}</TableCell>
                            <TableCell>{budget.fiscal_year}</TableCell>
                            <TableCell>{budget.park_name}</TableCell>
                            <TableCell>${budget.total_amount.toLocaleString()}</TableCell>
                            <TableCell>{new Date(budget.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button onClick={() => selectBudget(budget)}>Review</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget History</CardTitle>
                    <CardDescription>View approved and rejected budgets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="approved" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="approved">Approved Budgets</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected Budgets</TabsTrigger>
                      </TabsList>
                      <TabsContent value="approved" className="mt-4">
                        {renderBudgetTable(approvedBudgets, loadingHistory, "Approved")}
                      </TabsContent>
                      <TabsContent value="rejected" className="mt-4">
                        {renderBudgetTable(rejectedBudgets, loadingHistory, "Rejected")}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the budget "{selectedBudget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateStatus('approved')} disabled={isSubmitting}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the budget "{selectedBudget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateStatus('rejected')} disabled={isSubmitting}>
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Budget;