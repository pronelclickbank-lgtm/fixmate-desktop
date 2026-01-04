import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { markUserRegistered, markRegistrationPromptShown } from "@/lib/trialTracking";
import { useToast } from "@/hooks/use-toast";

interface UserRegistrationModalProps {
  open: boolean;
  onRegistrationComplete: () => void;
  onClose?: () => void;
}

export function UserRegistrationModal({ open, onRegistrationComplete, onClose }: UserRegistrationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const registerMutation = trpc.adminDashboard.registerUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Welcome to FixMate AI! You can now use all features.",
      });
      // Save registration status using trial tracking
      markUserRegistered(formData.name, formData.email, formData.phone || undefined);
      onRegistrationComplete();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone is optional
    // No validation needed for phone

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      email: formData.email.trim(),
      username: formData.name.trim(),
      phone: formData.phone.trim(), // Now required, no fallback to undefined
      planType: "free",
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onClose) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="h-6 w-6 text-primary" />
            Welcome to FixMate AI
          </DialogTitle>
          <DialogDescription className="text-base">
            Please register to start optimizing your PC. We'll use this information to provide you
            with the best experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={registerMutation.isPending}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={registerMutation.isPending}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={registerMutation.isPending}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            <p className="text-xs text-muted-foreground">
              We'll use this to send you important updates about your PC optimization
            </p>
          </div>

          {/* Submit and Later Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                markRegistrationPromptShown();
                if (onClose) onClose();
              }}
              disabled={registerMutation.isPending}
              size="lg"
            >
              Later
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={registerMutation.isPending}
              size="lg"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground text-center">
            By registering, you agree to our Terms of Service and Privacy Policy. Your information
            is secure and will never be shared with third parties.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
