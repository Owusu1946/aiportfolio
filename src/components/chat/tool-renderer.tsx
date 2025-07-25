// src/components/chat/tool-renderer.tsx
import { Contact } from '../contact';
import Crazy from '../crazy';
import InternshipCard from '../InternshipCard';
import { Presentation } from '../presentation';
import AllProjects from '../projects/AllProjects';
import Resume from '../resume';
import Skills from '../skills';
import Sports from '../sport';

interface ToolRendererProps {
  toolName: string;
  toolResult: string;
  messageId: string;
}

export default function ToolRenderer({
  toolName,
  toolResult,
  messageId,
}: ToolRendererProps) {
  // Log the tool information for debugging
  console.log(`Rendering tool: ${toolName} with messageId: ${messageId}`);

  return (
    <div className="w-full transition-all duration-300">
      {/* Return specialized components based on tool name */}
      {(() => {
        switch (toolName) {
          case 'getProjects':
            console.log('Rendering Projects component');
            return (
              <div
                key={messageId}
                className="w-full overflow-hidden rounded-lg"
              >
                <AllProjects />
              </div>
            );

          case 'getPresentation':
            console.log('Rendering Presentation component');
            return (
              <div
                key={messageId}
                className="w-full overflow-hidden rounded-lg"
              >
                <Presentation />
              </div>
            );

          case 'getResume':
            console.log('Rendering Resume component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <Resume />
              </div>
            );

          case 'getContact':
            console.log('Rendering Contact component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <Contact />
              </div>
            );

          case 'getSkills':
            console.log('Rendering Skills component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <Skills />
              </div>
            );

          case 'getSports': // This should match the tool name in getSport.ts
            console.log('Rendering Sports component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <Sports />
              </div>
            );

          case 'getCrazy':
            console.log('Rendering Crazy component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <Crazy />
              </div>
            );

          case 'getInternship':
            console.log('Rendering InternshipCard component');
            return (
              <div key={messageId} className="w-full rounded-lg">
                <InternshipCard />
              </div>
            );

          // Default renderer for other tools
          default:
            console.log(`Unknown tool: ${toolName}, displaying generic result`);
            return (
              <div
                key={messageId}
                className="bg-secondary/10 w-full rounded-lg p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  <p>{toolResult}</p>
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
}
