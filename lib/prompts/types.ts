export type PromptArgs = {
  words: string[]; // 반드시 5개
};

export type TemplateRenderer = (args: PromptArgs) => string;
