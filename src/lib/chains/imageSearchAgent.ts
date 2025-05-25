import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import formatChatHistoryAsString from '../utils/formatHistory';
import { BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { search } from '../search';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search the web for images.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation.

Example:
1. Follow up question: What is a cat?
Rephrased: A cat

2. Follow up question: What is a car? How does it works?
Rephrased: Car working

3. Follow up question: How does an AC work?
Rephrased: AC working

Conversation:
{chat_history}

Follow up question: {query}
Rephrased question:
`;

type ImageSearchChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

interface ImageSearchResult {
  img_src: string;
  url: string;
  title: string;
}

const strParser = new StringOutputParser();

const createImageSearchChain = (llm: BaseChatModel) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: ImageSearchChainInput) => {
        return formatChatHistoryAsString(input.chat_history);
      },
      query: (input: ImageSearchChainInput) => {
        return input.query;
      },
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input: string) => {
      input = input.replace(/<think>.*?<\/think>/g, '');

      let images: ImageSearchResult[] = [];
      const imageQuery = `${input} images`;
      
      // Try to get images using each search engine directly
      // We'll use a direct approach rather than relying on the engines parameter
      // which seems to be causing issues with SearxNG
      
      try {
        // Get the current selected search engine from environment
        const selectedEngine = process.env.SELECTED_SEARCH_ENGINE || 'searxng';
        
        // Use different strategies based on the search engine
        switch (selectedEngine) {
          case 'brave':
            // Import directly to avoid circular dependencies
            const { searchBrave } = require('../brave');
            const braveRes = await searchBrave(imageQuery, {
              count: 10
            });
            
            braveRes.results.forEach((result: any) => {
              if (result.img_src && result.url && result.title) {
                images.push({
                  img_src: result.img_src,
                  url: result.url,
                  title: result.title,
                });
              }
            });
            break;
            
          case 'serper':
            // Import directly to avoid circular dependencies
            const { searchSerper } = require('../serper');
            const serperRes = await searchSerper(imageQuery, {
              num: 10
            });
            
            serperRes.results.forEach((result: any) => {
              if (result.img_src && result.url && result.title) {
                images.push({
                  img_src: result.img_src,
                  url: result.url,
                  title: result.title,
                });
              }
            });
            break;
            
          case 'searxng':
          default:
            // For SearxNG, we'll try with a more direct approach
            // Import directly to avoid circular dependencies
            const { searchSearxng } = require('../searxng');
            try {
              // First try searching for images with specific terms that tend to work better
              const searxRes = await searchSearxng(`${input} pictures photos images`, {});
              
              searxRes.results.forEach((result: any) => {
                if (result.img_src && result.url && result.title) {
                  images.push({
                    img_src: result.img_src,
                    url: result.url,
                    title: result.title,
                  });
                }
              });
            } catch (innerError) {
              console.log('SearxNG image search failed:', innerError);
              // If SearxNG fails, we'll still return an empty array rather than failing
              // This at least prevents the application from crashing
            }
            break;
        }
      } catch (error) {
        console.error('Image search error:', error);
        // Return empty array on error rather than failing
      }

      return images.slice(0, 10);
    }),
  ]);
};

const handleImageSearch = (
  input: ImageSearchChainInput,
  llm: BaseChatModel,
) => {
  const imageSearchChain = createImageSearchChain(llm);
  return imageSearchChain.invoke(input);
};

export default handleImageSearch;
