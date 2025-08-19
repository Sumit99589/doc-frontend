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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";

const categoriesData = {
  categories: [
    {
      id: "company_registration",
      name: "Company Registration & Compliance",
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
      documents: ["Sales Invoices", "Credit Notes / Sales Returns", "POS Reports"],
      emailTemplate:
        "Dear {{clientName}},\n\nFor the purpose of revenue reporting for {{period}}, please share the following documents:\n\n{{#each documents}}\n- {{this}}\n{{/each}}\n\nUpload here: {{uploadLink}}\n\nDeadline: {{dueDate}}.\n\nThanks,\nYour Accounting Team",
    },
    {
      id: "purchase_expense",
      name: "Purchase & Expense Documents",
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

export default function RequestDocumentsDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = useMemo(
    () => categoriesData.categories.find((c) => c.id === selectedCategoryId) || null,
    [selectedCategoryId]
  );

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState("");
  const [customDocs, setCustomDocs] = useState<string[]>([]);

  // NEW: period & due date
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

  function handleSubmit() {
    const payload = {
      categoryId: selectedCategory?.id || null,
      categoryName: selectedCategory?.name || null,
      period,
      dueDate,
      selectedDocs,
      customDocs,
      allDocs: [...selectedDocs, ...customDocs],
    };
    console.log("📩 Document request payload:", payload);
    setDialogOpen(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Request Documents</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black">Request Documents</DialogTitle>
        </DialogHeader>

        {/* Category picker (combobox with search) */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Category</Label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboOpen}
                className="w-full justify-between text-gray-800"
              >
                {selectedCategory ? selectedCategory.name : "Choose a category"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
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
                          className="cursor-pointer"
                        >
                          <Check className={`mr-2 h-4 w-4 ${isActive ? "opacity-100" : "opacity-0"}`} />
                          {cat.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCategory && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-gray-800">Selected:</span>
              <Badge variant="secondary" className="text-xs">
                {selectedCategory.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Documents checklist */}
        <div className="mt-4 space-y-3">
          <Label className="text-sm text-gray-700">Documents</Label>
          {!selectedCategory ? (
            <p className="text-sm text-gray-800">Pick a category to see documents.</p>
          ) : (
            <div className="grid gap-2">
              {selectedCategory.documents.map((doc, idx) => {
                const id = `doc-${idx}`;
                const checked = selectedDocs.includes(doc);
                return (
                  <div key={doc} className="flex items-center space-x-3 rounded-md border border-gray-700/50 p-3">
                    <Checkbox id={id} checked={checked} onCheckedChange={(c) => toggleDoc(doc, c)} />
                    <Label htmlFor={id} className="text-sm text-gray-800 cursor-pointer">
                      {doc}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom documents input + chips */}
        <div className="mt-4 space-y-2">
          <Label className="text-sm text-gray-700">Add custom documents</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Previous year audit report"
              value={customDocInput}
              onChange={(e) => setCustomDocInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addCustomDoc();
                }
              }}
              className="text-black"
            />
            <Button type="button" onClick={addCustomDoc} className="cursor-pointer">
              Add
            </Button>
          </div>

          {customDocs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {customDocs.map((doc) => (
                <Badge key={doc} variant="outline" className="flex items-center gap-1">
                  <span className="text-xs">{doc}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomDoc(doc)}
                    className="ml-1 inline-flex"
                    aria-label={`Remove ${doc}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* NEW: Period & Due Date */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-gray-700">Period</Label>
            <Input
              placeholder="e.g. Jan 2025 / Q1 2025 / FY 24-25"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-gray-700">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-black"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-800">
            {selectedDocs.length} selected from category
            {customDocs.length > 0 ? ` • ${customDocs.length} custom` : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="cursor-pointer"
              disabled={!selectedCategory || (!selectedDocs.length && !customDocs.length)}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
