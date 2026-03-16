export const generatedResumeSchema = {
  name: "generated_resume",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      basics: {
        type: "object",
        additionalProperties: false,
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          location: { type: "string" },
          linkedin: { type: "string" },
          github: { type: "string" },
          school: { type: "string" },
          degree: { type: "string" },
          graduationDate: { type: "string" },
          gpa: { type: "string" },
        },
        required: [
          "fullName",
          "email",
          "phone",
          "location",
          "linkedin",
          "github",
          "school",
          "degree",
          "graduationDate",
          "gpa",
        ],
      },
      target: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string" },
          industry: { type: "string" },
          jobDescription: { type: "string" },
        },
        required: ["role", "industry", "jobDescription"],
      },
      summary: {
        type: "string",
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            role: { type: "string" },
            organization: { type: "string" },
            date: { type: "string" },
            bullets: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  originalInput: { type: "string" },
                  polished: { type: "string" },
                  expanded: { type: "string" },
                  impactTags: {
                    type: "array",
                    items: { type: "string" },
                  },
                  matchedKeywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "originalInput",
                  "polished",
                  "expanded",
                  "impactTags",
                  "matchedKeywords",
                ],
              },
            },
          },
          required: ["role", "organization", "date", "bullets"],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            link: { type: "string" },
            bullets: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  originalInput: { type: "string" },
                  polished: { type: "string" },
                  expanded: { type: "string" },
                  impactTags: {
                    type: "array",
                    items: { type: "string" },
                  },
                  matchedKeywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "originalInput",
                  "polished",
                  "expanded",
                  "impactTags",
                  "matchedKeywords",
                ],
              },
            },
          },
          required: ["name", "link", "bullets"],
        },
      },
      skills: {
        type: "array",
        items: { type: "string" },
      },
      extras: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "basics",
      "target",
      "summary",
      "experience",
      "projects",
      "skills",
      "extras",
    ],
  },
} as const;