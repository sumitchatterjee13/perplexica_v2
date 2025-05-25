// Use dynamic imports for Node.js modules to prevent client-side errors
let fs: any;
let path: any;
let dotenv: any;
if (typeof window === 'undefined') {
  // We're on the server
  fs = require('fs');
  path = require('path');
  dotenv = require('dotenv');
  
  // Load environment variables from .env file
  dotenv.config();
}

// Define helper function to get env variables with defaults
const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const getSimilarityMeasure = () =>
  getEnv('SIMILARITY_MEASURE', 'cosine');

export const getKeepAlive = () =>
  getEnv('KEEP_ALIVE', '5m');

export const getOpenaiApiKey = () =>
  getEnv('OPENAI_API_KEY');

export const getGroqApiKey = () =>
  getEnv('GROQ_API_KEY');

export const getAnthropicApiKey = () =>
  getEnv('ANTHROPIC_API_KEY');

export const getGeminiApiKey = () =>
  getEnv('GEMINI_API_KEY');

export const getSearxngApiEndpoint = () =>
  getEnv('SEARXNG_API_URL');

export const getBraveApiKey = () =>
  getEnv('BRAVE_API_KEY');

export const getSerperApiKey = () =>
  getEnv('SERPER_API_KEY');

export const getOllamaApiEndpoint = () =>
  getEnv('OLLAMA_API_URL');

export const getDeepseekApiKey = () =>
  getEnv('DEEPSEEK_API_KEY');

export const getCustomOpenaiApiKey = () =>
  getEnv('CUSTOM_OPENAI_API_KEY');

export const getCustomOpenaiApiUrl = () =>
  getEnv('CUSTOM_OPENAI_API_URL');

export const getCustomOpenaiModelName = () =>
  getEnv('CUSTOM_OPENAI_MODEL_NAME');

export const getLMStudioApiEndpoint = () =>
  getEnv('LM_STUDIO_API_URL');

export const getSelectedSearchEngine = () =>
  getEnv('SELECTED_SEARCH_ENGINE', 'searxng');

// For a proper implementation, environment variables should be set through
// the hosting platform or deployment process, as they are typically read-only at runtime.
// 
// This is a simple implementation to update a .env file for development purposes.
// In production, you would use a more robust method to update environment variables.
export const updateConfig = (updates: Record<string, string>) => {
  // Server-side only
  if (typeof window === 'undefined') {
    try {
      // Read current .env file content
      let envContent = '';
      const envPath = path.join(process.cwd(), '.env');
      
      try {
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf-8');
        }
      } catch (error) {
        console.error('Error reading .env file:', error);
        // Create new file if it doesn't exist
        envContent = '';
      }
      
      // Process each key-value pair to update
      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        const newLine = `${key}=${value}`;
        
        if (regex.test(envContent)) {
          // Update existing key
          envContent = envContent.replace(regex, newLine);
        } else {
          // Add new key
          envContent += `\n${newLine}`;
        }
      }
      
      // Write updated content back to .env file
      fs.writeFileSync(envPath, envContent.trim());
      
      // Reload environment variables
      Object.keys(updates).forEach(key => {
        process.env[key] = updates[key];
      });
      
      return true;
    } catch (error) {
      console.error('Error updating .env file:', error);
      return false;
    }
  }
  return false;
};
