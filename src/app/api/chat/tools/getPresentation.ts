import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Kenneth Owusu. It is used to answer the question "Who are you?" or "Tell me about yourself"',
  parameters: z.object({}),
  execute: async () => {
    return {
      presentation:
        "I'm Kenneth Owusu, a 29-year-old developer specializing in AI and Fullstack Development. I'm working at Codin AI in Ghana. I'm passionate about AI, tech, Entrepreneurship and SaaS tech.",
    };
  },
});
