import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import RevealOnScroll from "@/components/ui/reveal-on-scroll";
import StaggerContainer, { staggerItemVariants } from "@/components/ui/stagger-container";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getQueryFn } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Crown,
  Shield,
  Users,
  Vote,
  Scale,
  Coins,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Loader2,
  Landmark,
} from "lucide-react";

interface BasConfig {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
}

interface BasAllocation {
  id: string;
  category: string;
  percentage: number;
  description: string | null;
  color: string | null;
  sortOrder: number | null;
}

interface BasRoadmapMilestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: "upcoming" | "in_progress" | "completed";
  sortOrder: number | null;
}

interface BasCouncilMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  walletAddress: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
}

interface BasFaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number | null;
}

function getConfigValue(configs: BasConfig[] | undefined, key: string, fallback: string = ""): string {
  return configs?.find((c) => c.configKey === key)?.configValue ?? fallback;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  in_progress: Clock,
  upcoming: Target,
};

const statusColors: Record<string, string> = {
  completed: "text-green-500 bg-green-50 border-green-200",
  in_progress: "text-amber-500 bg-amber-50 border-amber-200",
  upcoming: "text-gray-400 bg-gray-50 border-gray-200",
};

export default function BasTokenPage() {
  usePageTitle("BAS Token", "Ecclesia Basilikos governance and stewardship token on Solana.");
  const shouldReduceMotion = useReducedMotion();

  const heroInitial = shouldReduceMotion ? {} : { opacity: 0, y: 30 };
  const heroAnimate = { opacity: 1, y: 0 };
  const heroTransition = (delay: number) => ({
    duration: 0.8,
    delay: shouldReduceMotion ? 0 : delay,
    ease: [0.25, 0.1, 0.25, 1] as const,
  });

  const { data: config, isLoading: configLoading } = useQuery<BasConfig[]>({
    queryKey: ["/api/bas/config"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: allocations } = useQuery<BasAllocation[]>({
    queryKey: ["/api/bas/allocations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: roadmap } = useQuery<BasRoadmapMilestone[]>({
    queryKey: ["/api/bas/roadmap"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: council } = useQuery<BasCouncilMember[]>({
    queryKey: ["/api/bas/council"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: faq } = useQuery<BasFaqEntry[]>({
    queryKey: ["/api/bas/faq"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-royal-gold" />
      </div>
    );
  }

  const heroTitle = getConfigValue(config, "hero_title", "BAS Token");
  const heroSubtitle = getConfigValue(config, "hero_subtitle", "Stewardship. Governance. Treasury Participation.");
  const purposeStatement = getConfigValue(config, "purpose_statement");
  const tokenName = getConfigValue(config, "token_name", "Ecclesia Basilikos");
  const ticker = getConfigValue(config, "ticker", "BAS");
  const chain = getConfigValue(config, "chain", "Solana (SPL Token)");
  const totalSupply = getConfigValue(config, "total_supply", "144,000,000");
  const inflation = getConfigValue(config, "inflation", "None — Fixed Supply");
  const governanceModel = getConfigValue(config, "governance_model");
  const biblicalBasis = getConfigValue(config, "biblical_basis");
  const legalDisclaimer = getConfigValue(config, "legal_disclaimer");

  const hasContent = config && config.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-royal-gold" />
            <h2 className="text-xl font-cinzel font-bold mb-2">Coming Soon</h2>
            <p className="text-gray-500">The BAS token whitepaper and governance documentation is being prepared.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy pt-20 pb-28 md:pt-28 md:pb-36 animate-hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/25" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={heroInitial} animate={heroAnimate} transition={heroTransition(0)}>
            <Crown className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-royal-gold animate-gold-shimmer" />
          </motion.div>

          <motion.h1
            className="font-cinzel-decorative text-4xl md:text-6xl font-bold text-white mb-4"
            initial={heroInitial}
            animate={heroAnimate}
            transition={heroTransition(0.2)}
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            className="font-cinzel text-lg md:text-xl text-royal-gold/90 mb-8"
            initial={heroInitial}
            animate={heroAnimate}
            transition={heroTransition(0.4)}
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            className="flex justify-center gap-3 flex-wrap"
            initial={heroInitial}
            animate={heroAnimate}
            transition={heroTransition(0.6)}
          >
            <Badge className="bg-royal-gold/20 text-royal-gold border border-royal-gold/40 text-sm px-4 py-1">
              {ticker}
            </Badge>
            <Badge className="bg-white/10 text-white/80 border border-white/20 text-sm px-4 py-1">
              {chain}
            </Badge>
            <Badge className="bg-white/10 text-white/80 border border-white/20 text-sm px-4 py-1">
              {totalSupply} Supply
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* PURPOSE STATEMENT */}
      {purposeStatement && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Shield className="h-10 w-10 mx-auto mb-6 text-royal-navy" />
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy dark:text-white mb-6">
                Purpose & Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {purposeStatement}
              </p>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* TOKEN OVERVIEW */}
      <RevealOnScroll>
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-royal-navy dark:text-white mb-10">
              Token Overview
            </h2>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Name", value: tokenName, icon: Crown },
                { label: "Ticker", value: ticker, icon: Coins },
                { label: "Blockchain", value: chain, icon: Scale },
                { label: "Total Supply", value: totalSupply, icon: Target },
                { label: "Inflation", value: inflation, icon: Shield },
              ].map((item) => (
                <motion.div key={item.label} variants={staggerItemVariants}>
                  <Card className="border-royal-gold/20 hover:border-royal-gold/40 transition-colors h-full">
                    <CardContent className="pt-6 text-center">
                      <item.icon className="h-8 w-8 mx-auto mb-3 text-royal-gold" />
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{item.label}</p>
                      <p className="font-cinzel font-bold text-royal-navy dark:text-white text-sm">{item.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </RevealOnScroll>

      {/* TOKENOMICS */}
      {allocations && allocations.length > 0 && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-royal-navy dark:text-white mb-10">
                Tokenomics
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Donut chart */}
                <div className="relative w-64 h-64 flex-shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(${allocations
                        .reduce<Array<string>>((acc, a, i) => {
                          const start = allocations.slice(0, i).reduce((s, x) => s + x.percentage, 0);
                          acc.push(`${a.color ?? "#D4AF37"} ${start}% ${start + a.percentage}%`);
                          return acc;
                        }, [])
                        .join(", ")})`,
                    }}
                  />
                  <div className="absolute inset-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-cinzel-decorative text-2xl font-bold text-royal-navy dark:text-white">BAS</p>
                      <p className="text-xs text-gray-500">{totalSupply}</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-4">
                  {allocations.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: a.color ?? "#D4AF37" }}
                      />
                      <div>
                        <p className="font-bold text-royal-navy dark:text-white">
                          {a.category} — {a.percentage}%
                        </p>
                        {a.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{a.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* GOVERNANCE */}
      {governanceModel && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-royal-navy text-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center mb-10">
                Governance Model
              </h2>

              <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-10">
                {[
                  { icon: Vote, title: "1 Token = 1 Vote", desc: "Every BAS holder has an equal voice proportional to their stewardship stake." },
                  { icon: Users, title: "Stewardship Council", desc: "Founder-appointed council proposes resolutions for community consideration." },
                  { icon: Scale, title: "Transparent Process", desc: "All proposals, votes, and treasury actions are recorded on-chain." },
                ].map((item) => (
                  <motion.div key={item.title} variants={staggerItemVariants}>
                    <Card className="bg-white/10 border-white/20 h-full">
                      <CardContent className="pt-6 text-center">
                        <item.icon className="h-10 w-10 mx-auto mb-4 text-royal-gold" />
                        <h3 className="font-cinzel font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white/70 text-sm">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </StaggerContainer>

              <p className="text-white/80 text-center max-w-3xl mx-auto leading-relaxed">
                {governanceModel}
              </p>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* STEWARDSHIP COUNCIL */}
      {council && council.length > 0 && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-royal-navy dark:text-white mb-10">
                Stewardship Council
              </h2>
              <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {council.map((member) => (
                  <motion.div key={member.id} variants={staggerItemVariants}>
                    <Card className="border-royal-gold/20 h-full">
                      <CardContent className="pt-6 text-center">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-royal-gold/30"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-royal-navy/10 flex items-center justify-center">
                            <Users className="h-8 w-8 text-royal-navy/40" />
                          </div>
                        )}
                        <h3 className="font-cinzel font-bold text-royal-navy dark:text-white">{member.name}</h3>
                        <Badge className="mt-1 bg-royal-gold/10 text-royal-gold border-royal-gold/30">{member.role}</Badge>
                        {member.bio && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </StaggerContainer>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* TREASURY TRANSPARENCY */}
      <RevealOnScroll>
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Landmark className="h-10 w-10 mx-auto mb-6 text-royal-gold" />
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy dark:text-white mb-4">
              Treasury Transparency
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              All treasury operations are conducted with full transparency. The assembly's financial stewardship
              is overseen by the governance council and subject to community oversight.
            </p>
            <Link href="/treasury">
              <Button variant="outline" className="border-royal-gold text-royal-gold hover:bg-royal-gold/10">
                View Treasury <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </RevealOnScroll>

      {/* ROADMAP */}
      {roadmap && roadmap.length > 0 && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-royal-navy dark:text-white mb-10">
                Roadmap
              </h2>
              <div className="space-y-0">
                {roadmap.map((milestone, i) => {
                  const StatusIcon = statusIcons[milestone.status] ?? Target;
                  const colorClass = statusColors[milestone.status] ?? statusColors.upcoming;
                  return (
                    <div key={milestone.id} className="relative flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${colorClass}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        {i < roadmap.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-600 my-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-8 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-cinzel font-bold text-royal-navy dark:text-white">
                            {milestone.title}
                          </h3>
                          {milestone.targetDate && (
                            <Badge variant="outline" className="text-xs">{milestone.targetDate}</Badge>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* BIBLICAL ALIGNMENT */}
      {biblicalBasis && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-royal-burgundy/5 dark:bg-royal-burgundy/10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto mb-6 text-royal-burgundy" />
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy dark:text-white mb-6">
                Biblical Alignment
              </h2>
              <blockquote className="italic text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-royal-gold pl-6 text-left">
                {biblicalBasis}
              </blockquote>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <RevealOnScroll>
          <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-royal-navy dark:text-white mb-10">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faq.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="font-cinzel font-bold text-royal-navy dark:text-white text-left">
                      {entry.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {entry.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* LEGAL DISCLAIMER */}
      {legalDisclaimer && (
        <section className="py-12 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-cinzel text-sm uppercase tracking-wider text-gray-500 mb-3">Legal Disclaimer</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {legalDisclaimer}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
