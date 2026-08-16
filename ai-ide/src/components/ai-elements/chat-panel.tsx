"use client";

import { useState, useCallback } from "react";
import {
  ListTodoIcon,
  Sparkles,
} from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { PanelOptionsMenu } from "@/components/ai-elements/panel-options-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@/components/ai-elements/plan";
import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@/components/ai-elements/queue";
import {
  Task,
  TaskContent,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

interface MessageType {
  key: string;
  from: "user" | "assistant";
  content: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
}

const initialTasks: TaskItem[] = [
  { id: "1", status: "completed", title: "Refactor Button component" },
  { id: "2", status: "in_progress", title: "Add form validation" },
  { id: "3", status: "pending", title: "Write unit tests" },
];

const initialMessages: MessageType[] = [
  {
    content: "Can you help me add email validation to the form?",
    from: "user",
    key: "initial-msg-1",
  },
  {
    content: `I can help you add email validation. Looking at your code in \`src/utils/helpers.ts\`, I see you already have a \`validateForm\` function.

Here's what I'll do:

1. Add an \`isValidEmail\` helper function
2. Update \`validateForm\` to check email format
3. Show validation errors in the UI

The email validation uses a regex pattern to check for valid email format. The form will now show "Invalid email format" if the user enters an incorrectly formatted email address.`,
    from: "assistant",
    key: "initial-msg-2",
  },
];

export function ChatPanel() {
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(true);
  const [threadId, setThreadId] = useState<string>("th_8a7d2e01");
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [chatText, setChatText] = useState<string>("");
  const [status, setStatus] = useState<"ready" | "streaming" | "submitted">(
    "ready"
  );
  const [tasks] = useState<TaskItem[]>(initialTasks);
  const [showCheckpoint, setShowCheckpoint] = useState<boolean>(false);

  const handleChatTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setChatText(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text.trim()) {
        return;
      }

      const userMessage: MessageType = {
        content: message.text,
        from: "user",
        key: nanoid(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setChatText("");
      setStatus("submitted");

      setTimeout(() => {
        const assistantMessage: MessageType = {
          content: `I'll inspect the codebase regarding "${message.text}". Checking \`src/app.tsx\` and related utilities to ensure form flow and component compatibility.`,
          from: "assistant",
          key: nanoid(),
        };

        const key = assistantMessage.key;
        setMessages((prev) => [...prev, { ...assistantMessage, content: "" }]);
        setStatus("streaming");

        const words = assistantMessage.content.split(" ");
        let currentContent = "";

        words.forEach((word, index) => {
          setTimeout(() => {
            currentContent += (index > 0 ? " " : "") + word;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.key === key ? { ...msg, content: currentContent } : msg
              )
            );
            if (index === words.length - 1) {
              setStatus("ready");
              setTimeout(() => setShowCheckpoint(true), 300);
            }
          }, index * 50);
        });
      }, 400);
    },
    []
  );

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <>
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border/50 bg-muted/20 px-3 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <Sparkles className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate min-w-0">
            AI Assistant
          </span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary shrink-0 hidden sm:inline-block">
            Active
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={isTaskViewOpen ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-6 rounded p-0 text-muted-foreground hover:text-foreground transition-colors",
                    isTaskViewOpen &&
                      "bg-accent text-foreground font-medium border border-border/60"
                  )}
                  onClick={() => setIsTaskViewOpen((prev) => !prev)}
                >
                  <ListTodoIcon className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {isTaskViewOpen
                ? "Hide Implementation Plan & Tasks"
                : "Show Implementation Plan & Tasks"}
            </TooltipContent>
          </Tooltip>

          <PanelOptionsMenu className="size-6" />
        </div>
      </div>

      {isTaskViewOpen && (
        <div className="border-b border-border/50 p-2.5 shrink-0 bg-background/60 backdrop-blur-xs animate-in fade-in-0 duration-150">
          <Plan defaultOpen>
            <PlanHeader className="py-1">
              <div>
                <PlanTitle className="text-xs font-semibold">
                  Implementation Plan
                </PlanTitle>
                <PlanDescription className="text-[11px]">
                  Adding form validation & helpers
                </PlanDescription>
              </div>
              <PlanAction>
                <PlanTrigger />
              </PlanAction>
            </PlanHeader>
            <PlanContent className="pt-1">
              <Task defaultOpen>
                <TaskTrigger title="Search for validation patterns" />
                <TaskContent>
                  <TaskItemFile>src/utils/helpers.ts</TaskItemFile>
                  <TaskItemFile>src/app.tsx</TaskItemFile>
                </TaskContent>
              </Task>
            </PlanContent>
          </Plan>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <Conversation className="flex-1 overflow-y-auto">
          <ConversationContent className="gap-3.5 p-3">
            <Queue>
              <QueueSection defaultOpen>
                <QueueSectionTrigger className="py-1">
                  <QueueSectionLabel
                    count={pendingTasks.length}
                    icon={<ListTodoIcon className="size-3.5" />}
                    label="Session Tasks"
                    className="text-xs font-medium"
                  />
                </QueueSectionTrigger>
                <QueueSectionContent>
                  <QueueList>
                    {pendingTasks.map((task) => (
                      <QueueItem key={task.id} className="py-1 text-xs">
                        <div className="flex items-center gap-2">
                          <QueueItemIndicator />
                          <QueueItemContent>{task.title}</QueueItemContent>
                        </div>
                      </QueueItem>
                    ))}
                  </QueueList>
                </QueueSectionContent>
              </QueueSection>
              <QueueSection defaultOpen={false}>
                <QueueSectionTrigger className="py-1">
                  <QueueSectionLabel
                    count={completedTasks.length}
                    icon={<ListTodoIcon className="size-3.5" />}
                    label="Completed"
                    className="text-xs font-medium"
                  />
                </QueueSectionTrigger>
                <QueueSectionContent>
                  <QueueList>
                    {completedTasks.map((task) => (
                      <QueueItem key={task.id} className="py-1 text-xs">
                        <div className="flex items-center gap-2">
                          <QueueItemIndicator completed />
                          <QueueItemContent completed>
                            {task.title}
                          </QueueItemContent>
                        </div>
                      </QueueItem>
                    ))}
                  </QueueList>
                </QueueSectionContent>
              </QueueSection>
            </Queue>

            {messages.map((message) => (
              <Message from={message.from} key={message.key}>
                <MessageContent
                  className={cn(
                    "text-xs leading-relaxed",
                    message.from === "user"
                      ? "rounded-md bg-secondary px-3 py-2 text-secondary-foreground"
                      : "text-foreground"
                  )}
                >
                  {message.from === "assistant" ? (
                    <MessageResponse>{message.content}</MessageResponse>
                  ) : (
                    message.content
                  )}
                </MessageContent>
              </Message>
            ))}
            {showCheckpoint && (
              <Checkpoint>
                <CheckpointIcon />
                <CheckpointTrigger tooltip="Restore to this checkpoint">
                  Checkpoint saved
                </CheckpointTrigger>
              </Checkpoint>
            )}
          </ConversationContent>
        </Conversation>

        <div className="border-t border-border/50 p-2.5 shrink-0 bg-background/90 backdrop-blur">
          <PromptInput
            className="rounded-md border border-border/70 bg-background shadow-xs focus-within:border-primary/60 transition-all"
            onSubmit={handleSubmit}
          >
            <PromptInputTextarea
              className="min-h-10 text-xs resize-none"
              onChange={handleChatTextChange}
              placeholder="Ask about the code or give instructions..."
              value={chatText}
            />
            <PromptInputFooter className="justify-between items-center p-1.5 pt-0">
              <span className="text-[10px] text-muted-foreground">
                Shift+Enter for newline
              </span>
              <PromptInputSubmit
                disabled={status !== "ready" || !chatText.trim()}
                status={status === "streaming" ? "streaming" : undefined}
                className="size-7"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
