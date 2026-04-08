import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Github, Youtube, ArrowUpRight, Shield, Award, Zap } from 'lucide-react';

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => (
  <footer className={`${isDark ? 'bg-zinc-950 text-slate-400 border-white/5' : 'bg-white text-slate-500 border-slate-200'} border-t transition-colors duration-300`}>
    {/* Top Brand Bar */}
    <div className={`border-b py-12 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
      <div className="max-w-[1920px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-xl shadow-yellow-400/10">
              <BarChart3 className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Build<span className="text-yellow-400">More</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Infra Operating System</span>
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed max-w-sm">
            Revolutionizing the construction supply chain through data-driven procurement and technical precision. Verified manufacturers, global logistics, and real-time compliance.
          </p>
        </div>
        
        <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-8 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Weekly Market Analytics</span>
            <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Join 12,000+ Enterprises</span>
          </div>
          <div className="flex group min-w-[300px]">
            <input 
              type="email" 
              placeholder="ENTERPRISE EMAIL" 
              className={`border-y border-l rounded-l-xl text-[10px] font-black py-4 px-6 w-full outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'}`}
            />
            <button className={`px-6 rounded-r-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-slate-900 text-white hover:bg-black'}`}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Middle Section: Navigation */}
    <div className="max-w-[1920px] mx-auto px-10 py-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-16 gap-x-10">
        <div className="space-y-6">
          <h5 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Market Sectors</h5>
          <ul className="space-y-4 text-xs font-bold capitalize">
            <li><Link to="/products" className="hover:text-yellow-400 transition-colors flex items-center group">Bulk Materials <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
            <li><Link to="/products" className="hover:text-yellow-400 transition-colors flex items-center group">Industrial Tools <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
            <li><Link to="/products" className="hover:text-yellow-400 transition-colors flex items-center group">Safety Gear <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
            <li><Link to="/products" className="hover:text-yellow-400 transition-colors flex items-center group">Electrical Kits <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Operations</h5>
          <ul className="space-y-4 text-xs font-bold capitalize">
            <li><Link to="/logistics" className="hover:text-yellow-400 transition-colors">Global Freight</Link></li>
            <li><Link to="/compliance" className="hover:text-yellow-400 transition-colors">ISO Compliance</Link></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Price Benchmarking</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">LTL Logistics</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Company</h5>
          <ul className="space-y-4 text-xs font-bold capitalize">
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Strategic Vision</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Sustainability</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Newsroom</a></li>
          </ul>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <h5 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Presence</h5>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex flex-col">
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Innovation Hub (UK)</span>
                <p className="text-xs font-medium">BuildMore House, Canary Wharf, London E14 5LB, United Kingdom</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <Phone className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">+44 (0) 20 7946 0123</span>
              </div>
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <Globe className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Global Service Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Footer: Compliance & Social */}
    <div className={`border-t py-10 ${isDark ? 'bg-black border-white/5' : 'bg-slate-100 border-slate-200'}`}>
      <div className="max-w-[1920px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">© 2026 BuildMore Technologies. All rights reserved.</p>
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ISO 9001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global Excellence 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Net Zero Operations</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {[Linkedin, Twitter, Github, Youtube].map((Icon, i) => (
            <a key={i} href="#" className={`p-2.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:border-yellow-400/50 hover:bg-white/10 text-slate-500 hover:text-yellow-400' : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md text-slate-400 hover:text-slate-900'}`}>
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
