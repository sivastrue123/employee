import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import axios from "axios";

// ✅ bring in your first-party toast system
import { useToast } from "@/toast/ToastProvider";
import { api } from "@/lib/axios";

const DEPARTMENTS = ["Development", "Support", "AI", "Sales", "Management", "API"];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

export default function EmployeeForm({ employee, onSave, onCancel }: any) {
  const toast = useToast(); // ✅

  const [formData, setFormData] = useState<any>(
    employee
      ? {
          ...employee,
          hire_date: employee.hire_date
            ? new Date(employee.hire_date).toISOString().split("T")[0]
            : "",
        }
      : {
          employee_id: "",
          role: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          position: "",
          department: "",
          hire_date: "",
          hourly_rate: "",
          status: "active",
          profile_image: "",
        }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // —— client-side validations with empathetic toasts ——
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || "");
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    const phoneOk = phoneDigits.length === 0 || phoneDigits.length === 10;
    const requiredMissing =
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.employee_id ||
      !formData.role ||
      !formData.position ||
      !formData.department ||
      formData.hourly_rate === "" ||
      formData.hourly_rate === null;

    if (requiredMissing) {
      toast.warning("Please complete all required fields marked with *.", {
        title: "Missing information",
        durationMs: 3500,
        position: "bottom-left",
      });
      return;
    }
    if (!emailOk) {
      toast.warning("That doesn’t look like a valid email address.", {
        title: "Check email",
        durationMs: 3000,
        position: "bottom-left",
      });
      return;
    }
    if (!phoneOk) {
      toast.warning("Phone number must be exactly 10 digits.", {
        title: "Check phone",
        durationMs: 3000,
        position: "bottom-left",
      });
      return;
    }
    if (Number(formData.hourly_rate) < 0) {
      toast.warning("Hourly rate cannot be negative.", {
        title: "Check compensation",
        durationMs: 3000,
        position: "bottom-left",
      });
      return;
    }

    // —— submit with a sticky loader toast ——
    setIsSubmitting(true);
    const loadingId = toast.info(
      employee ? "Updating employee record…" : "Creating new employee…",
      { durationMs: 0, position: "bottom-left", dismissible: true }
    );

    try {
      const payload = {
        ...formData,
        phone: phoneDigits || "", // normalize
      };

      if (employee) {
        await api.patch(`/api/employee/editEmployee/${employee._id}`, payload);
      } else {
        await api.post("/api/employee/addEmployee", payload);
      }

      // Let the parent own the success toast to avoid double messaging
      toast.remove(loadingId);
      onSave();
    } catch (err: any) {
      console.error("Error:", err);
      toast.remove(loadingId);

      const isNetwork =
        err?.code === "ERR_NETWORK" ||
        err?.message?.toLowerCase?.().includes("network");

      // Prefer backend message when available
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      toast.error(
        isNetwork
          ? "Network hiccup while saving. Please check your connection and retry."
          : apiMsg || "We couldn’t save your changes. Please try again.",
        {
          title: "Save failed",
          durationMs: 5000,
          position: "bottom-left",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh]"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold">
              {employee ? "Edit Employee" : "Add New Employee"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast.info("No changes were saved.", {
                  durationMs: 1800,
                  position: "bottom-left",
                });
                onCancel();
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="overflow-auto max-h-[50vh] space-y-6 z-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="10 digits (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee Id *</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleChange("employee_id", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      defaultValue={employee ? employee.role : "employee"}
                      onValueChange={(value) => handleChange("role", value)}
                    >
                      <SelectTrigger className="!w-full !bg-white">
                        <SelectValue placeholder="Select Role" className="!text-black" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"admin"}>{"Admin"}</SelectItem>
                        <SelectItem value={"employee"}>{"Employee"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange("department", value)}
                      defaultValue={employee ? employee.department : ""}
                    >
                      <SelectTrigger className="!w-full !bg-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleChange("hire_date", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (&#8377;) *</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) =>
                        handleChange("hourly_rate", e.target.value === "" ? "" : parseFloat(e.target.value))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger className="!w-full lg:!w-[50%] !bg-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    toast.info("No changes were saved.", {
                      durationMs: 1800,
                      position: "bottom-left",
                    });
                    onCancel();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="!bg-slate-900 hover:!bg-slate-800"
                >
                  {isSubmitting ? "Saving..." : `${employee ? "Save" : "Create"} Employee`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
