import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
}

interface BudgetData {
  id: string;
  title: string;
  fiscal_year: string;
  park_name: string;
  total_amount: number;
  status: string;
  createdAt: string;
  items: BudgetItem[];
  created_by?: string;
  createdByName?: string;
  description?: string;
}

interface IncomeItem {
  type: string;
  amount: number;
}

interface ExpenseItem {
  type: string;
  amount: number;
}

const NATIONAL_PARKS = [
  'Volcanoes National Park',
  'Nyungwe National Park',
  'Akagera National Park',
  'Gishwati-Mukura National Park',
];

const BudgetCreation: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('existing');
  const [budgetTitle, setBudgetTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [parkName, setParkName] = useState(user?.park || '');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', category: '', description: '', amount: 0, type: 'expense' },
  ]);
  const [existingBudgets, setExistingBudgets] = useState<BudgetData[]>([]);
  const [pendingBudgets, setPendingBudgets] = useState<BudgetData[]>([]);
  const [approvedBudgets, setApprovedBudgets] = useState<BudgetData[]>([]);
  const [rejectedBudgets, setRejectedBudgets] = useState<BudgetData[]>([]);
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState({
    existing: true,
    pending: true,
    approved: true,
    rejected: true,
    income: true,
    expenses: true,
  });

  useEffect(() => {
    if (user?.park) {
      setParkName(user.park);
    }
  }, [user?.park]);

  // Fetch budgets for each tab
  const fetchBudgets = async (
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<BudgetData[]>>,
    key: keyof typeof loading
  ) => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${key} budgets`);
        }
        const data = await response.json();
        const filteredData = data.filter((budget: any) => budget.park_name === user?.park);
        const budgets = filteredData.map((budget: any) => ({
          id: budget.id,
          title: budget.title,
          fiscal_year: budget.fiscal_year,
          total_amount: Number(budget.total_amount),
          park_name: budget.park_name,
          status: budget.status,
          createdAt: new Date(budget.created_at),
          items: budget.items.map((item: any) => ({
            id: item.id.toString(),
            category: item.category,
            description: item.description,
            amount: Number(item.amount),
            type: item.type,
          })),
        }));
        setter(budgets);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to load ${key} budgets`,
          variant: 'destructive',
        });
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
  };

  // Fetch income data (donations and tours)
  const fetchIncomeData = async () => {
    try {
      const [donationsRes, toursRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/donations', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:5000/api/finance/tours', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (!donationsRes.ok || !toursRes.ok) {
        throw new Error('Failed to fetch income data');
      }

      const donationsData = await donationsRes.json();
      const toursData = await toursRes.json();

      const donationTotal = donationsData.reduce((sum: number, donation: any) => sum + Number(donation.amount), 0);
      const tourTotal = toursData.reduce((sum: number, tour: any) => sum + Number(tour.amount), 0);

      // Calculate Government Support as 15% of total income
      const baseIncome = donationTotal + tourTotal;
      const govSupport = baseIncome * 0.15 / (1 - 0.15);

      setIncomeItems([
        { type: 'Donations', amount: donationTotal },
        { type: 'Booked Tours', amount: tourTotal },
        { type: 'Government Support', amount: govSupport },
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load income data',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, income: false }));
    }
  };

  // Fetch expense data
  const fetchExpenseData = async () => {
    try {
      const [fundRequestsRes, extraFundsRes, emergencyRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/fund-requests?status=approved', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:5000/api/finance/extra-funds', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:5000/api/finance/emergency-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (!fundRequestsRes.ok || !extraFundsRes.ok || !emergencyRes.ok) {
        throw new Error('Failed to fetch expense data');
      }

      const fundRequestsData = await fundRequestsRes.json();
      const extraFundsData = await extraFundsRes.json();
      const emergencyData = await emergencyRes.json();

      const fundRequestTotal = fundRequestsData.reduce((sum: number, req: any) => sum + Number(req.amount), 0);
      const extraFundsTotal = extraFundsData
        .filter((req: any) => req.status === 'approved')
        .reduce((sum: number, req: any) => sum + Number(req.amount), 0);
      const emergencyTotal = emergencyData
        .filter((req: any) => req.status === 'approved')
        .reduce((sum: number, req: any) => sum + Number(req.amount), 0);

      setExpenseItems([
        { type: 'Park Staff Fund Requests', amount: fundRequestTotal },
        { type: 'Extra Funds Requests', amount: extraFundsTotal },
        { type: 'Emergency Requests', amount: emergencyTotal },
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expense data',
        variant: 'destructive',
      });
    } finally {
      setLoading((prev) => ({ ...prev, expenses: false }));
    }
  };

  // Refresh all budgets
  const refreshBudgets = () => {
    fetchBudgets('http://localhost:5000/api/finance/budgets?status=draft', setExistingBudgets, 'existing');
    fetchBudgets('http://localhost:5000/api/finance/budgets/pending', setPendingBudgets, 'pending');
    fetchBudgets('http://localhost:5000/api/finance/budgets/newlyapproved', setApprovedBudgets, 'approved');
    fetchBudgets('http://localhost:5000/api/finance/budgets/rejected', setRejectedBudgets, 'rejected');
    fetchIncomeData();
    fetchExpenseData();
  };

  useEffect(() => {
    refreshBudgets();
  }, []);

  const addNewBudgetItem = () => {
    setBudgetItems([
      ...budgetItems,
      { id: `${budgetItems.length + 1}`, category: '', description: '', amount: 0, type: 'expense' },
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
    setBudgetItems(budgetItems.filter((item) => item.id !== idToRemove));
  };

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: string | number | 'expense' | 'income') => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getTotalAmount = (items: { amount: number }[]) => {
    return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const getPercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(2) : '0.00';
  };

  const handleSaveDraft = async () => {
    if (!budgetTitle || !fiscalYear || !parkName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the budget title, fiscal year, and park name',
        variant: 'destructive',
      });
      return;
    }

    const invalidItems = budgetItems.filter(
      (item) => !item.category || !item.description || item.amount <= 0 || !item.type
    );
    if (invalidItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all budget items with valid amounts and types',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: budgetTitle,
          fiscal_year: fiscalYear,
          park_name: parkName,
          items: budgetItems,
          total_amount: getTotalAmount(budgetItems),
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save draft');
      }

      toast({
        title: 'Budget Saved',
        description: `Draft budget "${budgetTitle}" for ${parkName} saved successfully`,
      });
      setBudgetTitle('');
      setFiscalYear('');
      setParkName('');
      setBudgetItems([{ id: '1', category: '', description: '', amount: 0, type: 'expense' }]);
      setActiveTab('existing');
      refreshBudgets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save budget draft',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitBudget = async () => {
    if (!budgetTitle || !fiscalYear || !parkName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the budget title, fiscal year, and park name',
        variant: 'destructive',
      });
      return;
    }

    const invalidItems = budgetItems.filter(
      (item) => !item.category || !item.description || item.amount <= 0 || !item.type
    );
    if (invalidItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all budget items with valid amounts and types',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: budgetTitle,
          fiscal_year: fiscalYear,
          park_name: parkName,
          items: budgetItems,
          total_amount: getTotalAmount(budgetItems),
          status: 'submitted',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit budget');
      }

      toast({
        title: 'Budget Submitted',
        description: `Budget "${budgetTitle}" for ${parkName} submitted for approval`,
      });
      setBudgetTitle('');
      setFiscalYear('');
      setParkName('');
      setBudgetItems([{ id: '1', category: '', description: '', amount: 0, type: 'expense' }]);
      setActiveTab('pending');
      refreshBudgets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit budget',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: BudgetData['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100';
    }
  };

  const renderBudgetList = (budgets: BudgetData[], tabName: string) => (
    <div className="grid gap-6">
      {loading[tabName as keyof typeof loading] ? (
        <p>Loading {tabName} budgets...</p>
      ) : budgets.length === 0 ? (
        <p>No {tabName} budgets found.</p>
      ) : (
        <div id="budgets-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Park Name</TableHead>
                <TableHead>Total Amount</TableHead>
                {/* <TableHead>Created By</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="no-print">Update Current Budgets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.title}</TableCell>
                  <TableCell>{budget.fiscal_year}</TableCell>
                  <TableCell>{budget.park_name}</TableCell>
                  <TableCell>${budget.total_amount.toLocaleString()}</TableCell>
                  {/* <TableCell>{budget.createdByName || 'Unknown'}</TableCell> */}
                  <TableCell>
              <Badge className={getStatusColor(budget.status)}>
                {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
              </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="no-print">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBudgetTitle(budget.title);
                          setFiscalYear(budget.fiscal_year);
                          setParkName(budget.park_name);
                          setBudgetItems(budget.items);
                          setActiveTab('new');
                        }}
                      >
                Update Budget
              </Button>
              {budget.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setBudgetTitle(budget.title);
                            setFiscalYear(budget.fiscal_year);
                            setParkName(budget.park_name);
                            setBudgetItems(budget.items);
                            setActiveTab('new');
                          }}
                        >
                  Continue Editing
                </Button>
              )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  const totalIncome = getTotalAmount(incomeItems);
  const totalExpenses = getTotalAmount(expenseItems);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader 
            title="Budget Creation"
            subtitle="Create and manage park budgets"
          />
          <main className="p-6">
            <Tabs
              defaultValue="existing"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="flex justify-between items-center mb-6 gap-2">
                <TabsList>
                  <TabsTrigger value="existing">Pending Budgets</TabsTrigger>
                  <TabsTrigger value="approved">Approved Budgets</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected Budgets</TabsTrigger>
                  <TabsTrigger value="new">Create New Budget</TabsTrigger>
                </TabsList>
                <PrintDownloadTable
                  tableId="budgets-table"
                  title="Budgets Report"
                  filename="budgets_report"
                />
              </div>
              
              <TabsContent value="existing">
                {renderBudgetList(existingBudgets, 'existing')}
              </TabsContent>
              
              <TabsContent value="approved">
                {renderBudgetList(approvedBudgets, 'approved')}
              </TabsContent>
              
              <TabsContent value="rejected">
                {renderBudgetList(rejectedBudgets, 'rejected')}
              </TabsContent>
              
              <TabsContent value="new">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Budget</CardTitle>
                    <CardDescription>
                      Review income and expenses, and add new budget items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget-title">Budget Title</Label>
                        <Input 
                          id="budget-title" 
                          placeholder="e.g. Annual Park Budget 2024"
                          value={budgetTitle}
                          onChange={(e) => setBudgetTitle(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fiscal-year">Fiscal Year</Label>
                        <Input 
                          id="fiscal-year" 
                          placeholder="e.g. 2024-2025" 
                          value={fiscalYear}
                          onChange={(e) => setFiscalYear(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="park-name">National Park</Label>
                        <Input
                          id="park-name"
                          value={user?.park || ''}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Income Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Income</h3>
                      {loading.income ? (
                        <p>Loading income data...</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source</TableHead>
                              <TableHead>Amount ($)</TableHead>
                              <TableHead>Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {incomeItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>${item.amount.toLocaleString()}</TableCell>
                                <TableCell>{getPercentage(item.amount, totalIncome)}%</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold">
                              <TableCell>Total Income</TableCell>
                              <TableCell>${totalIncome.toLocaleString()}</TableCell>
                              <TableCell>100%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    <Separator />

                    {/* Expenses Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Expenses</h3>
                      {loading.expenses ? (
                        <p>Loading expense data...</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount ($)</TableHead>
                              <TableHead>Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenseItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>${item.amount.toLocaleString()}</TableCell>
                                <TableCell>{getPercentage(item.amount, totalExpenses)}%</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold">
                              <TableCell>Total Expenses</TableCell>
                              <TableCell>${totalExpenses.toLocaleString()}</TableCell>
                              <TableCell>100%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    <Separator />

                    {/* New Budget Items Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">New Budget Items</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={addNewBudgetItem}
                          className="flex items-center gap-1"
                        >
                          <PlusCircle size={16} />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {budgetItems.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-md"
                          >
                            <div className="col-span-12 md:col-span-3 space-y-2">
                              <Label htmlFor={`category-${item.id}`}>Category</Label>
                              <Input 
                                id={`category-${item.id}`} 
                                placeholder="e.g. Staff Salaries"
                                value={item.category}
                                onChange={(e) =>
                                  updateBudgetItem(item.id, 'category', e.target.value)
                                }
                              />
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-2">
                              <Label htmlFor={`description-${item.id}`}>Description</Label>
                              <Input 
                                id={`description-${item.id}`} 
                                placeholder="Brief description of this budget item"
                                value={item.description}
                                onChange={(e) =>
                                  updateBudgetItem(item.id, 'description', e.target.value)
                                }
                              />
                            </div>
                            <div className="col-span-12 md:col-span-2 space-y-2">
                              <Label htmlFor={`type-${item.id}`}>Type</Label>
                              <Select
                                value={item.type}
                                onValueChange={(value) =>
                                  updateBudgetItem(item.id, 'type', value as 'expense' | 'income')
                                }
                              >
                                <SelectTrigger id={`type-${item.id}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="expense">Expense</SelectItem>
                                  <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-10 md:col-span-2 space-y-2">
                              <Label htmlFor={`amount-${item.id}`}>Amount ($)</Label>
                              <Input 
                                id={`amount-${item.id}`} 
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={item.amount || ''}
                                onChange={(e) =>
                                  updateBudgetItem(item.id, 'amount', Number(e.target.value))
                                }
                              />
                            </div>
                            <div className="col-span-2 md:col-span-1 flex items-end justify-end h-full pb-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeBudgetItem(item.id)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-6">
                        <div className="bg-gray-100 px-6 py-3 rounded-md">
                          <span className="text-gray-700">Total New Budget Items: </span>
                          <span className="font-bold text-lg">
                            ${getTotalAmount(budgetItems).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save as Draft
                    </Button>
                    <Button onClick={handleSubmitBudget}>Submit Budget</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BudgetCreation;