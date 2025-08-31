"use client"
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  MoreHorizontal,
  Bell,
  Zap,
  Target,
  Globe,
  Mail,
  Upload,
  FolderOpen,
  Shield,
  Settings,
  Star,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

useRouter

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = {
    accountingFirms: "500+",
    documentsProcessed: "10M+",
    timeSaved: "75%"
  };

  const features = [
    {
      icon: Mail,
      title: "Smart Email Requests",
      description: "Send professional document requests with one click. Custom templates and automated follow-ups save you hours.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Upload,
      title: "Simple Client Upload",
      description: "Clients get a secure portal to upload documents directly. No email attachments, no confusion.",
      gradient: "from-emerald-500 to-blue-500"
    },
    {
      icon: FolderOpen,
      title: "Systematic Storage",
      description: "All documents are automatically organized by client and category. Find any file in seconds, not minutes.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Activity,
      title: "Real-time Tracking",
      description: "Know exactly which documents are pending, received, or need follow-up. Complete visibility into your workflow.",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, SOC 2 compliance, and secure client portals protect sensitive financial data.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: Settings,
      title: "Automated Workflows",
      description: "Set up rules for automatic sorting, reminders, and notifications. Let the system work while you focus on accounting.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Martinez",
      role: "Partner, Martinez & Associates CPA",
      content: "DocFlow transformed our practice. We went from spending entire days chasing documents to having everything organized automatically. Our clients love how easy it is to submit their files.",
      initials: "SM",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      name: "Michael Johnson",
      role: "Managing Partner, Johnson Tax Group",
      content: "The time savings are incredible. What used to take us weeks of back-and-forth emails now happens automatically. DocFlow pays for itself within the first month.",
      initials: "MJ",
      gradient: "from-emerald-500 to-blue-500"
    },
    {
      name: "Lisa Williams",
      role: "Senior Partner, Williams Financial Services",
      content: "Our clients constantly compliment us on how professional and easy our document process is now. It's become a competitive advantage for our firm.",
      initials: "LW",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: 49,
      description: "Perfect for solo practitioners",
      features: [
        "Up to 25 clients",
        "5GB document storage",
        "Email automation",
        "Client portal",
        "Basic analytics"
      ],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: 129,
      description: "Best for growing firms",
      features: [
        "Up to 100 clients",
        "50GB document storage",
        "Advanced automation",
        "Custom branding",
        "Advanced analytics",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: 299,
      description: "For large accounting firms",
      features: [
        "Unlimited clients",
        "500GB document storage",
        "AI-powered categorization",
        "API integrations",
        "Dedicated support manager",
        "Custom integrations"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const quickActions = [
    { title: 'Add New Client', icon: Users, color: 'from-blue-600 to-blue-500', description: 'Onboard a new client' },
    { title: 'Generate Report', icon: BarChart3, color: 'from-purple-600 to-purple-500', description: 'Create analytics report' },
    { title: 'Schedule Meeting', icon: Calendar, color: 'from-emerald-600 to-emerald-500', description: 'Book client meeting' },
    { title: 'Send Reminders', icon: Bell, color: 'from-amber-600 to-amber-500', description: 'Notify pending clients' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50' : 'bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/30'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                DocFlow
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
              
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2 rounded-lg font-medium transition-all duration-200">
                  Get Started
                </button>
                </Link>
              
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700/50">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
                <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
                <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
                <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2 rounded-lg font-medium transition-all duration-200 w-fit">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Streamline Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Document Workflow
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Save hours every week with our intelligent document management system. 
                No more chasing clients for documents or losing files in email threads.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105">
                  Start Free Trial
                </button>
                <button className="border border-slate-600 hover:border-slate-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-slate-800/50">
                  Watch Demo
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.accountingFirms}</div>
                  <div className="text-slate-400">Accounting Firms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.documentsProcessed}</div>
                  <div className="text-slate-400">Documents Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{stats.timeSaved}</div>
                  <div className="text-slate-400">Time Saved</div>
                </div>
              </div>
            </div>

            {/* Hero Animation */}
            <div className="relative">
              <div className="animate-pulse">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl transform rotate-3">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Client Documents</h3>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">Tax Documents 2024</span>
                      <span className="text-emerald-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">Bank Statements</span>
                      <span className="text-amber-400 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">Receipts Q4</span>
                      <span className="text-emerald-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-4 rounded-xl transform -rotate-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">Document Uploaded!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/30 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Everything You Need to Manage Documents
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From automated requests to secure storage, we've built the complete solution for modern accounting firms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-700/30 transition-all duration-300 group">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Stop Wasting Time on Document Chaos
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Save 15+ Hours Per Week",
                    description: "Eliminate the back-and-forth of document collection. Our automated system handles the heavy lifting."
                  },
                  {
                    title: "Improve Client Experience",
                    description: "Clients love the simple upload process. No more confusing email chains or lost attachments."
                  },
                  {
                    title: "Never Lose a Document",
                    description: "Smart organization and search means every document is exactly where you expect it to be."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{benefit.title}</h3>
                      <p className="text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Time Saved This Month</h3>
                  <span className="text-emerald-400 font-bold flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +127%
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Document Requests", hours: 47, width: "85%" },
                    { label: "File Organization", hours: 23, width: "70%" },
                    { label: "Client Follow-ups", hours: 19, width: "60%" }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-white font-semibold">{item.hours} hours</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: item.width }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-600 text-center">
                  <div className="text-3xl font-bold text-emerald-400">89 hours</div>
                  <div className="text-slate-400">Total time saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-800/30 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Trusted by Leading Accounting Firms
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {testimonial.initials}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your firm. All plans include our core features and 24/7 support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-slate-800/30 backdrop-blur-sm border rounded-2xl p-8 relative ${
                plan.popular ? 'border-blue-500' : 'border-slate-700/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400 ml-2">/month</span>
                  </div>
                  <p className="text-slate-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 mb-4">All plans include 14-day free trial • No setup fees • Cancel anytime</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Shield, text: "SOC 2 Compliant" },
                { icon: CheckCircle, text: "99.9% Uptime" },
                { icon: Bell, text: "24/7 Support" }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <item.icon className="w-5 h-5 text-emerald-400 mr-2" />
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of accounting professionals who have already streamlined their document workflow with DocFlow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105">
              Start Your Free Trial
            </button>
            <button className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/10">
              Schedule a Demo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { number: "14 Days", label: "Free Trial" },
              { number: "No Setup", label: "Fees or Contracts" },
              { number: "5 Min", label: "Setup Time" }
            ].map((item, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-white mb-2">{item.number}</div>
                <div className="text-blue-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  DocFlow
                </span>
              </div>
              <p className="text-slate-400 mb-6">
                Streamlining document management for accounting professionals worldwide.
              </p>
              <div className="flex space-x-4">
                {[Globe, Mail, Users].map((Icon, index) => (
                  <a key={index} href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-slate-300" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "API"]
              },
              {
                title: "Company", 
                links: ["About", "Blog", "Careers", "Contact"]
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "Status", "Security"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                © 2024 DocFlow. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, index) => (
                  <a key={index} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}