'use client';

import { API_BASE } from '@/lib/apiBase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Crown, Sparkles, Gem, Heart, Shield, Users, Eye } from 'lucide-react';
const STATS = [
  { label: 'Indigenous job seekers supported', value: '2,500+', icon: Users, color: '#FFD700' },
  { label: 'Employers with RAP commitments', value: '120+', icon: Crown, color: '#50C878' },
  { label: 'Mentorship connections made', value: '850+', icon: Heart, color: '#E85B8A' },
  { label: 'Training courses completed', value: '1,200+', icon: Sparkles, color: '#87CEEB' },
];

const VALUES = [
  {
    icon: Crown,
    color: '#FFD700',
    title: 'Cultural Respect',
    description:
      'We honour the diversity of Aboriginal and Torres Strait Islander peoples, recognising that each community has its own unique culture, traditions, and knowledge systems.',
  },
  {
    icon: Users,
    color: '#50C878',
    title: 'Community First',
    description:
      'Our platform was designed with and for Indigenous communities. Every feature is guided by community input and Indigenous data sovereignty principles.',
  },
  {
    icon: Sparkles,
    color: '#E85B8A',
    title: 'Empowerment',
    description:
      'We believe in creating pathways, not barriers. Our goal is to empower individuals with the skills, connections, and opportunities they need to thrive.',
  },
  {
    icon: Shield,
    color: '#87CEEB',
    title: 'Data Sovereignty',
    description:
      'Your data belongs to you. We follow CARE principles (Collective Benefit, Authority to Control, Responsibility, Ethics) for Indigenous data governance.',
  },
  {
    icon: Heart,
    color: '#B76E79',
    title: 'Sustainable Impact',
    description:
      'We measure success not just in placements, but in long-term career growth, community benefit, and closing the gap outcomes.',
  },
  {
    icon: Eye,
    color: '#9B7EC4',
    title: 'Accessibility',
    description:
      'Our platform is designed to be accessible to everyone, including those in remote areas with limited connectivity. WCAG AA compliant.',
  },
];

const TEAM = [
  {
    name: 'Community Advisory Council',
    role: 'Cultural Guidance',
    description: 'Elders and community leaders who guide our cultural protocols and community engagement.',
    color: '#FFD700',
  },
  {
    name: 'Indigenous Employment Partners',
    role: 'Industry Connections',
    description: 'RAP-committed employers dedicated to creating meaningful employment opportunities.',
    color: '#50C878',
  },
  {
    name: 'TAFE & RTO Network',
    role: 'Training Pathways',
    description: 'Education providers offering culturally safe training and accredited qualifications.',
    color: '#E85B8A',
  },
  {
    name: 'Mentor Network',
    role: 'Career Guidance',
    description: 'Experienced professionals and Elders providing mentorship and career support.',
    color: '#87CEEB',
  },
];

export default function AboutPage() {
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    // Optionally fetch real stats from API
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/analytics/public-stats`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats([
              { label: 'Indigenous job seekers supported', value: `${data.stats.members?.toLocaleString() || '2,500'}+`, icon: Users, color: '#FFD700' },
              { label: 'Employers with RAP commitments', value: `${data.stats.companies?.toLocaleString() || '120'}+`, icon: Crown, color: '#50C878' },
              { label: 'Mentorship connections made', value: `${data.stats.mentorships?.toLocaleString() || '850'}+`, icon: Heart, color: '#E85B8A' },
              { label: 'Training courses completed', value: `${data.stats.courses?.toLocaleString() || '1,200'}+`, icon: Sparkles, color: '#87CEEB' },
            ]);
          }
        }
      } catch {
        // Use default stats
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Celestial background overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(80, 200, 120, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(228, 91, 138, 0.1) 0%, transparent 40%)
          `
        }}
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          {/* Noble badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(183, 110, 121, 0.1))', border: '1px solid rgba(255, 215, 0, 0.4)' }}>
            <Crown className="w-5 h-5" style={{ color: '#FFD700' }} />
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#FFD700' }}>Our Story</span>
            <Gem className="w-5 h-5" style={{ color: '#50C878' }} />
          </div>

          <h1 
            className="text-4xl md:text-5xl font-bold mb-6 text-gradient-gold"
            style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.3)' }}
          >
            About Ngurra Pathways
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'rgba(248, 246, 255, 0.85)' }}>
            Ngurra means "home" or "country" in many Aboriginal languages. We're building a platform 
            that creates pathways home—to fulfilling careers, supportive communities, and a future 
            where Indigenous Australians thrive in the workplace. ✨
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #C41E3A, #E85B8A)',
                color: 'white',
                border: '2px solid #FFD700',
                boxShadow: '0 4px 20px rgba(196, 30, 58, 0.35), 0 0 15px rgba(255, 215, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(196, 30, 58, 0.45), 0 0 25px rgba(255, 215, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(196, 30, 58, 0.35), 0 0 15px rgba(255, 215, 0, 0.15)';
              }}
            >
              <Gem className="w-5 h-5" />
              Browse Jobs
            </Link>
            <Link
              href="/mentorship"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
              style={{ 
                background: 'transparent',
                color: '#FFD700',
                border: '2px solid rgba(255, 215, 0, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Sparkles className="w-5 h-5" />
              Find a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16 px-6 relative z-10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(26, 15, 46, 0.6), rgba(45, 27, 105, 0.4))',
          borderTop: '1px solid rgba(255, 215, 0, 0.15)',
          borderBottom: '1px solid rgba(255, 215, 0, 0.15)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`, border: `1px solid ${stat.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2 text-gradient-gold">
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(248, 246, 255, 0.7)' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(80, 200, 120, 0.1)', border: '1px solid rgba(80, 200, 120, 0.3)' }}>
            <Heart className="w-4 h-4" style={{ color: '#50C878' }} />
            <span className="text-sm font-medium" style={{ color: '#50C878' }}>Our Mission</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gradient-gold">Building Noble Pathways</h2>
          <p className="text-lg mb-6" style={{ color: 'rgba(248, 246, 255, 0.85)' }}>
            Ngurra Pathways exists to close the employment gap for Aboriginal and Torres Strait Islander 
            peoples by connecting job seekers with culturally safe employers, meaningful mentorship, 
            and accredited training pathways.
          </p>
          <p className="text-lg" style={{ color: 'rgba(248, 246, 255, 0.8)' }}>
            We partner with employers who have genuine Reconciliation Action Plans (RAPs) and a 
            commitment to creating inclusive workplaces. Our platform is built on Indigenous data 
            sovereignty principles, ensuring that community members maintain control over their data.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section 
        className="py-20 px-6 relative z-10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(26, 15, 46, 0.4), rgba(45, 27, 105, 0.3))'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(232, 91, 138, 0.1)', border: '1px solid rgba(232, 91, 138, 0.3)' }}>
              <Crown className="w-4 h-4" style={{ color: '#E85B8A' }} />
              <span className="text-sm font-medium" style={{ color: '#E85B8A' }}>Core Values</span>
            </div>
            <h2 className="text-3xl font-bold text-gradient-gold">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(26, 15, 46, 0.7), rgba(45, 27, 105, 0.5))',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    boxShadow: '0 8px 30px rgba(26, 15, 46, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${value.color}60`;
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(26, 15, 46, 0.5), 0 0 25px ${value.color}20`;
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(26, 15, 46, 0.4)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${value.color}20, ${value.color}10)`,
                      border: `1px solid ${value.color}40`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F6FF' }}>{value.title}</h3>
                  <p className="text-sm" style={{ color: 'rgba(248, 246, 255, 0.7)' }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(135, 206, 235, 0.1)', border: '1px solid rgba(135, 206, 235, 0.3)' }}>
              <Users className="w-4 h-4" style={{ color: '#87CEEB' }} />
              <span className="text-sm font-medium" style={{ color: '#87CEEB' }}>Our Partners</span>
            </div>
            <h2 className="text-3xl font-bold text-gradient-gold">Who We Work With</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((partner, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(26, 15, 46, 0.6), rgba(45, 27, 105, 0.4))',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: '0 8px 30px rgba(26, 15, 46, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${partner.color}50`;
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(26, 15, 46, 0.5), 0 0 20px ${partner.color}15`;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(26, 15, 46, 0.4)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div 
                  className="text-sm font-semibold mb-2 px-3 py-1 rounded-full inline-block"
                  style={{ background: `${partner.color}20`, color: partner.color }}
                >
                  {partner.role}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#F8F6FF' }}>{partner.name}</h3>
                <p className="text-sm" style={{ color: 'rgba(248, 246, 255, 0.7)' }}>{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acknowledgement Section */}
      <section 
        className="py-20 px-6 relative z-10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.1), rgba(26, 15, 46, 0.9))'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="rounded-2xl p-8"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(196, 30, 58, 0.03), rgba(26, 15, 46, 0.8))',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 12px 40px rgba(26, 15, 46, 0.4), 0 0 40px rgba(255, 215, 0, 0.08), inset 0 0 60px rgba(255, 215, 0, 0.02)'
            }}
          >
            <Crown className="w-10 h-10 mx-auto mb-4" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl font-bold mb-6 text-gradient-gold">Acknowledgement of Country</h2>
            <p className="mb-6" style={{ color: 'rgba(248, 246, 255, 0.9)' }}>
              Ngurra Pathways acknowledges the Traditional Custodians of the lands on which we work 
              and live. We pay our respects to Elders past, present, and emerging, and recognise the 
              continuing connection of Aboriginal and Torres Strait Islander peoples to land, waters, 
              and community.
            </p>
            <p className="text-sm italic" style={{ color: '#B76E79' }}>
              We acknowledge that sovereignty was never ceded. Always was, always will be Aboriginal land. ✨
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="rounded-2xl p-10"
            style={{ 
              background: 'linear-gradient(135deg, rgba(196, 30, 58, 0.1), rgba(80, 200, 120, 0.08), rgba(26, 15, 46, 0.9))',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 12px 40px rgba(26, 15, 46, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.02)'
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gradient-gold">Ready to Start Your Journey?</h2>
            <p className="mb-8" style={{ color: 'rgba(248, 246, 255, 0.8)' }}>
              Whether you're looking for your next career opportunity, seeking a mentor, or wanting 
              to upskill, we're here to support you every step of the way. ✨
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/company/setup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #C41E3A, #E85B8A)',
                  color: 'white',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 20px rgba(196, 30, 58, 0.35), 0 0 15px rgba(255, 215, 0, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(196, 30, 58, 0.45), 0 0 25px rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(196, 30, 58, 0.35), 0 0 15px rgba(255, 215, 0, 0.15)';
                }}
              >
                <Gem className="w-5 h-5" />
                Create Account
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
                style={{ 
                  background: 'transparent',
                  color: '#FFD700',
                  border: '2px solid rgba(255, 215, 0, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Sparkles className="w-5 h-5" />
                Get Help
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
