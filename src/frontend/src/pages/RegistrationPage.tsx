import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { FunctionType } from "../backend";
import {
  useRegisterProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

const FUNCTION_LABELS: Record<FunctionType, string> = {
  [FunctionType.production]: "Production",
  [FunctionType.processing]: "Processing",
  [FunctionType.distribution]: "Distribution",
  [FunctionType.wasteManagement]: "Waste Management",
  [FunctionType.education]: "Education",
  [FunctionType.equipmentSpace]: "Equipment / Space",
};

const ALL_FUNCTIONS = Object.values(FunctionType) as FunctionType[];

interface RegistrationPageProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export default function RegistrationPage({
  onSuccess,
  onBack,
}: RegistrationPageProps) {
  const registerProfile = useRegisterProfile();
  const saveUserProfile = useSaveCallerUserProfile();

  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState<FunctionType[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const toggleFunction = (fn: FunctionType) => {
    setSelectedFunctions((prev) =>
      prev.includes(fn) ? prev.filter((f) => f !== fn) : [...prev, fn],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organizationName.trim()) {
      setError("Organization name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (selectedFunctions.length === 0) {
      setError("Please select at least one function.");
      return;
    }

    const id = `profile_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const registrationData = {
      id,
      organizationName: organizationName.trim(),
      email: email.trim(),
      functions: selectedFunctions,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      bio: bio.trim() || undefined,
      profilePicture: undefined,
    };

    try {
      const profile = await registerProfile.mutateAsync(registrationData);
      await saveUserProfile.mutateAsync({ profileId: profile.id });
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Registration failed. Please try again.");
    }
  };

  const isLoading = registerProfile.isPending || saveUserProfile.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex justify-center mb-2">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            Register Your Organization
          </CardTitle>
          <CardDescription className="text-center">
            Create a profile for your organization in the Montreal Food System
            network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Montreal Food Bank"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@organization.org"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (514) 000-0000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Rue Saint-Denis, Montréal"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio">Bio / Description</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your organization..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Functions * (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_FUNCTIONS.map((fn) => (
                  <div key={fn} className="flex items-center space-x-2">
                    <Checkbox
                      id={`fn-${fn}`}
                      checked={selectedFunctions.includes(fn)}
                      onCheckedChange={() => toggleFunction(fn)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={`fn-${fn}`}
                      className="font-normal cursor-pointer"
                    >
                      {FUNCTION_LABELS[fn]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded p-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register Organization"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
