import { ChatPromptTemplate } from '@langchain/core/prompts';

import { TemplateEnum } from '@src/summarization/enums/template.enum';

interface FunctionSchema {
  name: string;
  description: string;
  parameters: object;
  definitions?: object;
}

interface TemplateConfig {
  schema: FunctionSchema;
  prompt: ChatPromptTemplate;
  emptyResponse: object;
}

const summaryPointDefinition = {
  type: 'object',
  properties: {
    point: { type: 'string', description: 'A single sentence or key point.' },
    source_segments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          start_ms: { type: 'number' },
          end_ms: { type: 'number' },
        },
        required: ['start_ms', 'end_ms'],
      },
    },
  },
  required: ['point', 'source_segments'],
};

const baseInstructions = `
      **CRITICAL INSTRUCTIONS:**
      1. For EACH point you extract, you MUST cite the original transcript segments it was derived from.
      2. If you cannot find any information for a specific section, return an empty array for it.
      3. {locale_instruction}
      4. Use the provided function to structure your output perfectly.

      **TRANSCRIPT WITH TIMESTAMP IDENTIFIERS:**
      {text}
    `;

export const TEMPLATE_REGISTRY: Record<TemplateEnum, TemplateConfig> = {
  [TemplateEnum.DAILY]: {
    prompt: ChatPromptTemplate.fromTemplate(
      `Generate a summary for a Daily Standup Meeting.
      **SECTIONS TO EXTRACT:**
      - **Yesterday’s Work:** Extract tasks completed the previous day, including results, metrics, and who did what.
      - **Today’s Plans:** Extract what participants plan to do today, including goals and dependencies.
      - **Blockers / Dependencies:** Extract any items blocking progress and who is affected.
      - **Other Notes:** Include organizational notes, announcements, or other important team discussions.
      ${baseInstructions}`,
    ),
    schema: {
      name: 'create_daily_standup_summary',
      description: 'Creates a structured summary for a daily standup meeting.',
      parameters: {
        type: 'object',
        properties: {
          yesterdaysWork: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          todaysPlans: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          blockers: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          otherNotes: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
        },
        required: ['yesterdaysWork', 'todaysPlans', 'blockers', 'otherNotes'],
        definitions: { summaryPoint: summaryPointDefinition },
      },
    },
    emptyResponse: { yesterdaysWork: [], todaysPlans: [], blockers: [], otherNotes: [] },
  },
  [TemplateEnum.DEMO]: {
    prompt: ChatPromptTemplate.fromTemplate(
      `Generate a summary for a Demo/Review Meeting.
      **SECTIONS TO EXTRACT:**
      - **What Was Demonstrated:** Describe the features shown, who presented, and key use cases.
      - **Feedback & Comments:** Capture specific positive and negative feedback from participants.
      - **Decisions Made:** Extract all agreed-upon decisions regarding scope, priorities, and releases.
      - **Next Steps:** List action items, responsible people, and deadlines discussed after the demo.
      ${baseInstructions}`,
    ),
    schema: {
      name: 'create_demo_review_summary',
      description: 'Creates a structured summary for a demo or review meeting.',
      parameters: {
        type: 'object',
        properties: {
          whatWasDemonstrated: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          feedbackAndComments: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          decisionsMade: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          nextSteps: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
        },
        required: ['whatWasDemonstrated', 'feedbackAndComments', 'decisionsMade', 'nextSteps'],
        definitions: { summaryPoint: summaryPointDefinition },
      },
    },
    emptyResponse: {
      whatWasDemonstrated: [],
      feedbackAndComments: [],
      decisionsMade: [],
      nextSteps: [],
    },
  },
  [TemplateEnum.REQUIREMENTS_GATHERING]: {
    prompt: ChatPromptTemplate.fromTemplate(
      `Generate a summary for a Requirements Gathering Meeting.
      **SECTIONS TO EXTRACT:**
      - **Business Requirements:** Summarize the project's business goals, target users, and expected benefits.
      - **Functional Requirements:** Extract specific functions, features, and use cases the system must implement.
      - **Non-Functional Requirements:** Extract quality characteristics like performance, security, scalability, and UX.
      - **Questions / Open Points:** List all unresolved topics, open decisions, and follow-up actions.
      ${baseInstructions}`,
    ),
    schema: {
      name: 'create_requirements_gathering_summary',
      description: 'Creates a structured summary for a requirements gathering meeting.',
      parameters: {
        type: 'object',
        properties: {
          businessRequirements: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          functionalRequirements: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          nonFunctionalRequirements: {
            type: 'array',
            items: { $ref: '#/definitions/summaryPoint' },
          },
          questionsOpenPoints: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
        },
        required: [
          'businessRequirements',
          'functionalRequirements',
          'nonFunctionalRequirements',
          'questionsOpenPoints',
        ],
        definitions: { summaryPoint: summaryPointDefinition },
      },
    },
    emptyResponse: {
      businessRequirements: [],
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      questionsOpenPoints: [],
    },
  },
  [TemplateEnum.KICKOFF]: {
    prompt: ChatPromptTemplate.fromTemplate(
      `Generate a summary for a Project Kick-off Meeting.
      **SECTIONS TO EXTRACT:**
      - **Project Goals:** Extract key business and technical objectives, KPIs, and success metrics.
      - **Project Scope:** Detail what is included and excluded from the project, including limitations and dependencies.
      - **Roles & Responsibilities:** Identify who is responsible for what, including key roles and communication structure.
      - **Risks & Assumptions:** List potential technical, resource, or organizational risks and any underlying assumptions.
      - **Next Steps / Action Plan:** Record initial tasks, responsible persons, deadlines, and scheduled meetings.
      ${baseInstructions}`,
    ),
    schema: {
      name: 'create_kick_off_summary',
      description: 'Creates a structured summary for a project kick-off meeting.',
      parameters: {
        type: 'object',
        properties: {
          projectGoals: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          projectScope: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          rolesAndResponsibilities: {
            type: 'array',
            items: { $ref: '#/definitions/summaryPoint' },
          },
          risksAndAssumptions: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
          nextStepsActionPlan: { type: 'array', items: { $ref: '#/definitions/summaryPoint' } },
        },
        required: [
          'projectGoals',
          'projectScope',
          'rolesAndResponsibilities',
          'risksAndAssumptions',
          'nextStepsActionPlan',
        ],
        definitions: { summaryPoint: summaryPointDefinition },
      },
    },
    emptyResponse: {
      projectGoals: [],
      projectScope: [],
      rolesAndResponsibilities: [],
      risksAndAssumptions: [],
      nextStepsActionPlan: [],
    },
  },
};

export const reducePrompt = ChatPromptTemplate.fromTemplate(
  `You are a master summarization assistant. You have been given several partial summaries from different recordings of the same meeting.
        Your task is to expertly synthesize them into a single, final, and coherent summary.
        - Combine related points from the different summaries to create a comprehensive overview.
        - **Crucially, remove any duplicate information or redundant points.**
        - Ensure a logical flow and that the final summary is easy to read.
        - For each point in the final summary, you MUST correctly merge the 'source_segments' from the original points that formed it.
        - Your final output must be structured perfectly using the provided function.
  
        **CRITICAL INSTRUCTIONS:**
        1. {locale_instruction}
        2. If a section is empty across all partial summaries, return an empty array for it.
  
        **PARTIAL SUMMARIES TO COMBINE AND SYNTHESIZE:**
        {summaries_text}`,
);

export const reducePromptStreaming = ChatPromptTemplate.fromTemplate(
  `You are a master summarization assistant. You have been given several partial summaries (in JSON format) from different recordings of the same meeting. These summaries contain 'source_segments' with 'start_ms' timestamps.
  Your task is to expertly **synthesize** them into a single, final, and coherent summary, **outputting ONLY in MARKDOWN format**.

  **CRITICAL SYNTHESIS RULES:**
  1. **Combine related points** from the different input summaries into single, comprehensive points in the final output.
  2. **Crucially, REMOVE ALL duplicate information or redundant points.** Do NOT simply list points from the input.
  3. Ensure the final summary has a **logical flow** and is easy to read.
  4. For each synthesized point, accurately **merge and include ALL relevant 'start_ms' citation timestamps** from the original points that formed it.

  **CRITICAL MARKDOWN FORMAT INSTRUCTIONS:**
  1. {locale_instruction}
  2. Use '##' for section titles. Base the titles on the keys from the input JSON summaries (e.g., 'yesterdaysWork' becomes '## Yesterday's Work').
  3. Use standard markdown bullet points ('- ') for each summary point.
  4. **CITATION FORMAT:**
     - Append citations at the VERY END of the bullet point text.
     - Format **MUST** be square brackets containing the **exact 'start_ms' values**, separated by commas.
     - **Use REAL 'start_ms' timestamps**, NOT sequential numbers (like [1, 2, 3]).
     - **Example:** '- This is a summary point. [12345, 54321]'
     - **Example:** '- Another key decision was made. [98765]'
  5. **SEPARATOR:** You **MUST** put a double newline (\\n\\n) after EVERY block (after each '## Heading' and after each '- bullet point citation'). No extra lines.

  **PARTIAL SUMMARIES TO COMBINE (in JSON):**
  {summaries_text}`,
);
