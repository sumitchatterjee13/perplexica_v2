import {
  getAnthropicApiKey,
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
  getGeminiApiKey,
  getGroqApiKey,
  getOllamaApiEndpoint,
  getOpenaiApiKey,
  getDeepseekApiKey,
  getLMStudioApiEndpoint,
  getBraveApiKey,
  getSerperApiKey,
  getSelectedSearchEngine,
  updateConfig,
} from '@/lib/config';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';

export const GET = async (req: Request) => {
  try {
    const config: Record<string, any> = {};

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    config['chatModelProviders'] = {};
    config['embeddingModelProviders'] = {};

    for (const provider in chatModelProviders) {
      config['chatModelProviders'][provider] = Object.keys(
        chatModelProviders[provider],
      ).map((model) => {
        return {
          name: model,
          displayName: chatModelProviders[provider][model].displayName,
        };
      });
    }

    for (const provider in embeddingModelProviders) {
      config['embeddingModelProviders'][provider] = Object.keys(
        embeddingModelProviders[provider],
      ).map((model) => {
        return {
          name: model,
          displayName: embeddingModelProviders[provider][model].displayName,
        };
      });
    }

    config['openaiApiKey'] = getOpenaiApiKey();
    config['ollamaApiUrl'] = getOllamaApiEndpoint();
    config['lmStudioApiUrl'] = getLMStudioApiEndpoint();
    config['anthropicApiKey'] = getAnthropicApiKey();
    config['groqApiKey'] = getGroqApiKey();
    config['geminiApiKey'] = getGeminiApiKey();
    config['deepseekApiKey'] = getDeepseekApiKey();
    config['customOpenaiApiUrl'] = getCustomOpenaiApiUrl();
    config['customOpenaiApiKey'] = getCustomOpenaiApiKey();
    config['customOpenaiModelName'] = getCustomOpenaiModelName();
    config['braveApiKey'] = getBraveApiKey();
    config['serperApiKey'] = getSerperApiKey();
    config['selectedSearchEngine'] = getSelectedSearchEngine();

    return Response.json({ ...config }, { status: 200 });
  } catch (err) {
    console.error('An error occurred while getting config:', err);
    return Response.json(
      { message: 'An error occurred while getting config' },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const config = await req.json();

    // Create a flattened key-value object for environment variables
    const updates: Record<string, string> = {
      // Convert from camelCase to uppercase with underscores
      OPENAI_API_KEY: config.openaiApiKey || '',
      GROQ_API_KEY: config.groqApiKey || '',
      ANTHROPIC_API_KEY: config.anthropicApiKey || '',
      GEMINI_API_KEY: config.geminiApiKey || '',
      OLLAMA_API_URL: config.ollamaApiUrl || '',
      DEEPSEEK_API_KEY: config.deepseekApiKey || '',
      LM_STUDIO_API_URL: config.lmStudioApiUrl || '',
      CUSTOM_OPENAI_API_URL: config.customOpenaiApiUrl || '',
      CUSTOM_OPENAI_API_KEY: config.customOpenaiApiKey || '',
      CUSTOM_OPENAI_MODEL_NAME: config.customOpenaiModelName || '',
      BRAVE_API_KEY: config.braveApiKey || '',
      SERPER_API_KEY: config.serperApiKey || '',
      SELECTED_SEARCH_ENGINE: config.selectedSearchEngine || 'searxng',
    };

    // Update the config with our flattened structure
    updateConfig(updates);

    return Response.json({ message: 'Config updated' }, { status: 200 });
  } catch (err) {
    console.error('An error occurred while updating config:', err);
    return Response.json(
      { message: 'An error occurred while updating config' },
      { status: 500 },
    );
  }
};
