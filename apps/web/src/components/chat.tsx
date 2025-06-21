"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { Character, Message } from "@/types";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const characters = useQuery(trpc.characters.getAll.queryOptions());
  const messages = useQuery(trpc.chat.getAll.queryOptions());

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const createMutation = useMutation(
    trpc.chat.create.mutationOptions({
      onSuccess: () => {
        messages.refetch();
        setNewMessage("");
      },
    })
  );
  const updateMutation = useMutation(
    trpc.chat.update.mutationOptions({
      onSuccess: () => {
        messages.refetch();
        handleCancelEdit();
      },
    })
  );
  const deleteMutation = useMutation(
    trpc.chat.delete.mutationOptions({
      onSuccess: () => {
        messages.refetch();
        handleCancelEdit();
      },
    })
  );
  const destroyMutation = useMutation(
    trpc.chat.destroy.mutationOptions({
      onSuccess: () => {
        messages.refetch();
      },
    })
  );

  const generateMutation = useMutation(
    trpc.chat.generate.mutationOptions({
      onSuccess: async (data) => {
        setNewMessage("");
        for await (const part of data) {
          setNewMessage((prev) => prev + (part as string));
        }
      },
      onError: (error) => {
        console.error("Error generating message:", error);
      },
    })
  );

  const handleSelectCharacter = (characterId: string) => {
    const character = characters.data?.find(
      (character) => character.id === characterId
    );
    if (character) {
      setSelectedCharacter(character);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCharacter) return;

    if (editingMessage) {
      updateMutation.mutate({
        id: editingMessage.id,
        content: newMessage,
        senderName: selectedCharacter.name,
      });
    } else {
      createMutation.mutate({
        content: newMessage,
        senderName: selectedCharacter.name,
      });
    }
  };

  const handleDeleteMessage = () => {
    if (editingMessage) {
      deleteMutation.mutate({ id: editingMessage.id });
    }
  };

  const handleSelectMessage = (message: Message) => {
    const character = characters.data?.find(
      (c) => c.name === message.senderName
    );
    if (character) {
      setSelectedCharacter(character);
    }
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleGenerateMessage = async () => {
    if (!selectedCharacter) return;
    generateMutation.mutate({ characterId: selectedCharacter.id });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>AI 聊天室</CardTitle>
          <CardDescription>
            {selectedCharacter
              ? `回复为 ${selectedCharacter.name}`
              : "选择一个角色来开始聊天"}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {messages.isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {messages.data
            ?.slice()
            .reverse()
            .map((message) => (
              <div
                key={message.id}
                className="cursor-pointer rounded-lg p-2 hover:bg-muted"
                onClick={() => handleSelectMessage(message)}
              >
                <p className="font-bold">{message.senderName}</p>
                {/* <p className="whitespace-pre-wrap"> */}
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                {/* </p> */}
              </div>
            ))}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="w-full space-y-2">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedCharacter?.name ?? "角色"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {characters.data?.map((char) => (
                    <DropdownMenuItem
                      key={char.id}
                      onClick={() => handleSelectCharacter(char.id)}
                    >
                      {char.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Textarea
                placeholder="输入消息"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedCharacter}
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingMessage && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleDeleteMessage}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    取消
                  </Button>
                </>
              )}
              <Button
                type="button"
                onClick={handleGenerateMessage}
                disabled={!selectedCharacter || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "生成"
                )}
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedCharacter ||
                  !newMessage.trim() ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {editingMessage ? "更新" : "发送"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => destroyMutation.mutate()}
              >
                删除所有聊天
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
