"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {CheckCircle} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ChevronsUpDown, 
  X, 
  FileText, 
  Calendar,
  Clock,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  Send,
  User
} from "lucide-react";

const categoriesData = {
  categories: [
    {
      id: "company_registration",
      name: "Company Registration & Compliance",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      documents: [
        "Certificate of Incorporation",
        "PAN Card / EIN",
        "GST / VAT Registration Certificate",
        "Shop & Establishment License",
        "Partnership Deed / LLP Agreement / Articles of Association",
        "Import Export Code",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nAs part of our compliance process for {{period}}, please provide the following registration-related documents:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nYou can securely upload them here: {{uploadLink}}\n\nPlease submit them before {{dueDate}}.\n\nRegards,\nYour Accounting Team",
    },
    {
      id: "financial_statements",
      name: "Financial Statements",
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
      documents: [
        "Balance Sheet",
        "Profit & Loss Statement",
        "Trial Balance",
        "General Ledger",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nWe are preparing your financial reports for {{period}}. Kindly share the following:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nUpload securely here: {{uploadLink}}\n\nDeadline: {{dueDate}}.\n\nRegards,\nYour Accounting Team",
    },
    {
      id: "bank_cash_records",
      name: "Bank & Cash Records",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      documents: [
        "Bank Statements (all accounts, monthly)",
        "Cheque Book Scans",
        "Cash Register / Petty Cash Vouchers",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nTo complete your reconciliation for {{period}}, we require the following:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nSecure upload link: {{uploadLink}}\n\nKindly send before {{dueDate}}.\n\nBest regards,\nYour Accounting Team",
    },
    {
      id: "sales_revenue",
      name: "Sales & Revenue Documents",
      icon: FileText,
      color: "from-amber-500 to-amber-600",
      documents: ["Sales Invoices", "Credit Notes / Sales Returns", "POS Reports"],
      emailTemplate:
        "Dear {{clientName}},\n\nFor the purpose of revenue reporting for {{period}}, please share the following documents:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nUpload here: {{uploadLink}}\n\nDeadline: {{dueDate}}.\n\nThanks,\nYour Accounting Team",
    },
    {
      id: "purchase_expense",
      name: "Purchase & Expense Documents",
      icon: FileText,
      color: "from-red-500 to-red-600",
      documents: [
        "Purchase Invoices / Bills",
        "Expense Receipts",
        "Vendor Contracts / Agreements",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nTo complete your expense reconciliation for {{period}}, we require these:\n\n{{#each documents}}\n- {{this}}\n\n{{/each}}\n\nSecure upload link: {{uploadLink}}\n\nPlease provide them before {{dueDate}}.\n\nRegards,\nYour Accounting Team",
    },
    {
      id: "payroll_hr",
      name: "Payroll & HR Records",
      icon: User,
      color: "from-indigo-500 to-indigo-600",
      documents: [
        "Employee List & Details",
        "Monthly Salary Sheets",
        "PF & ESI Payment Proofs",
        "TDS Payment Proofs",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nTo process payroll records for {{period}}, please share:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nUpload link: {{uploadLink}}\n\nDue date: {{dueDate}}\n\nThanks,\nYour Accounting Team",
    },
    {
      id: "tax_documents",
      name: "Tax-Related Documents",
      icon: FileText,
      color: "from-teal-500 to-teal-600",
      documents: [
        "GST Returns (GSTR-1, GSTR-3B, GSTR-9)",
        "Income Tax Returns (last 3 years)",
        "TDS Returns",
        "Advance Tax Payment Challans",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nFor timely tax filing for {{period}}, please provide:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nUpload securely: {{uploadLink}}\n\nDeadline: {{dueDate}}\n\nBest regards,\nYour Accounting Team",
    },
    {
      id: "supporting_documents",
      name: "Other Supporting Documents",
      icon: FileText,
      color: "from-slate-500 to-slate-600",
      documents: [
        "Loan Agreements & EMI Schedules",
        "Insurance Policies",
        "Fixed Asset Purchase Bills",
        "Depreciation Schedules",
      ],
      emailTemplate:
        "Dear {{clientName}},\n\nTo complete our review for {{period}}, please send the following supporting documents:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nSecure link: {{uploadLink}}\n\nDue date: {{dueDate}}\n\nKind regards,\nYour Accounting Team",
    },
  ],
};

export default function RequestDocumentsDialog({clientName}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = useMemo(
    () => categoriesData.categories.find((c) => c.id === selectedCategoryId) || null,
    [selectedCategoryId]
  );

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState("");
  const [customDocs, setCustomDocs] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  function resetDocsForNewCategory(nextId: string) {
    setSelectedCategoryId(nextId);
    setSelectedDocs([]);
  }

  function toggleDoc(doc: string, checked: boolean | "indeterminate") {
    const isChecked = checked === true;
    setSelectedDocs((prev) => (isChecked ? [...prev, doc] : prev.filter((d) => d !== doc)));
  }

  function addCustomDoc() {
    const v = customDocInput.trim();
    if (!v) return;
    if (!customDocs.includes(v)) setCustomDocs((prev) => [...prev, v]);
    setCustomDocInput("");
  }

  function removeCustomDoc(doc: string) {
    setCustomDocs((prev) => prev.filter((d) => d !== doc));
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    const payload = {
      categoryId: selectedCategory?.id || null,
      clientName: clientName,
      period,
      dueDate,
      docs: [...selectedDocs, ...customDocs]
    };

    try {
      const res = await fetch("http://localhost:3000/sendReq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("✅ Email request sent:", data);
        setDialogOpen(false);
        // Reset fields
        setSelectedCategoryId(null);
        setSelectedDocs([]);
        setCustomDocs([]);
        setPeriod("");
        setDueDate("");
      } else {
        console.error("❌ Failed to send:", data.error);
      }
    } catch (err) {
      console.error("⚠️ Request failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalSelected = selectedDocs.length + customDocs.length;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Request Documents
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-0 shadow-2xl rounded-2xl flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl"></div>
        
        <div className="relative z-10 flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="pb-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  Document Request
                </DialogTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Request documents from <span className="font-semibold text-blue-600">{clientName}</span>
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-6 space-y-8 min-h-0">
            {/* Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-600" />
                <Label className="text-base font-semibold text-slate-800">Document Category</Label>
              </div>
              
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    className="w-full justify-between h-12 bg-white border-slate-300 hover:border-slate-400 text-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {selectedCategory ? (
                        <>
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${selectedCategory.color}`}>
                            <selectedCategory.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{selectedCategory.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-500">Choose a document category</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 shadow-xl border-slate-200 max-h-80 overflow-hidden">
                  <Command className="max-h-80">
                    <CommandInput placeholder="Search categories..." className="border-0" />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categoriesData.categories.map((cat) => {
                          const isActive = selectedCategoryId === cat.id;
                          return (
                            <CommandItem
                              key={cat.id}
                              value={cat.name}
                              onSelect={() => {
                                resetDocsForNewCategory(cat.id);
                                setComboOpen(false);
                              }}
                              className="cursor-pointer py-3 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${cat.color}`}>
                                  <cat.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium">{cat.name}</span>
                              </div>
                              <Check className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-0"}`} />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedCategory && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedCategory.color} mr-2`}></div>
                    {selectedCategory.name}
                  </Badge>
                  <span className="text-sm text-slate-600">• {selectedCategory.documents.length} available documents</span>
                </div>
              )}
            </div>

            {/* Document Selection */}
            {selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <Label className="text-base font-semibold text-slate-800">Select Documents</Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedDocs.length} of {selectedCategory.documents.length} selected
                  </Badge>
                </div>

                <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {selectedCategory.documents.map((doc, idx) => {
                    const id = `doc-${idx}`;
                    const checked = selectedDocs.includes(doc);
                    return (
                      <div key={doc} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        checked 
                          ? 'border-blue-300 bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <Checkbox 
                          id={id} 
                          checked={checked} 
                          onCheckedChange={(c) => toggleDoc(doc, c)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor={id} className="text-sm text-slate-700 cursor-pointer flex-1 font-medium">
                          {doc}
                        </Label>
                        {checked && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-slate-600" />
                <Label className="text-base font-semibold text-slate-800">Custom Documents</Label>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Enter custom document name..."
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDoc();
                    }
                  }}
                  className="flex-1 bg-white border-slate-300 text-black focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  type="button" 
                  onClick={addCustomDoc} 
                  disabled={!customDocInput.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {customDocs.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-slate-600">Custom Documents ({customDocs.length})</Label>
                  <div className="space-y-2">
                    {customDocs.map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="text-sm font-medium text-emerald-800">{doc}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomDoc(doc)}
                          className="p-1 hover:bg-emerald-200 rounded text-emerald-600 hover:text-emerald-800 transition-colors"
                          aria-label={`Remove ${doc}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Period and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <Label className="text-sm font-semibold text-slate-800">Reporting Period</Label>
                </div>
                <Input
                  placeholder="e.g., January 2025, Q1 2025, FY 24-25"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white border-slate-300  text-black focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <Label className="text-sm font-semibold text-slate-800">Due Date</Label>
                </div>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white border-slate-300 text-black focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Summary */}
            {totalSelected > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Request Summary</span>
                </div>
                <p className="text-sm text-blue-700">
                  You're requesting <span className="font-bold">{totalSelected} documents</span> from{' '}
                  <span className="font-bold">{clientName}</span>
                  {period && <span> for <span className="font-bold">{period}</span></span>}
                  {dueDate && <span> due by <span className="font-bold">{new Date(dueDate).toLocaleDateString()}</span></span>}.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="text-sm text-slate-600">
              {totalSelected === 0 ? (
                <span className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  Please select at least one document
                </span>
              ) : (
                <span className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  {totalSelected} document{totalSelected !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-slate-300 text-black hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedCategory || totalSelected === 0 || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Request
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}