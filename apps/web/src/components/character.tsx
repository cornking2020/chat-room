"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Character } from "@/types";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Ollama } from "ollama/browser";
import { useEffect, useState } from "react";

const emptyCharacter: Omit<Character, "id" | "ollamaApiKey"> & {
  ollamaApiKey: string;
} = {
  name: "聊天机器人",
  systemPrompt: "你是一个聊天机器人，请根据用户的问题给出回答。",
  ollamaUrl: "http://127.0.0.1:11434",
  ollamaApiKey: "ollama",
  ollamaModel: "",
};

export default function CharacterManager() {
  const queryClient = useQueryClient();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [formState, setFormState] = useState(emptyCharacter);
  const [models, setModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const characters = useQuery(trpc.characters.getAll.queryOptions());

  useEffect(() => {
    if (selectedCharacter) {
      setFormState({
        ...selectedCharacter,
        ollamaApiKey: selectedCharacter.ollamaApiKey ?? "",
      });
    } else {
      setFormState(emptyCharacter);
    }
  }, [selectedCharacter]);

  const handleFetchModels = async () => {
    if (!formState.ollamaUrl) {
      console.error("Ollama URL is not set.");
      return;
    }
    setIsFetchingModels(true);
    try {
      const ollamaClient = new Ollama({ host: formState.ollamaUrl });
      const response = await ollamaClient.list();
      const modelNames = response.models.map((m) => m.name);
      setModels(modelNames);
    } catch (e) {
      console.error("Failed to fetch Ollama models", e);
      setModels([]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.characters.getAll.queryKey(),
    });
    // also invalidate chat queries to update character names
    queryClient.invalidateQueries({
      queryKey: trpc.chat.getAll.queryKey(),
    });
  };

  const createMutation = useMutation(
    trpc.characters.create.mutationOptions({
      onSuccess: () => {
        invalidateQueries();
        handleClearSelection();
      },
    })
  );

  const updateMutation = useMutation(
    trpc.characters.update.mutationOptions({
      onSuccess: () => {
        invalidateQueries();
        handleClearSelection();
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.characters.delete.mutationOptions({
      onSuccess: () => {
        invalidateQueries();
        handleClearSelection();
      },
    })
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleClearSelection = () => {
    setSelectedCharacter(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { ollamaApiKey, ...rest } = formState;
    const mutationData = {
      ...rest,
      ollamaApiKey: ollamaApiKey || null,
    };
    if (selectedCharacter) {
      updateMutation.mutate({
        id: selectedCharacter.id,
        ...mutationData,
      });
    } else {
      createMutation.mutate(mutationData);
    }
  };

  const handleDelete = () => {
    if (selectedCharacter) {
      deleteMutation.mutate({ id: selectedCharacter.id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>角色</CardTitle>
          <CardDescription>选择一个角色来编辑</CardDescription>
        </CardHeader>
        <CardContent>
          {characters.isLoading && <Loader2 className="animate-spin" />}
          <ul className="space-y-2">
            {characters.data?.map((char) => (
              <li
                key={char.id}
                onClick={() => handleSelectCharacter(char)}
                className={`cursor-pointer rounded-md p-2 ${
                  selectedCharacter?.id === char.id
                    ? "bg-muted"
                    : "hover:bg-muted"
                }`}
              >
                {char.name}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCharacter ? "编辑角色" : "创建角色"}</CardTitle>
          <CardDescription>
            {selectedCharacter ? "修改角色信息" : "创建一个新角色"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">角色名称</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">系统提示词</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formState.systemPrompt}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl">Ollama 地址</Label>
              <Input
                id="ollamaUrl"
                name="ollamaUrl"
                value={formState.ollamaUrl}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ollama 模型</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {formState.ollamaModel || "选择一个模型"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      {models.length > 0 ? (
                        models.map((model) => (
                          <DropdownMenuItem
                            key={model}
                            onSelect={() => {
                              setFormState((prev) => ({
                                ...prev,
                                ollamaModel: model,
                              }));
                            }}
                          >
                            {model}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          没有找到模型
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleFetchModels}
                  disabled={isFetchingModels || !formState.ollamaUrl}
                >
                  {isFetchingModels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ollamaApiKey">Ollama API Key (可选)</Label>
              <Input
                id="ollamaApiKey"
                name="ollamaApiKey"
                value={formState.ollamaApiKey}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-between">
              <div>
                {selectedCharacter && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {selectedCharacter && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearSelection}
                  >
                    取消
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedCharacter ? (
                    "更新"
                  ) : (
                    "创建"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
