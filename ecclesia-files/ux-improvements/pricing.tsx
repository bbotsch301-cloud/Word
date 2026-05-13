import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Crown, Users, ArrowRight, Loader2, Heart } from "lucide-react";
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

const suggestedAmounts = [10, 25, 50, 100];

export default function Pricing() {
  usePageTitle("Membership", "Begin free with the Covenant Walk, or support the assembly with a monthly donation.");
  const { isAuthenticated, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");

  const donationAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const isValidAmount = donationAmount !== null && donationAmount > 0 && Number.isFinite(donationAmount);

  async function handleDonate() {
    if (!isValidAmount || !donationAmount) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/square/create-checkout", {
        amountCents: Math.round(donationAmount * 100),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to start checkout. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setIsLoading(false);
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

          {/* PMA Beneficiary — Donation Based */}
          <Card className="border-2 border-royal-gold relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-gold via-yellow-400 to-royal-gold" />
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-royal-gold/10 text-royal-gold border-royal-gold font-cinzel">
                  <Crown className="w-3 h-3 mr-1" /> Covenantal Membership
                </Badge>
                <h2 className="font-cinzel-decorative text-2xl font-bold text-royal-navy mb-2">Covenantal Membership</h2>
                <p className="text-xs text-royal-navy/60 mb-2">PMA Beneficial Interest</p>
                <p className="text-2xl font-bold text-royal-navy mt-2">Donation-Based</p>
                <p className="text-sm text-gray-500 mt-2">Give any amount monthly to support the assembly</p>
                <p className="text-xs text-royal-gold/80 mt-1">50% of your donation funds the Treasury Trust</p>
                <p className="text-xs text-gray-400 mt-2 italic font-georgia">
                  "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." — 2 Corinthians 9:7 (KJV)
                </p>
              </div>

              {/* Donation amount selector */}
              {!isPremium && isAuthenticated && (
                <div className="mb-6">
                  <p className="text-sm font-cinzel font-semibold text-royal-navy mb-3 text-center">Choose your monthly donation</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {suggestedAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                          selectedAmount === amt && !customAmount
                            ? "bg-royal-gold text-royal-navy ring-2 ring-royal-gold/50"
                            : "bg-gray-100 text-gray-700 hover:bg-royal-gold/10"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      className="pl-7 text-center font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">per month · cancel anytime</p>
                </div>
              )}

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
                    onClick={handleDonate}
                    disabled={isLoading || !isValidAmount}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Heart className="w-4 h-4 mr-2" /> Donate {isValidAmount ? `$${donationAmount}/mo` : ""} & Join</>
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
              a: "By making a recurring monthly donation of any amount, you enter as a full Grantor-Beneficiary in the Ecclesia Basilikos Trust through our Private Membership Association. This grants you a Beneficial Unit certificate representing your equal share of the trust corpus, plus full access to all content and community features.",
            },
            {
              q: "How does the donation work?",
              a: "You choose a monthly donation amount that works for you — any amount unlocks full membership. Your donation recurs monthly and you can cancel or change the amount at any time. Your membership and beneficial interest remain active as long as your donation is current.",
            },
            {
              q: "Where does my donation go?",
              a: "50% of every donation is allocated to the Treasury Trust, managed by the Financial Trustee for the long-term benefit of all PMA beneficiaries. The remaining 50% supports operations, content development, and platform maintenance.",
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
