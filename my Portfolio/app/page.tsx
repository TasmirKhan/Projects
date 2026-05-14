"use client";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Github, Linkedin, Moon, Sun, ArrowUpRight, Mail, Copy } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const skills = {
  Programming: ["Java", "Python", "C++", "JavaScript", "TypeScript"],
  "AI/ML": ["Scikit-Learn", "TensorFlow", "Pandas", "NumPy", "Matplotlib"],
  Web: ["React", "Next.js", "Tailwind", "Node.js"],
  Database: ["SQL", "MySQL"],
  Tools: ["Git", "GitHub", "VS Code"]
};

const projects = ["AI Chatbot", "Recommendation System", "Fraud Detection System", "Portfolio Website", "DSA Visualizer", "ML Prediction App"];

export default function Home() {
  const { theme, setTheme } = useTheme();
  return (
    <main className="relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-30 animate-grid -z-10" />
      <nav className="sticky top-0 z-50 glass mx-4 mt-4 rounded-full px-6 py-3 flex justify-between items-center">
        <p className="font-semibold">Tasmir Khan</p>
        <div className="flex items-center gap-3">
          {['about','skills','projects','contact'].map(s => <a key={s} href={`#${s}`} className="text-sm capitalize hover:text-indigo-400">{s}</a>)}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="toggle theme">{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
      </nav>

      <section className="min-h-screen flex items-center px-6 md:px-16" id="hero">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-indigo-400">Hello, I&apos;m</p><h1 className="text-5xl md:text-7xl font-bold">Tasmir Khan</h1>
            <TypeAnimation sequence={["AI/ML Engineer",1200,"Software Developer",1200,"DSA Enthusiast",1200]} repeat={Infinity} className="text-2xl text-cyan-400 mt-3" />
            <p className="mt-6 text-foreground/80">Passionate software engineer focused on Artificial Intelligence, Machine Learning, Data Structures & Algorithms, and scalable software systems.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400">View Projects</a>
              <button className="px-5 py-3 rounded-xl glass">Download Resume</button>
              <a href="#contact" className="px-5 py-3 rounded-xl border">Contact Me</a>
            </div>
          </motion.div>
          <motion.div className="glass rounded-3xl p-8 animate-float" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 flex items-center justify-center text-6xl">👨‍💻</div>
            <div className="flex gap-4 mt-6">
              <Link href="https://github.com/TasmirKhan"><Github /></Link><Link href="https://www.linkedin.com/in/khantasmir/"><Linkedin /></Link><Link href="https://leetcode.com/u/Tasmir_Khan/">LC</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">About</h2><p className="max-w-3xl text-foreground/80">I build intelligent products that blend clean software architecture, practical ML, and high-performance algorithmic thinking.</p>
      <div className="grid md:grid-cols-4 gap-4 mt-8">{["LeetCode Problems Solved","GitHub Repositories","Technologies Learned","Projects Built"].map((s,i)=><motion.div key={s} whileHover={{scale:1.03}} className="glass p-5 rounded-2xl"><p className="text-2xl font-bold">{[350,65,40,20][i]}+</p><p>{s}</p></motion.div>)}</div></section>

      <section id="skills" className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">Skills</h2><div className="grid md:grid-cols-2 gap-5">{Object.entries(skills).map(([k,v])=><div key={k} className="glass p-6 rounded-2xl"><h3 className="text-xl font-semibold mb-4">{k}</h3>{v.map(item=><div key={item} className="mb-3"><div className="flex justify-between text-sm"><span>{item}</span><span>90%</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{width:0}} whileInView={{width:"90%"}} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"/></div></div>)}</div>)}</div></section>

      <section id="projects" className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">Projects</h2><div className="grid md:grid-cols-3 gap-6">{projects.map(p=><motion.article key={p} whileHover={{y:-6}} className="glass rounded-2xl overflow-hidden"><div className="h-40 bg-gradient-to-br from-indigo-500/40 to-cyan-500/30"/><div className="p-5"><h3 className="font-semibold text-xl">{p}</h3><p className="text-sm text-foreground/75 mt-2">Production-inspired project focused on robust engineering, measurable performance, and user-centric impact.</p><div className="flex flex-wrap gap-2 mt-3">{["Next.js","TypeScript","AI"].map(t=><span key={t} className="text-xs px-2 py-1 rounded-full bg-white/10">{t}</span>)}</div><div className="flex gap-2 mt-4"><button className="px-3 py-2 rounded-lg bg-indigo-500">GitHub</button><button className="px-3 py-2 rounded-lg border">Live Demo</button></div></div></motion.article>)}</div></section>

      <section className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">DSA & Coding Profile</h2><div className="grid md:grid-cols-3 gap-5">{["LeetCode: 350+","GitHub: 900+ commits","Contest Rating: 1700+"].map(s=><div key={s} className="glass p-6 rounded-2xl">{s}</div>)}</div></section>
      <section className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">Experience Timeline</h2><div className="border-l border-indigo-400/40 ml-3">{["Learning Journey","AI/ML Exploration","DSA Mastery","Open Source Contributions","Project Milestones"].map(s=><div key={s} className="ml-6 mb-6 relative"><span className="absolute -left-[34px] top-1 h-3 w-3 bg-indigo-400 rounded-full"/><h3 className="font-semibold">{s}</h3></div>)}</div></section>
      <section className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">Blog</h2><div className="grid md:grid-cols-4 gap-4">{["Dynamic Programming Guide","Machine Learning Basics","System Design Concepts","AI Trends"].map(b=><article key={b} className="glass p-5 rounded-xl"><h3>{b}</h3></article>)}</div></section>

      <section id="contact" className="px-6 md:px-16 py-20"><h2 className="text-4xl font-bold mb-6">Contact</h2><div className="max-w-2xl glass p-6 rounded-2xl space-y-3"><input placeholder="Email" className="w-full p-3 rounded bg-white/10"/><textarea placeholder="Message" className="w-full p-3 rounded bg-white/10 h-32"/><button className="px-4 py-3 rounded-lg bg-indigo-500">Send Message</button><button className="px-4 py-3 rounded-lg border ml-2 inline-flex items-center gap-2" onClick={() => {navigator.clipboard.writeText("tasmir@example.com"); toast.success("Email copied!");}}><Copy size={16}/> Copy email</button></div></section>
      <footer className="px-6 md:px-16 py-10 border-t border-white/10 flex justify-between"><p>© {new Date().getFullYear()} Tasmir Khan</p><a href="#hero" className="inline-flex items-center gap-1">Back to top <ArrowUpRight size={14}/></a></footer>
    </main>
  );
}
