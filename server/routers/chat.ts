import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { chatConversations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * Chat router for AI-powered troubleshooting support
 */
export const chatRouter = router({
  /**
   * Send a message to the AI assistant
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationId: z.number().optional(),
        systemContext: z
          .object({
            cpu: z.object({ usage: z.number(), cores: z.number() }).optional(),
            memory: z.object({ usagePercent: z.number() }).optional(),
            disk: z.object({ usagePercent: z.number() }).optional(),
            recentScan: z.any().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create conversation
      let conversation;
      if (input.conversationId) {
        const [existing] = await db
          .select()
          .from(chatConversations)
          .where(eq(chatConversations.id, input.conversationId))
          .limit(1);
        conversation = existing;
      }

      let messages: Array<{ role: string; content: string; timestamp: string }> = [];
      if (conversation) {
        messages = JSON.parse(conversation.messages);
      }

      // Add user message
      messages.push({
        role: "user",
        content: input.message,
        timestamp: new Date().toISOString(),
      });

      // Build system prompt with context
      let systemPrompt = `You are FixMate AI, a helpful PC troubleshooting assistant. You help users diagnose and fix computer problems, optimize performance, and maintain system health.

Your capabilities include:
- Diagnosing slow PC performance
- Identifying security issues
- Recommending driver updates
- Troubleshooting printer problems
- General computer and Windows support

Be concise, friendly, and solution-oriented. Provide step-by-step instructions when appropriate.`;

      if (input.systemContext) {
        systemPrompt += `\n\nCurrent system status:`;
        if (input.systemContext.cpu) {
          systemPrompt += `\n- CPU: ${input.systemContext.cpu.usage}% usage, ${input.systemContext.cpu.cores} cores`;
        }
        if (input.systemContext.memory) {
          systemPrompt += `\n- Memory: ${input.systemContext.memory.usagePercent}% used`;
        }
        if (input.systemContext.disk) {
          systemPrompt += `\n- Disk: ${input.systemContext.disk.usagePercent}% used`;
        }
      }

      // Define available tools for function calling
      const tools = [
        {
          type: "function",
          function: {
            name: "run_system_optimization",
            description: "Run a full system optimization to clean junk files, temporary files, registry entries, and free up disk space. Use this when user asks to clean, optimize, or speed up their PC.",
            parameters: {
              type: "object",
              properties: {
                categories: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["browsing", "registry", "files", "privacy", "shortcuts", "services", "settings", "recycle"],
                  },
                  description: "Categories to optimize. If not specified, optimize all categories.",
                },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "run_system_scan",
            description: "Run a system diagnostic scan to check for issues, analyze performance, and identify optimization opportunities. Use this when user asks to scan or analyze their system.",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
      ];

      // Call built-in LLM with function calling support
      let data;
      try {
        data = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10).map((m) => ({ role: m.role as any, content: m.content })),
          ],
          tools: tools as any,
          tool_choice: "auto",
        });
      } catch (error: any) {
        console.error("LLM invocation error:", error);
        throw new Error(`Failed to get AI response: ${error.message}`);
      }

      const aiResponse = data.choices[0].message;
      
      // Check if AI wants to call a function
      let actionTriggered = null;
      let aiMessage = aiResponse.content;
      
      if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
        const toolCall = aiResponse.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || "{}");
        
        actionTriggered = {
          action: functionName,
          parameters: functionArgs,
        };
        
        // Generate a friendly message about the action
        if (functionName === "run_system_optimization") {
          aiMessage = "I'll start optimizing your system right away! This will clean up junk files, temporary data, and free up disk space. You can monitor the progress in the optimization window.";
        } else if (functionName === "run_system_scan") {
          aiMessage = "I'll run a comprehensive system scan to check for issues and identify optimization opportunities. This will take a moment...";
        }
      }

      // Add AI response to messages
      messages.push({
        role: "assistant",
        content: aiMessage || "I understand. How can I help you with that?",
        timestamp: new Date().toISOString(),
      });

      // Save or update conversation
      if (conversation) {
        await db
          .update(chatConversations)
          .set({
            messages: JSON.stringify(messages),
            systemContext: input.systemContext ? JSON.stringify(input.systemContext) : null,
            updatedAt: new Date(),
          })
          .where(eq(chatConversations.id, conversation.id));
      } else {
        const [newConv] = await db.insert(chatConversations).values({
          userId: ctx.user.id,
          messages: JSON.stringify(messages),
          systemContext: input.systemContext ? JSON.stringify(input.systemContext) : null,
          status: "active",
        });
        conversation = {
          id: newConv.insertId,
          userId: ctx.user.id,
          messages: JSON.stringify(messages),
          systemContext: input.systemContext ? JSON.stringify(input.systemContext) : null,
          status: "active" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return {
        conversationId: conversation.id,
        message: aiMessage,
        timestamp: new Date().toISOString(),
        actionTriggered, // Include action to trigger on frontend
      };
    }),

  /**
   * Get conversation history
   */
  getConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [conversation] = await db
        .select()
        .from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId))
        .limit(1);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      return {
        ...conversation,
        messages: JSON.parse(conversation.messages),
        systemContext: conversation.systemContext
          ? JSON.parse(conversation.systemContext)
          : null,
      };
    }),

  /**
   * Get all conversations for current user
   */
  getMyConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, ctx.user.id))
      .orderBy(chatConversations.updatedAt)
      .limit(20);

    return conversations.map((conv) => ({
      id: conv.id,
      status: conv.status,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: JSON.parse(conv.messages).length,
      lastMessage: JSON.parse(conv.messages).slice(-1)[0]?.content || "",
    }));
  }),

  /**
   * Archive a conversation
   */
  archiveConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(chatConversations)
        .set({
          status: "archived",
          updatedAt: new Date(),
        })
        .where(eq(chatConversations.id, input.conversationId));

      return { success: true };
    }),
});
