import {
    AIMessage,
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import type { Message } from "prisma/generated/client";
import prisma from "../../prisma";

export async function* streamChat(characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });
  if (!character) {
    throw new Error("Character not found");
  }

  const llm = new ChatOllama({
    model: character.ollamaModel,
    temperature: 0,
    maxRetries: 2,
    baseUrl: character.ollamaUrl,
  });

  const history = await prisma.message.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const messages = history.map((msg: Message) => {
    if (msg.senderName === character.name) {
      return new AIMessage(msg.content);
    } else {
      return new HumanMessage(`${msg.senderName}: ${msg.content}`);
    }
  });

  const stream = await llm.stream([
    new SystemMessage(character.systemPrompt),
    ...messages,
  ]);

  for await (const chunk of stream) {
    yield chunk.content;
  }
}
