"use client";
import { useState, useEffect } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { 
  Plus, 
  Building2, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

interface FormData {
  company: string;
  email: string;
  contactPerson: string;
  phone: string;
  address: string;
  status: string;
}

interface FormErrors {
  company?: string;
  email?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  submit?: string;
}

interface AddClientProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export default function AddClient({ onClose, isOpen }: AddClientProps) {
  const [formData, setFormData] = useState<FormData>({
    company: "",
    email: "",
    contactPerson: "",
    phone: "",
    address: "",
    status: "pending"
  });
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);

  // Sync external isOpen prop with internal state
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = (): void => {
    setFormData({
      company: "",
      email: "",
      contactPerson: "",
      phone: "",
      address: "",
      status: "pending"
    });
    setErrors({});
    setSuccess(false);
  };

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:3000/add-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          clientName: formData.company, 
          email: formData.email,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
          status: formData.status
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Client added:", data);
        setSuccess(true);
        setTimeout(() => {
          resetForm();
          handleClose();
        }, 2000);
      } else {
        setErrors({ submit: data.error || "Failed to add client" });
      }
    } catch (err) {
      console.error("Request failed:", err);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = (): void => {
    if (!isSubmitting) {
      resetForm();
      setOpen(false);
      // Call the external onClose callback if provided
      if (onClose) {
        onClose();
      }
    }
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (newOpen) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Only show trigger button if no external control (onClose prop not provided) */}
      {!onClose && (
        <DialogTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add New Client
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl"></div>
        
        <div className="relative z-10">
          <DialogHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-lg">
                  {success ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Plus className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800">
                    {success ? "Client Added Successfully!" : "Add New Client"}
                  </DialogTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {success 
                      ? "The client has been added to your system" 
                      : "Enter the client's information to get started"
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {formData.company} has been added!
              </h3>
              <p className="text-slate-600 mb-4">
                You can now start requesting documents from this client.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Closing automatically...
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {/* Company & Contact Person Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    Company Name *
                  </Label>
                  <Input
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className={`bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.company ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.company && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.company}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <User className="w-4 h-4 text-slate-600" />
                    Contact Person *
                  </Label>
                  <Input
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    className={`bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.contactPerson ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.contactPerson && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.contactPerson}
                    </div>
                  )}
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Mail className="w-4 h-4 text-slate-600" />
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Phone className="w-4 h-4 text-slate-600" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  Business Address
                </Label>
                <Input
                  placeholder="Enter business address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-white border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">Initial Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-slate-800 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding Client...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Client
                    </div>
                  )}
                </Button>
              </div>

              {/* Required Fields Note */}
              <p className="text-xs text-slate-500 text-center pt-2">
                Fields marked with * are required
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}