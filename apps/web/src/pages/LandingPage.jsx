import { ArrowUpRight } from "lucide-react";
import React from "react";
import Button from "../components/ui/Button.jsx";
import { Sparkles, Leaf, CheckCircle2 } from "lucide-react";
import Brand from "../components/ui/Brand.jsx";
import { auth } from "../services/auth.js";
export default function LandingPage() {
  return (
    <div className="landing">
      <header>
        <Brand />
        <span className="local-label">Desarrollo profesional · MVP</span>
      </header>
      <main>
        <div className="eyebrow">
          <span /> TU TALENTO TIENE UN LUGAR
        </div>
        <h1>
          Tu próximo paso
          <br />
          empieza con <em>lo que sabes.</em>
        </h1>
        <p>
          Descubre prácticas que conectan contigo, identifica nuevas habilidades
          y construye el camino hacia tu futuro profesional.
        </p>
        <div className="landing-actions">
          <Button onClick={() => auth.login()}>
            Ingresar a TalentMatch <ArrowUpRight size={18} />
          </Button>
          <Button variant="secondary" onClick={() => auth.register()}>
            Crear cuenta de estudiante
          </Button>
        </div>
        <div className="demo">
          <strong>Explora el prototipo</strong>
          <p>
            Estudiante: <code>estudiante</code> · Empresa: <code>empresa</code>
            <br />
            Contraseña de ambas cuentas: <code>Demo2026!</code>
          </p>
        </div>
      </main>
      <div className="landing-art">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="art-center">
          <Leaf size={62} />
        </div>
        <div className="floating f-one">
          <CheckCircle2 /> Habilidades con propósito
        </div>
        <div className="floating f-two">
          <Sparkles /> Tu siguiente oportunidad
        </div>
        <span className="art-foot">APRENDE. CONECTA. CRECE.</span>
      </div>
      <footer>
        TalentMatch IA · Electiva 5 <span>Hecho para dar el primer paso.</span>
      </footer>
    </div>
  );
}
