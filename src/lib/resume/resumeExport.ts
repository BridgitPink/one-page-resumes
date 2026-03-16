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

    // Clone the existing resume preview from the DOM
    const existingResume = document.querySelector("[data-resume-content]");
    if (!existingResume) {
      throw new Error("Resume preview not found on the page");
    }

    // Create a clone of the resume element
    const clone = existingResume.cloneNode(true) as HTMLElement;

    // Helper function to convert unsupported color formats to supported ones
    const sanitizeColor = (colorValue: string): string => {
      if (!colorValue || typeof colorValue !== 'string') return colorValue;
      
      // Remove any unsupported modern color functions completely
      let result = colorValue;
      
      // Replace lab() with neutral gray
      result = result.replace(/lab\s*\([^)]*\)/gi, "rgb(100, 100, 100)");
      
      // Replace oklab() with neutral gray  
      result = result.replace(/oklab\s*\([^)]*\)/gi, "rgb(100, 100, 100)");
      
      // Replace lch() with neutral gray
      result = result.replace(/lch\s*\([^)]*\)/gi, "rgb(100, 100, 100)");
      
      // Replace oklch() with neutral gray
      result = result.replace(/oklch\s*\([^)]*\)/gi, "rgb(100, 100, 100)");
      
      // Replace color(display-p3 ...) with neutral gray
      result = result.replace(/color\s*\(\s*display-p3[^)]*\)/gi, "rgb(100, 100, 100)");
      
      return result;
    };

    // Strip Tailwind classes and apply inline computed styles
    // Also sanitize any unsupported color values
    const stripClassesAndApplyStyles = (element: Element, clonedElement: Element) => {
      const cloned = clonedElement as HTMLElement;
      
      // List of all style properties to copy
      const stylesToCopy = [
        "color",
        "backgroundColor",
        "backgroundImage",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "textDecorationColor",
        "caretColor",
        "fontSize",
        "fontWeight",
        "fontStyle",
        "textDecoration",
        "textDecorationLine",
        "textAlign",
        "lineHeight",
        "letterSpacing",
        "textTransform",
        "margin",
        "marginTop",
        "marginBottom",
        "marginLeft",
        "marginRight",
        "marginBlock",
        "marginInline",
        "padding",
        "paddingTop",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
        "paddingBlock",
        "paddingInline",
        "border",
        "borderTop",
        "borderBottom",
        "borderLeft",
        "borderRight",
        "borderWidth",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderStyle",
        "borderRadius",
        "boxShadow",
        "textShadow",
        "display",
        "flexDirection",
        "justifyContent",
        "alignItems",
        "gap",
        "width",
        "maxWidth",
        "minWidth",
        "height",
        "minHeight",
        "maxHeight",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "visibility",
        "opacity",
        "overflow",
        "whiteSpace",
        "wordBreak",
        "wordWrap",
        "outline",
        "outlineWidth",
        "outlineStyle",
        "flex",
        "flexWrap",
        "flexGrow",
        "flexShrink",
        "order",
      ];

      // Remove className from root element to prevent Tailwind class re-evaluation
      cloned.className = "";
      
      // Apply computed styles to root element with color sanitization
      const rootComputedStyle = window.getComputedStyle(element);
      stylesToCopy.forEach((prop) => {
        let value = rootComputedStyle.getPropertyValue(prop);
        if (value && value.trim()) {
          // CRITICAL: Sanitize unsupported color functions BEFORE applying
          value = sanitizeColor(value);
          cloned.style.setProperty(prop, value, "important");
        }
      });

      // Now process children recursively
      const children = element.children;
      const clonedChildren = clonedElement.children;

      for (let i = 0; i < children.length; i++) {
        const originalChild = children[i];
        const clonedChild = clonedChildren[i] as HTMLElement;

        if (originalChild && clonedChild) {
          // Remove className to prevent Tailwind class re-evaluation in html2canvas
          clonedChild.className = "";

          const computedStyle = window.getComputedStyle(originalChild);

          stylesToCopy.forEach((prop) => {
            let value = computedStyle.getPropertyValue(prop);
            if (value && value.trim()) {
              // CRITICAL: Sanitize unsupported color functions BEFORE applying
              value = sanitizeColor(value);
              clonedChild.style.setProperty(prop, value, "important");
            }
          });

          // Recursively process nested elements
          if (originalChild.children.length > 0) {
            stripClassesAndApplyStyles(originalChild, clonedChild);
          }
        }
      }
    };

    // Strip Tailwind classes and apply inline computed styles to root AND children
    stripClassesAndApplyStyles(existingResume, clone);

    // Set display properties on clone to make it visible for rendering
    const cloneContainer = document.createElement("div");
    cloneContainer.id = "resume-pdf-export";
    cloneContainer.style.position = "fixed";
    cloneContainer.style.left = "0";
    cloneContainer.style.top = "0";
    cloneContainer.style.width = "850px";
    cloneContainer.style.backgroundColor = "white";
    cloneContainer.style.zIndex = "-9999";
    cloneContainer.style.visibility = "hidden";
    cloneContainer.appendChild(clone);
    document.body.appendChild(cloneContainer);

    // Block stylesheet access during html2canvas processing
    // Temporarily disable all stylesheets so html2canvas only uses inline styles
    const styleElements = document.querySelectorAll("style");
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    const disabledElements: Array<{ element: HTMLElement; originalDisabled: boolean }> = [];

    // Disable all style elements
    styleElements.forEach((el) => {
      const element = el as HTMLStyleElement;
      const originalDisabled = element.disabled;
      element.disabled = true;
      disabledElements.push({ element, originalDisabled });
    });

    // Disable all stylesheet links
    linkElements.forEach((el) => {
      const element = el as HTMLLinkElement;
      const originalDisabled = element.disabled;
      element.disabled = true;
      disabledElements.push({ element, originalDisabled });
    });

    // Wait briefly for stylesheet disabling to take effect
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Configure html2pdf options
      const opt = {
        margin: 0.5,
        filename: `resume-${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, pixelRatio: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };

      // Generate PDF using the cloned element (which has only inline styles now)
      await html2pdf().set(opt).from(clone).save();
    } finally {
      // Restore all stylesheets to their original state
      disabledElements.forEach(({ element, originalDisabled }) => {
        if (element instanceof HTMLStyleElement) {
          element.disabled = originalDisabled;
        } else if (element instanceof HTMLLinkElement) {
          element.disabled = originalDisabled;
        }
      });

      // Clean up the export container
      if (cloneContainer.parentNode) {
        document.body.removeChild(cloneContainer);
      }
    }
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
