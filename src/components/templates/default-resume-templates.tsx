import type { ResumeBullet } from "@/types/resume";

type ResumeLike = {
  basics?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    school?: string;
    degree?: string;
    graduationDate?: string;
    gpa?: string;
  };
  target?: {
    role?: string;
  };
  summary?: string;
  experience?: Array<{
    role?: string;
    organization?: string;
    bullets?: Array<ResumeBullet | string>;
  }>;
  experiences?: Array<{
    role?: string;
    organization?: string;
    bullets?: Array<ResumeBullet | string>;
    details?: string;
  }>;
  projects?: Array<{
    name?: string;
    bullets?: Array<ResumeBullet | string>;
    details?: string;
  }>;
  skills?:
    | string[]
    | {
        languages?: string[];
        frameworks?: string[];
        tools?: string[];
        databases?: string[];
        cloud?: string[];
        concepts?: string[];
        additional?: string[];
      };
  extras?: string[];
};

type DefaultResumeTemplateProps = {
  resume: ResumeLike;
};

function getBulletText(bullet: ResumeBullet | string): string {
  if (typeof bullet === "string") return bullet.trim();

  return (
    bullet?.polished?.trim() ||
    bullet?.expanded?.trim() ||
    bullet?.originalInput?.trim() ||
    ""
  );
}

function splitTextToBullets(text?: string): string[] {
  if (!text) return [];

  return text
    .split(/\r?\n|•|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getExperience(resume: ResumeLike) {
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    return resume.experience;
  }

  if (Array.isArray(resume.experiences) && resume.experiences.length > 0) {
    return resume.experiences.map((item) => ({
      role: item.role,
      organization: item.organization,
      bullets:
        Array.isArray(item.bullets) && item.bullets.length > 0
          ? item.bullets
          : splitTextToBullets(item.details),
    }));
  }

  return [];
}

function getProjects(resume: ResumeLike) {
  if (!Array.isArray(resume.projects)) return [];

  return resume.projects.map((item) => ({
    name: item.name,
    bullets:
      Array.isArray(item.bullets) && item.bullets.length > 0
        ? item.bullets
        : splitTextToBullets(item.details),
  }));
}

function getSkills(resume: ResumeLike) {
  const skills = resume.skills;

  if (Array.isArray(skills)) {
    return {
      languages: [] as string[],
      frameworks: [] as string[],
      tools: [] as string[],
      databases: [] as string[],
      cloud: [] as string[],
      concepts: [] as string[],
      additional: skills.filter(Boolean),
    };
  }

  return {
    languages: skills?.languages ?? [],
    frameworks: skills?.frameworks ?? [],
    tools: skills?.tools ?? [],
    databases: skills?.databases ?? [],
    cloud: skills?.cloud ?? [],
    concepts: skills?.concepts ?? [],
    additional: skills?.additional ?? [],
  };
}

function hasAnySkills(skillGroups: ReturnType<typeof getSkills>) {
  return (
    skillGroups.languages.length > 0 ||
    skillGroups.frameworks.length > 0 ||
    skillGroups.tools.length > 0 ||
    skillGroups.databases.length > 0 ||
    skillGroups.cloud.length > 0 ||
    skillGroups.concepts.length > 0 ||
    skillGroups.additional.length > 0
  );
}

function shouldShowSummary(
  summary: string | undefined,
  experience: ReturnType<typeof getExperience>,
  projects: ReturnType<typeof getProjects>
) {
  if (!summary?.trim()) return false;

  const experienceBullets = experience.reduce(
    (sum, item) => sum + (item.bullets?.length ?? 0),
    0
  );
  const projectBullets = projects.reduce(
    (sum, item) => sum + (item.bullets?.length ?? 0),
    0
  );

  const totalBullets = experienceBullets + projectBullets;

  // Show summary only if there are fewer than 6 total bullets (experience + projects)
  // This ensures the summary is included when content is sparse, helping fill the page
  return totalBullets < 6;
}

function SkillRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  const cleaned = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );

  if (cleaned.length === 0) return null;

  return (
    <p className="text-[13px] leading-6">
      <span className="font-bold">{label}: </span>
      {cleaned.join(", ")}
    </p>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-neutral-400 pb-1">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-neutral-900">
        {title}
      </h2>
    </div>
  );
}

export default function DefaultResumeTemplate({
  resume,
}: DefaultResumeTemplateProps) {
  const basics = resume.basics ?? {};
  const target = resume.target ?? {};
  const experience = getExperience(resume);
  const projects = getProjects(resume);
  const skillGroups = getSkills(resume);

  const contactItems = [
    basics.email,
    basics.phone,
    basics.location,
    basics.linkedin,
    basics.github,
  ].filter(Boolean);

  const educationLeft = [basics.school, basics.degree].filter(Boolean).join(" | ");
  const educationRight = [
    basics.graduationDate,
    basics.gpa ? `GPA: ${basics.gpa}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <article className="resume-sheet mx-auto w-full max-w-[850px] bg-white text-black shadow-sm">
      <div className="px-10 py-8">
        <header className="border-b border-black pb-4 text-center">
          <h1 className="text-[30px] font-bold uppercase tracking-[0.08em]">
            {basics.fullName || "Your Name"}
          </h1>

          {target.role ? (
            <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-700">
              {target.role}
            </p>
          ) : null}

          {contactItems.length > 0 ? (
            <p className="mt-3 text-[12px] leading-5 text-neutral-800">
              {contactItems.join(" | ")}
            </p>
          ) : null}
        </header>

        {hasAnySkills(skillGroups) ? (
          <section className="mt-5">
            <SectionTitle title="Skills" />
            <div className="mt-2 space-y-1">
              <SkillRow label="Languages" values={skillGroups.languages} />
              <SkillRow label="Frameworks & Libraries" values={skillGroups.frameworks} />
              <SkillRow label="Tools" values={skillGroups.tools} />
              <SkillRow label="Databases" values={skillGroups.databases} />
              <SkillRow label="Cloud & APIs" values={skillGroups.cloud} />
              <SkillRow label="Concepts" values={skillGroups.concepts} />
              <SkillRow label="Additional" values={skillGroups.additional} />
            </div>
          </section>
        ) : null}

        {experience.length > 0 ? (
          <section className="mt-5">
            <SectionTitle title="Experience" />
            <div className="mt-3 space-y-5">
              {experience.map((item, index) => (
                <div key={`${item.role}-${item.organization}-${index}`}>
                  <h3 className="text-[14px] font-bold">{item.role}</h3>
                  <p className="text-[13px] italic text-neutral-800">
                    {item.organization}
                  </p>

                  {item.bullets?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
                      {item.bullets.map((bullet, bulletIndex) => {
                        const text = getBulletText(bullet);
                        if (!text) return null;
                        return <li key={bulletIndex}>{text}</li>;
                      })}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {projects.length > 0 ? (
          <section className="mt-5">
            <SectionTitle title="Projects" />
            <div className="mt-3 space-y-5">
              {projects.map((project, index) => (
                <div key={`${project.name}-${index}`}>
                  <h3 className="text-[14px] font-bold">{project.name}</h3>

                  {project.bullets?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
                      {project.bullets.map((bullet, bulletIndex) => {
                        const text = getBulletText(bullet);
                        if (!text) return null;
                        return <li key={bulletIndex}>{text}</li>;
                      })}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {(educationLeft || educationRight) ? (
          <section className="mt-5">
            <SectionTitle title="Education" />
            <div className="mt-3 flex items-start justify-between gap-4 text-[13px] leading-6">
              <div className="font-medium">{educationLeft}</div>
              <div className="text-right text-neutral-800">{educationRight}</div>
            </div>
          </section>
        ) : null}

        {shouldShowSummary(resume.summary, experience, projects) ? (
          <section className="mt-5">
            <SectionTitle title="Summary" />
            <p className="mt-2 text-[13px] leading-6">{resume.summary}</p>
          </section>
        ) : null}

        {Array.isArray(resume.extras) && resume.extras.length > 0 ? (
          <section className="mt-5">
            <SectionTitle title="Additional" />
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
              {resume.extras.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}