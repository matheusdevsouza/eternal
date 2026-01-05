"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * CTA (Call to Action) Component
 * 
 * Seção final de chamada para ação.
 * Incentiva o usuário a converter (criar conta ou ver planos) antes do rodapé.
 * Utiliza gradientes e padrões de fundo para destaque visual.
 */
export default function CTA() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-[var(--bg-deep)] via-[var(--bg-section)] to-[var(--bg-deep)]">

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            <span className="text-[var(--text)]">Ready to create your</span>{" "}
            <span className="text-[var(--primary)]">eternal gift?</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Join thousands of couples who have already transformed their moments into
            unforgettable digital memories
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-105 active:scale-95 text-center"
            >
              Start Now
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--primary)] text-[var(--text)] font-bold rounded-2xl transition-all text-center"
            >
              I already have an account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
