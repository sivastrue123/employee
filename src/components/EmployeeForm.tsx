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
const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Design",
];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

export default function EmployeeForm({ employee, onSave, onCancel }: any) {
  const [formData, setFormData] = useState<any>(
    employee || {
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

  const handleSubmit = async (e: any) => {
    try {
      setIsSubmitting(true);
      if (formData.phone) {
        const numericValue = formData.phone.replace(/\D/g, "");
        if (numericValue.length !== 10 && numericValue.length > 0) {
          alert("Phone number must be exactly 10 digits.");
        }
      }
      e.preventDefault();
      let response;
      if (employee) {
        response = await axios.patch(
          `/api/employee/editEmployee/${employee._id}`,
          formData
        );
      } else {
        response = await axios.post("/api/employee/addEmployee", formData);
      }

      console.log("Response:", response.data);
      console.log(formData);

      onSave();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
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
        className="w-full max-w-2xl max-h-[90vh] "
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold">
              {employee ? "Edit Employee" : "Add New Employee"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="">
            <form onSubmit={handleSubmit} className="">
              <div className="overflow-auto max-h-[50vh] space-y-6 z-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleChange("first_name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleChange("last_name", e.target.value)
                      }
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
                    />
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
                      onValueChange={(value) =>
                        handleChange("department", value)
                      }
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
                      onChange={(e) =>
                        handleChange("hire_date", e.target.value)
                      }
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
                        handleChange("hourly_rate", parseFloat(e.target.value))
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
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="!bg-slate-900 hover:!bg-slate-800"
                >
                  {isSubmitting
                    ? "Saving..."
                    : `${employee ? "Save" : "Create"} Employee`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
