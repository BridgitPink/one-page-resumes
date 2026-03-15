import Link from "next/link";
import { FileText, Sparkles, Target, Wand2 } from "lucide-react";

const templates = [
  {
    name: "Modern Minimal",
    description: "Clean, sleek, and ideal for software, data, and internship roles.",
  },
  {
    name: "Classic Professional",
    description: "Safe and polished for general business, operations, and early-career roles.",
  },
  {
    name: "Bold Technical",
    description: "Project-forward layout built for engineering, research, and technical resumes.",
  },
];

const features = [
  {
    title: "Brain-dump friendly",
    description:
      "Users do not need perfect bullet points. They can type messy experience and let AI structure it.",
    icon: Wand2,
  },
  {
    title: "Job-description aligned",
    description:
      "Paste a job description and generate a resume tailored with relevant keywords and skill matching.",
    icon: Target,
  },
  {
    title: "Harsh resume scoring",
    description:
      "Give students realistic feedback with a strict score, clear weaknesses, and practical improvements.",
    icon: Sparkles,
  },
  {
    title: "One-page focused",
    description:
      "Built specifically for college students and early professionals who need concise, polished resumes.",
    icon: FileText,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl flex-col px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            AI resume builder for students and early professionals
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Build recruiter-ready one-page resumes from messy brain dumps.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            One Page Resumes helps users turn simple, unstructured experience into
            polished STAR-style resumes tailored to tech-focused job descriptions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/builder"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Build My Resume
            </Link>

            <Link
              href="/templates"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              View Templates
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Three polished resume templates
            </h2>
            <p className="mt-3 text-slate-300">
              Start with a professional one-page layout designed for technical and
              early-career applicants.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.name}
                className="rounded-2xl border border-white/10 bg-slate-950 p-6"
              >
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-900 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-1/2 rounded bg-white/80" />
                    <div className="h-2 w-2/3 rounded bg-white/30" />
                    <div className="h-2 w-5/6 rounded bg-white/20" />
                    <div className="mt-4 h-2 w-full rounded bg-white/10" />
                    <div className="h-2 w-11/12 rounded bg-white/10" />
                    <div className="h-2 w-10/12 rounded bg-white/10" />
                    <div className="mt-4 h-2 w-1/3 rounded bg-white/20" />
                    <div className="h-2 w-full rounded bg-white/10" />
                    <div className="h-2 w-4/5 rounded bg-white/10" />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-semibold">{template.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Turn rough notes into a resume that actually competes.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Designed for students who do not know how to phrase experience, choose
            keywords, or fill a full one-page resume.
          </p>
          <div className="mt-8">
            <Link
              href="/builder"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Building
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}