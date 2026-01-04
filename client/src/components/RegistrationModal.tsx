import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrationModal({ open, onClose, onSuccess }: RegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const registerMutation = trpc.user.register.useMutation({
    onSuccess: () => {
      toast.success("Registration successful! Thank you for registering.");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast.error("Please fill in all required fields including phone number for account recovery");
      return;
    }

    registerMutation.mutate({ name, email, phone });
  };

  const handleSkip = () => {
    toast.info("You can register later to unlock all features");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-300">
            <UserPlus className="h-5 w-5" />
            Register for Free Access
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Register to continue using FixMate AI for free. We'll keep you updated with new features and improvements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-300">
              Phone Number <span className="text-red-400">*</span>
              <span className="text-xs text-slate-500 ml-2">(Required for account recovery)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Now"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={registerMutation.isPending}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
