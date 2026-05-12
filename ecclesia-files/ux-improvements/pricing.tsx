import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Users, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiRequest } from "@/lib/queryClient";

const freeTierFeatures = [
  "Covenant Walk (guided introduction)",
  "Trust Foundation Course — Lesson 1",
  "Trust document downloads",
  "Forum reading & browsing",
  "Public educational resources",
  "Progress tracking",
  "Email notifications",
];

const pmaFeatures = [
  "Everything in Free, plus:",
  "All courses & lesson content across every pillar",
  "All downloadable templates & guides",
  "Forum posting & community discussion",
  "Proof Vault document timestamping",
  "Comments on lessons & videos",
  "Your Beneficial Unit certificate (1/N trust interest)",
  "Full standing as Grantor-Beneficiary in the Body",
  "Priority community support",
];

export default function Pricing() {
  usePageTitle("Pricing", "Begin free with the Covenant Walk, or enter as a full Grantor-Beneficiary through Covenantal Membership.");
  const { isAuthenticated, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState<"one_time" | "installment" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(mode: "one_time" | "installment") {
    setIsLoading(mode);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/square/create-checkout", {
        paymentMode: mode,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to start checkout. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setIsLoading(null);
    }
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Crown className="w-12 h-12 text-royal-gold mx-auto mb-4" />
          <h1 className="font-cinzel-decorative text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
            Choose Your Path
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Begin with the Covenant Walk and free Trust Foundation, or enter as a full Grantor-Beneficiary through Covenantal Membership.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 mb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <Card className="border-2 border-gray-200 relative overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-300 font-cinzel">
                  <Users className="w-3 h-3 mr-1" /> Trust User
                </Badge>
                <h2 className="font-cinzel-decorative text-2xl font-bold text-royal-navy mb-2">Free</h2>
                <p className="text-4xl font-bold text-royal-navy">$0<span className="text-lg text-gray-400 font-normal">/forever</span></p>
                <p className="text-sm text-gray-500 mt-2">No credit card required</p>
              </div>
              <ul className="space-y-3 mb-8">
                {freeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isAuthenticated && !isPremium ? (
                <Button variant="outline" className="w-full font-cinzel" disabled>
                  Current Plan
                </Button>
              ) : !isAuthenticated ? (
                <Link href="/signup">
                  <Button variant="outline" className="w-full font-cinzel font-bold">
                    Get Started Free
                  </Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>

          {/* PMA Beneficiary */}
          <Card className="border-2 border-royal-gold relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-gold via-yellow-400 to-royal-gold" />
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-royal-gold/10 text-royal-gold border-royal-gold font-cinzel">
                  <Crown className="w-3 h-3 mr-1" /> Covenantal Membership
                </Badge>
                <h2 className="font-cinzel-decorative text-2xl font-bold text-royal-navy mb-2">Covenantal Membership</h2>
                <p className="text-xs text-royal-navy/60 mb-2">PMA Beneficial Interest</p>
                <p className="text-4xl font-bold text-royal-navy">$500</p>
                <p className="text-sm text-gray-500 mt-2">One-time covenant contribution &bull; or $50 &times; 10 months</p>
                <p className="text-xs text-royal-gold/80 mt-1">50% of your contribution funds the Treasury Trust</p>
                <p className="text-xs text-gray-400 mt-2 italic font-georgia">
                  "And all that believed were together, and had all things common" — Acts 2:44 (KJV)
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {pmaFeatures.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${i === 0 ? "text-royal-gold font-semibold font-cinzel" : "text-gray-700"}`}>
                    {i === 0 ? (
                      <Crown className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                    )}
                    {feature}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <div className="space-y-2">
                  <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold" disabled>
                    <Crown className="w-4 h-4 mr-2" /> You're a PMA Beneficiary
                  </Button>
                  <Link href="/billing">
                    <Button variant="ghost" className="w-full text-sm text-gray-500">
                      View Stewardship Details
                    </Button>
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold"
                    onClick={() => handleCheckout("one_time")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "one_time" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Crown className="w-4 h-4 mr-2" /> Enter the Covenant ($500)</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-cinzel border-royal-gold/30 text-royal-navy"
                    onClick={() => handleCheckout("installment")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "installment" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <>Covenant Contribution: $50 × 10 Months</>
                    )}
                  </Button>
                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}
                </div>
              ) : (
                <Link href="/signup">
                  <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold">
                    Sign Up for Covenantal Membership
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="font-cinzel text-2xl font-bold text-royal-navy text-center mb-10">Common Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "What's included with a free account?",
              a: "You get the full Covenant Walk (a guided introduction to your identity as Grantor-Beneficiary), Lesson 1 of the Trust Foundation course, Trust document downloads, and the ability to read all forum discussions. Progress tracking is also included.",
            },
            {
              q: "What is Covenantal Membership?",
              a: "By making a covenant contribution of $500 (or $50x10), you enter as a full Grantor-Beneficiary in the Ecclesia Basilikos Trust through our Private Membership Association. This grants you a Beneficial Unit certificate representing your equal share of the trust corpus, plus full access to all content and community features.",
            },
            {
              q: "Is the $500 a subscription?",
              a: "No. It's a one-time covenant contribution that permanently establishes your beneficial interest. You can also choose the $50x10 installment plan. There are no recurring charges after your contribution is complete.",
            },
            {
              q: "Where does my contribution go?",
              a: "50% of every contribution is allocated to the Treasury Trust, managed by the Financial Trustee for the long-term benefit of all PMA beneficiaries. The remaining 50% supports operations, content development, and platform maintenance.",
            },
            {
              q: "Will free content ever be locked?",
              a: "Lesson 1 of the Trust course and the Trust downloads will remain free forever. We believe this foundational knowledge should be accessible to everyone.",
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-xl bg-white border border-gray-200">
              <h4 className="font-cinzel font-bold text-sm text-royal-navy mb-2">{faq.q}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        {!isAuthenticated && (
          <div className="text-center mt-16">
            <h3 className="font-cinzel text-xl font-bold text-royal-navy mb-3">Ready to Begin?</h3>
            <p className="text-gray-600 mb-6">Start with the Covenant Walk — a free guided introduction to your identity as Grantor-Beneficiary.</p>
            <Link href="/new-covenant-intro">
              <Button size="lg" className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-10">
                Begin the Covenant Walk <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
