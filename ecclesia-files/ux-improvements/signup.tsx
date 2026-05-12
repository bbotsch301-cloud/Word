import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Crown, Loader2, BookOpen, FileText, Shield, Users, Download, GraduationCap, Mail, Heart, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

const registrationSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Signup() {
  usePageTitle("Create Account");
  const { isAuthenticated, isLoading, register: registerUser, isRegistering } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<RegistrationData>({
    mode: "onBlur",
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", firstName: "", lastName: "", privacyAccepted: undefined as unknown as true },
  });

  const onSubmit = async (data: RegistrationData) => {
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      (await import("@/lib/analytics")).trackEvent("Signup");
      setRegisteredEmail(userData.email);
      setRegistrationSuccess(true);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before signing in.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-royal-gold" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="flex justify-center">
              <Mail className="w-16 h-16 text-royal-gold" />
            </div>
            <div className="space-y-2">
              <h1 className="font-cinzel-decorative text-2xl font-bold text-royal-navy">Check Your Email</h1>
              <p className="text-gray-600 leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-semibold text-royal-navy">{registeredEmail}</span>.
                Click the link in that email to verify your account and get started.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  className="text-royal-gold hover:underline font-medium"
                  onClick={() => { setRegistrationSuccess(false); setRegisteredEmail(''); }}
                >
                  try signing up again
                </button>.
              </p>
            </div>
            <Button
              className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold"
              onClick={() => navigate("/welcome")}
            >
              Continue to Welcome
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const benefits = [
    { icon: Heart, text: "The Covenant Walk — guided identity introduction" },
    { icon: BookOpen, text: "Trust Foundation Course — free first course" },
    { icon: FileText, text: "Trust-related downloads" },
    { icon: Users, text: "Forum reading & browsing" },
    { icon: GraduationCap, text: "Track your learning progress" },
    { icon: Download, text: "Public educational resources" },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        {/* Left: Value Proposition */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy p-12 xl:p-16 text-white">
          <Crown className="w-12 h-12 text-royal-gold mb-6" />
          <h2 className="font-cinzel-decorative text-3xl xl:text-4xl font-bold mb-4">
            Enter the Assembly
          </h2>
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            You are not creating a website account. You are entering a private covenant assembly,
            a trust-governed body operating outside Babylon's commercial systems.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-royal-gold/30 rounded-lg p-5 mb-8">
            <p className="font-cinzel text-sm font-bold text-royal-gold mb-3">Your Journey as a Grantor-Beneficiary</p>
            <ul className="space-y-3">
              {[
                { num: "1", icon: Heart, label: "The Covenant Walk", desc: "Understand your identity (free)", highlight: true },
                { num: "2", icon: BookOpen, label: "Trust Foundation Course", desc: "Learn the three pillars (free)", highlight: false },
                { num: "3", icon: Crown, label: "Covenantal Membership", desc: "Full access as Grantor-Beneficiary (PMA)", highlight: false },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-cinzel text-xs font-bold ${
                    p.highlight ? "bg-royal-gold/30 text-royal-gold" : "bg-royal-gold/20 text-royal-gold"
                  }`}>
                    {p.num}
                  </span>
                  <div className="flex-1">
                    <span className="text-white font-semibold text-sm">{p.label}</span>
                    <span className="text-gray-400 text-sm"> — {p.desc}</span>
                  </div>
                  {i < 2 && <ArrowRight className="w-3 h-3 text-royal-gold/40 mt-1.5 flex-shrink-0" />}
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-3 mb-8">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <b.icon className="w-5 h-5 text-royal-gold flex-shrink-0" />
                <span className="text-gray-200">{b.text}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/10 backdrop-blur-sm border border-royal-gold/30 rounded-lg p-5">
            <p className="font-georgia italic text-gray-200">
              "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people."
            </p>
            <p className="text-royal-gold mt-2 font-semibold text-sm">— 1 Peter 2:9 (KJV)</p>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="flex items-center justify-center bg-gray-50 px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-2 pb-2">
              <div className="flex justify-center lg:hidden">
                <Crown className="w-10 h-10 text-royal-gold" />
              </div>
              <h1 className="font-cinzel-decorative text-2xl font-bold text-royal-navy">
                Enter the Assembly
              </h1>
              <p className="text-gray-500 text-sm">Create your account to begin the Covenant Walk</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacyAccepted"
                    render={({ field }) => (
                      <FormItem>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                              />
                            </FormControl>
                            <Label className="text-sm text-gray-700 leading-relaxed cursor-pointer font-normal" onClick={() => field.onChange(field.value === true ? undefined : true)}>
                              I acknowledge the{" "}
                              <Link href="/privacy" className="text-royal-gold hover:underline font-medium">
                                Privacy Policy
                              </Link>{" "}
                              and{" "}
                              <Link href="/terms" className="text-royal-gold hover:underline font-medium">
                                Platform Guidelines
                              </Link>
                            </Label>
                          </div>
                          <FormMessage className="mt-2 ml-7" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-royal-gold hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
