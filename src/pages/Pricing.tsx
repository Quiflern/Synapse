import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Pricing - Subscription plans page with animated background
 *
 * Displays different pricing tiers with features and signup options
 */
const Pricing: React.FC = () => {
  const { isDarkTheme, theme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const plans = [
    {
      name: "Free",
      description: "For casual listeners",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Upload up to 50 tracks",
        "Basic music player",
        "Create playlists",
        "Limited memory features",
        "Standard audio quality",
      ],
      missingFeatures: [
        "No ads",
        "Advanced visualizations",
        "AI-powered recommendations",
        "Offline listening",
        "Priority support",
      ],
      ctaText: "Free (During Beta)",
      popular: false,
    },
    {
      name: "Pro",
      description: "For music enthusiasts",
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        "Upload unlimited tracks",
        "Advanced music player",
        "Create unlimited playlists",
        "Full memory features",
        "High-quality audio",
        "No ads",
        "Advanced visualizations",
      ],
      missingFeatures: [
        "AI-powered recommendations",
        "Offline listening",
        "Priority support",
      ],
      ctaText: "Free (During Beta)",
      popular: true,
    },
    {
      name: "Premium",
      description: "For audiophiles",
      price: { monthly: 19.99, yearly: 199.99 },
      features: [
        "Upload unlimited tracks",
        "Advanced music player",
        "Create unlimited playlists",
        "Full memory features",
        "Lossless audio quality",
        "No ads",
        "Advanced visualizations",
        "AI-powered recommendations",
        "Offline listening",
        "Priority support",
      ],
      missingFeatures: [],
      ctaText: "Free (During Beta)",
      popular: false,
    },
  ];

  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  // Calculate savings percentage for yearly billing
  const calculateSavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100;
    return Math.round(savings);
  };

  // Render animated background gradient based on theme
  const renderBackground = () => {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Grid overlay with improved visibility */}
        <div
          className={`absolute inset-0 ${isDarkTheme ? "bg-black/70" : "bg-white/40"}`}
        >
          <div
            className={`w-full h-full ${
              isDarkTheme
                ? "bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]"
                : "bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)]"
            } bg-[size:5rem_5rem]`}
          ></div>
        </div>

        {/* Interactive gradient blobs that follow cursor */}
        <div
          id="cursor-follow-container"
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-electric opacity-20 rounded-full filter blur-[100px]"
            animate={{
              y: [0, 50, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-1/3 -right-20 w-96 h-96 bg-cyber opacity-20 rounded-full filter blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute -bottom-40 left-40 w-96 h-96 bg-neon opacity-20 rounded-full filter blur-[100px]"
            animate={{
              y: [0, -30, 0],
              x: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>
      </div>
    );
  };

  // Add cursor follow effect for gradient blobs
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById("cursor-follow-container");
      if (!container) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const blobs = container.children;
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i] as HTMLDivElement;
        const speed = i * 0.05 + 0.05;
        const x = (mouseX - window.innerWidth / 2) * speed;
        const y = (mouseY - window.innerHeight / 2) * speed;

        blob.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Function to get theme-aware highlight color
  const getThemeHighlightColor = () => {
    if (isDarkTheme) {
      switch (theme) {
        case "cyberpunk":
          return "hover:bg-electric/20";
        case "midnight-ash":
          return "hover:bg-[#33C3F0]/20";
        case "obsidian-veil":
          return "hover:bg-[#7E69AB]/20";
        case "noir-eclipse":
          return "hover:bg-[#9F9EA1]/20";
        case "shadow-ember":
          return "hover:bg-[#ea384d]/20";
        case "custom":
          return "hover:bg-primary/20";
        default:
          return "hover:bg-white/10";
      }
    } else {
      switch (theme) {
        case "light":
          return "hover:bg-primary/10";
        case "morning-haze":
          return "hover:bg-[#D3E4FD]/50";
        case "ivory-bloom":
          return "hover:bg-[#FFDEE2]/50";
        case "sunlit-linen":
          return "hover:bg-[#FEF7CD]/50";
        case "cloudpetal":
          return "hover:bg-[#FFDEE2]/50";
        default:
          return "hover:bg-black/5";
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full py-24 px-6 overflow-hidden">
      {/* Animated background */}
      {renderBackground()}

      {/* Content */}
      <div className="container mx-auto relative z-10 max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-4xl md:text-5xl font-bold mb-4",
              isDarkTheme ? "text-white" : "text-gray-800",
            )}
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className={cn(
              "text-lg max-w-2xl mx-auto",
              isDarkTheme ? "text-gray-300" : "text-gray-700",
            )}
          >
            Select the perfect subscription that fits your music listening needs
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10">
            <div
              className={`inline-flex p-1 rounded-full ${isDarkTheme ? "bg-black/40" : "bg-gray-100"}`}
            >
              <button
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
              </button>
            </div>
            {billingCycle === "yearly" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-primary"
              >
                Save up to 17% with yearly billing
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => {
            const price =
              billingCycle === "monthly"
                ? plan.price.monthly
                : plan.price.yearly;
            const savings = calculateSavings(
              plan.price.monthly,
              plan.price.yearly,
            );

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={cn(
                  "relative rounded-2xl transition-all duration-300",
                  isDarkTheme
                    ? "bg-black/30 backdrop-blur-xl border border-white/10"
                    : "bg-white/80 backdrop-blur-xl border border-gray-200",
                  "overflow-hidden p-6",
                  getThemeHighlightColor(),
                  plan.popular
                    ? "transform md:-translate-y-4 shadow-xl border-primary/50"
                    : "",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 -right-12 w-36 h-10 bg-primary flex items-center justify-center transform rotate-45">
                    <span className="text-primary-foreground text-xs uppercase tracking-wider font-bold">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={cn(
                      "text-2xl font-bold mb-3",
                      isDarkTheme ? "text-white" : "text-gray-800",
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={isDarkTheme ? "text-gray-400" : "text-gray-600"}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        isDarkTheme ? "text-white" : "text-gray-800",
                      )}
                    >
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span
                        className={`ml-2 mb-1 ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}
                      >
                        /{billingCycle === "monthly" ? "mo" : "year"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "yearly" && savings > 0 && (
                    <p className="text-sm text-primary mt-2">
                      Save {savings}% with yearly billing
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                    >
                      <Check
                        size={18}
                        className="text-primary mr-2 flex-shrink-0"
                      />
                      <span
                        className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {feature}
                      </span>
                    </motion.div>
                  ))}

                  {plan.missingFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center opacity-50">
                      <X
                        size={18}
                        className="text-gray-500 mr-2 flex-shrink-0"
                      />
                      <span
                        className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} line-through`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/auth" className="block w-full">
                  <Button
                    className={cn(
                      "w-full py-6 text-white",
                      plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : isDarkTheme
                          ? "bg-secondary hover:bg-secondary/80"
                          : "bg-secondary text-white hover:bg-secondary/90",
                    )}
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={cn(
            "mt-16 text-center p-10 rounded-2xl",
            isDarkTheme
              ? "bg-black/20 backdrop-blur-sm border border-white/5"
              : "bg-white/60 backdrop-blur-sm border border-gray-100",
          )}
        >
          <h3
            className={cn(
              "text-2xl font-bold mb-3",
              isDarkTheme ? "text-white" : "text-gray-800",
            )}
          >
            Need something different?
          </h3>
          <p
            className={cn(
              "max-w-2xl mx-auto mb-6",
              isDarkTheme ? "text-gray-300" : "text-gray-700",
            )}
          >
            We also offer custom plans for businesses and special use cases.
            Contact our team to discuss your specific requirements.
          </p>
          <Button
            variant="outline"
            className={cn(
              "px-8 py-6",
              isDarkTheme
                ? "border-white/20 hover:bg-white/10 text-white"
                : "border-gray-300 hover:bg-gray-100 text-gray-800",
            )}
          >
            Contact Sales
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
