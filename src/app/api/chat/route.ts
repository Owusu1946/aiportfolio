import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompt';

export const maxDuration = 30;

// Error handler function
function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// Tool implementation for Gemini
const tools = {
  getProjects: async () => {
    return "Here are all the projects made by Kenneth! Don't hesitate to ask me more about them!";
  },
  getPresentation: async () => {
    return "I'm Kenneth Owusu, a 29-year-old developer specializing in AI and Fullstack Development. I'm working at Codin AI in Ghana. I'm passionate about AI, tech, Entrepreneurship and SaaS tech.";
  },
  getResume: async () => {
    return "You can download my resume by clicking on the link above.";
  },
  getContact: async () => {
    return "Here is my contact information above, Feel free to contact me I will be happy to answer you 😉";
  },
  getSkills: async () => {
    return "You can see all my skills above.";
  },
  getSports: async () => {
    return "Here my best pictures of me doing sports!";
  },
  getCrazy: async () => {
    return "Above is a photo of Me On top of Mont Blanc, the highest mountain in the Alps and the highest in Europe. I made it with a friends of mine without guide, it was a great experience! You can see the 80km/h of wind on the photo! I made a youtube video of this adventure here: https://www.youtube.com/watch?v=rufGMSgzUOk&ab_channel=Toukoum";
  },
  getInternship: async () => {
    return `Here's what I'm looking for 👇

- 📅 **Duration**: 6-month internship starting **September 2025**
- 🌍 **Location**: Preferably **San Francisco** or anywhere in the **United States**
- 🧑‍💻 **Focus**: AI development, full-stack web apps, SaaS, agentic workflows
- 🛠️ **Stack**: Python, React/Next.js, Tailwind CSS, TypeScript, GPT, RAG, etc.
- 💼 **Visa**: I'm based in Paris 🇫🇷 so I might need **J-1 sponsorship**
- ✅ **What I bring**: Real experience with secure on-prem GPTs (Lighton), deepsearch engines, custom RAG tools, and hackathon wins like **ETH Oxford** & **Paris Blockchain Week**
- 🔥 I move fast, learn faster, and I'm HUNGRYYYYY for big challenges

📬 **Contact me** via:
- Email: owusukenneth77@gmail.com
- LinkedIn: [linkedin.com/in/okenneth](https://www.linkedin.com/in/okenneth/)
- GitHub: [github.com/Owusu1946](https://github.com/Owusu1946)

Let's build cool shit together ✌️`;
  }
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('[CHAT-API] Incoming messages:', messages);

    // Initialize Gemini API with API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('[CHAT-API] Missing Gemini API key');
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('[CHAT-API] Initialized Gemini API');
    
    // Get the Gemini Pro model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    console.log('[CHAT-API] Chat session created');

    // Add system prompt as the first message
    try {
      await chat.sendMessage(SYSTEM_PROMPT.content);
      console.log('[CHAT-API] System prompt added');
    } catch (error) {
      console.error('[CHAT-API] Error adding system prompt:', error);
      throw new Error('Failed to initialize chat with system prompt');
    }
    
    // Process user messages and detect tool calls
    let response = '';
    let toolUsed = false;
    let toolName = '';
    let toolResult = '';
    
    // Process the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.content) {
      const userContent = lastUserMessage.content.toLowerCase();
      console.log('[CHAT-API] Processing user message:', userContent);
      
      // Special case for the exact question from the UI
      if (userContent === 'how can i contact you?') {
        try {
          console.log('[CHAT-API] Exact contact question detected');
          toolName = 'getContact';
          toolResult = await tools.getContact();
          console.log('[CHAT-API] Contact tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getContact tool to share my contact information.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Contact tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with exact contact question:', error);
        }
      }
      // Special case for the Fun question
      else if (userContent === 'what\'s the craziest thing you\'ve ever done? what are your hobbies?' || 
               userContent === 'what\'s the craziest thing you\'ve ever done? what are your hobbies?') {
        try {
          console.log('[CHAT-API] Exact Fun question detected');
          // For the Fun question, we'll use the getSports tool first
          toolName = 'getSports';
          toolResult = await tools.getSports();
          console.log('[CHAT-API] Sports tool result for Fun question:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getSports tool to show my sports activities.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Sports tool response for Fun question:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with exact Fun question:', error);
        }
      }
      // Check for tool patterns in the message
      else if (userContent.includes('contact') || userContent.includes('reach you') || userContent.includes('email') || userContent.includes('phone') || userContent.includes('get in touch')) {
        try {
          console.log('[CHAT-API] Contact tool detected');
          toolName = 'getContact';
          toolResult = await tools.getContact();
          console.log('[CHAT-API] Contact tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getContact tool to share my contact information.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Contact tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getContact tool:', error);
        }
      }
      else if (userContent.includes('project') || userContent.includes('working on') || userContent.includes('portfolio') || userContent.includes('showcase')) {
        try {
          console.log('[CHAT-API] Project tool detected');
          toolName = 'getProjects';
          toolResult = await tools.getProjects();
          console.log('[CHAT-API] Project tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getProjects tool to show my projects.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Project tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getProjects tool:', error);
        }
      } 
      else if (userContent.includes('who are you') || userContent.includes('tell me about yourself') || userContent.includes('introduction') || userContent.includes('about you') || userContent.includes('your background')) {
        try {
          console.log('[CHAT-API] Presentation tool detected');
          toolName = 'getPresentation';
          toolResult = await tools.getPresentation();
          console.log('[CHAT-API] Presentation tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getPresentation tool to introduce myself.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Presentation tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getPresentation tool:', error);
        }
      }
      else if (userContent.includes('resume') || userContent.includes('cv') || userContent.includes('experience') || userContent.includes('qualification')) {
        try {
          console.log('[CHAT-API] Resume tool detected');
          toolName = 'getResume';
          toolResult = await tools.getResume();
          console.log('[CHAT-API] Resume tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getResume tool to show my resume.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Resume tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getResume tool:', error);
        }
      }
      else if (userContent.includes('skills') || userContent.includes('abilities') || userContent.includes('what can you do') || userContent.includes('capable of') || userContent.includes('expertise') || userContent.includes('proficiency')) {
        try {
          console.log('[CHAT-API] Skills tool detected');
          toolName = 'getSkills';
          toolResult = await tools.getSkills();
          console.log('[CHAT-API] Skills tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getSkills tool to show my skills.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Skills tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getSkills tool:', error);
        }
      }
      else if (userContent.includes('sport') || userContent.includes('athletic') || userContent.includes('hobby') || userContent.includes('leisure') || userContent.includes('physical activity') || userContent.includes('mountain bike') || userContent.includes('biking') || userContent.includes('cycling')) {
        try {
          console.log('[CHAT-API] Sports tool detected');
          toolName = 'getSports';
          toolResult = await tools.getSports();
          console.log('[CHAT-API] Sports tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getSports tool to show my sports activities.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Sports tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getSports tool:', error);
        }
      }
      else if (userContent.includes('internship') || userContent.includes('job') || userContent.includes('hire') || userContent.includes('work') || userContent.includes('employment') || userContent.includes('position') || userContent.includes('opportunity')) {
        try {
          console.log('[CHAT-API] Internship tool detected');
          toolName = 'getInternship';
          toolResult = await tools.getInternship();
          console.log('[CHAT-API] Internship tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getInternship tool to share information about my internship search.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Internship tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getInternship tool:', error);
        }
      }
      else if (userContent.includes('crazy') || userContent.includes('wild') || userContent.includes('fun fact') || userContent.includes('interesting') || userContent.includes('surprising') || userContent.includes('unusual') || userContent.includes('hobbies') || userContent.includes('fun')) {
        try {
          console.log('[CHAT-API] Crazy tool detected');
          toolName = 'getCrazy';
          toolResult = await tools.getCrazy();
          console.log('[CHAT-API] Crazy tool result:', toolResult);
          const result = await chat.sendMessage(`${lastUserMessage.content}\nI should use the getCrazy tool to share something crazy about me.`);
          response = await result.response.text();
          toolUsed = true;
          console.log('[CHAT-API] Crazy tool response:', response);
        } catch (error) {
          console.error('[CHAT-API] Error with getCrazy tool:', error);
        }
      }
    }
    
    // If no tool was used, just process the message normally
    if (!toolUsed) {
      console.log('[CHAT-API] No tool detected, processing as regular message');
      try {
        // Process all previous messages to maintain context
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].role === 'user') {
            console.log('[CHAT-API] Processing previous message:', messages[i].content);
            await chat.sendMessage(messages[i].content);
          }
        }
        
        // Process the last message and get the response
        console.log('[CHAT-API] Processing last message:', lastUserMessage.content);
        const result = await chat.sendMessage(lastUserMessage.content);
        response = await result.response.text();
        console.log('[CHAT-API] Regular response:', response);
      } catch (error) {
        console.error('[CHAT-API] Error processing regular message:', error);
        throw new Error('Failed to process message with Gemini API');
      }
    }
    
    // Return the response with tool information if applicable
    console.log('[CHAT-API] Preparing response object');
    const responseObj = {
      content: response,
      toolUsed,
      toolName,
      toolResult
    };
    
    console.log('[CHAT-API] Sending response');
    return new Response(JSON.stringify(responseObj), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[CHAT-API] Global error:', err);
    const errorMessage = errorHandler(err);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
