import type { GeneratedResume } from "@/types/resume";
import type { BoldWordsState } from "./storage";

/**
 * Export resume as PDF
 * Uses html2pdf library to convert HTML to PDF
 */
export async function exportToPDF(
  resume: GeneratedResume,
  templateId: string,
  boldState: BoldWordsState
): Promise<void> {
  try {
    // Dynamically import html2pdf to avoid bundling issues
    const html2pdf = (await import("html2pdf.js")).default;

    // Create a temporary container with the resume content
    const tempDiv = document.createElement("div");
    tempDiv.id = "resume-pdf-export";
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.style.width = "850px";
    tempDiv.style.padding = "40px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.color = "black";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "13px";

    // Clone the existing resume preview from the DOM
    const existingResume = document.querySelector("[data-resume-content]");
    if (existingResume) {
      const clone = existingResume.cloneNode(true) as HTMLElement;
      tempDiv.appendChild(clone);
    }

    document.body.appendChild(tempDiv);

    // Configure html2pdf options
    const opt = {
      margin: 0.5,
      filename: `resume-${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
    };

    // Generate PDF
    await html2pdf().set(opt).from(tempDiv).save();

    // Clean up
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("Failed to export resume as PDF. Please try again.");
  }
}

/**
 * Export resume as Word document
 * Uses docx library to create a properly formatted Word document
 */
export async function exportToWord(
  resume: GeneratedResume,
  templateId: string,
  boldState: BoldWordsState
): Promise<void> {
  try {
    // Dynamically import docx to avoid bundling issues
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

    // Helper function to check if a word is bold
    const isBoldWord = (section: string, entryIndex: number, bulletIndex: number, wordIndex: number): boolean => {
      const wordId = `${section}_${entryIndex}_${bulletIndex}_${wordIndex}`;
      return boldState[wordId] === true;
    };

    // Helper to split text into words and apply bold formatting
    const createFormattedTextRuns = (
      text: string,
      section: string,
      entryIndex: number,
      bulletIndex: number
    ): any[] => {
      const words = text.split(/\s+/);
      const runs: any[] = [];

      words.forEach((word, wordIndex) => {
        const isBold = isBoldWord(section, entryIndex, bulletIndex, wordIndex);
        runs.push(
          new TextRun({
            text: word,
            bold: isBold,
          })
        );

        // Add space after word (except last)
        if (wordIndex < words.length - 1) {
          runs.push(new TextRun(" "));
        }
      });

      return runs;
    };

    const sections: any[] = [];

    // Header - Name (bold)
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.basics.fullName || "Your Name",
            bold: true,
            size: 32 * 2, // 32pt
          }),
        ],
        spacing: { after: 100 },
      })
    );

    // Target role (bold)
    if (resume.target.role) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.target.role,
              bold: true,
              size: 26 * 2, // 13pt
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    // Contact info
    const contactItems = [
      resume.basics.email,
      resume.basics.phone,
      resume.basics.location,
      resume.basics.linkedin,
      resume.basics.github,
    ].filter(Boolean);

    if (contactItems.length > 0) {
      sections.push(
        new Paragraph({
          text: contactItems.join(" | "),
          spacing: { after: 200 },
        })
      );
    }

    // Summary
    if (resume.summary) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "SUMMARY",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
      sections.push(
        new Paragraph({
          text: resume.summary,
          spacing: { after: 200 },
        })
      );
    }

    // Education
    if (resume.basics.school || resume.basics.degree) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "EDUCATION",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      const eduLeft = [resume.basics.school, resume.basics.degree].filter(Boolean).join(" | ");
      const eduRight = [resume.basics.graduationDate, resume.basics.gpa ? `GPA: ${resume.basics.gpa}` : ""]
        .filter(Boolean)
        .join(" | ");

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: eduLeft, bold: true })],
          spacing: { after: 50 },
        })
      );

      if (eduRight) {
        sections.push(
          new Paragraph({
            text: eduRight,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "EXPERIENCE",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      resume.experience.forEach((exp, expIndex) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: exp.role || "", bold: true })],
            spacing: { after: 50 },
          })
        );

        if (exp.organization) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: exp.organization, italics: true })],
              spacing: { after: 50 },
            })
          );
        }

        if (exp.date) {
          sections.push(
            new Paragraph({
              text: exp.date,
              spacing: { after: 50 },
            })
          );
        }

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet, bulletIndex) => {
            const bulletText = bullet.polished || bullet.expanded || bullet.originalInput || "";
            const runs = createFormattedTextRuns(bulletText, "experience", expIndex, bulletIndex);

            sections.push(
              new Paragraph({
                bullet: { level: 0 },
                children: runs.length > 0 ? runs : [new TextRun(bulletText)],
                spacing: { after: 50 },
              })
            );
          });
        }

        sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "PROJECTS",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      resume.projects.forEach((project, projIndex) => {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: project.name || "", bold: true })],
            spacing: { after: 50 },
          })
        );

        if (project.link) {
          sections.push(
            new Paragraph({
              text: project.link,
              spacing: { after: 50 },
            })
          );
        }

        // Bullets
        if (project.bullets && project.bullets.length > 0) {
          project.bullets.forEach((bullet, bulletIndex) => {
            const bulletText = bullet.polished || bullet.expanded || bullet.originalInput || "";
            const runs = createFormattedTextRuns(bulletText, "projects", projIndex, bulletIndex);

            sections.push(
              new Paragraph({
                bullet: { level: 0 },
                children: runs.length > 0 ? runs : [new TextRun(bulletText)],
                spacing: { after: 50 },
              })
            );
          });
        }

        sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "SKILLS",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
      sections.push(
        new Paragraph({
          text: resume.skills.join(", "),
          spacing: { after: 200 },
        })
      );
    }

    // Extras
    if (resume.extras && resume.extras.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "ADDITIONAL",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      resume.extras.forEach((extra) => {
        sections.push(
          new Paragraph({
            bullet: { level: 0 },
            text: extra,
            spacing: { after: 50 },
          })
        );
      });
    }

    // Create and save document
    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${new Date().toLocaleDateString().replace(/\//g, "-")}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw new Error("Failed to export resume as Word document. Please try again.");
  }
}
