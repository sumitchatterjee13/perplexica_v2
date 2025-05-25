# 🚀 Perplexica - An AI-powered search engine 🔎 <!-- omit in toc -->

<div align="center" markdown="1">
   <sup>Special thanks to:</sup>
   <br>
   <br>
   <a href="https://www.warp.dev/perplexica">
      <img alt="Warp sponsorship" width="400" src="https://github.com/user-attachments/assets/775dd593-9b5f-40f1-bf48-479faff4c27b">
   </a>

### [Warp, the AI Devtool that lives in your terminal](https://www.warp.dev/perplexica)

[Available for MacOS, Linux, & Windows](https://www.warp.dev/perplexica)

</div>

<hr/>

[![Discord](https://dcbadge.vercel.app/api/server/26aArMy8tT?style=flat&compact=true)](https://discord.gg/26aArMy8tT)

![preview](.assets/perplexica-screenshot.png?)

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Preview](#preview)
- [Features](#features)
- [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
  - [Ollama Connection Errors](#ollama-connection-errors)
- [Admin User Setup & Authentication](#admin-user-setup--authentication)
  - [Initial Admin Setup](#initial-admin-setup)
  - [User Management](#user-management)
  - [Recent UI Improvements](#recent-ui-improvements)
- [Using as a Search Engine](#using-as-a-search-engine)
- [Using Perplexica's API](#using-perplexicas-api)
- [Expose Perplexica to a network](#expose-perplexica-to-network)
- [Upcoming Features](#upcoming-features)
- [Support Us](#support-us)
  - [Donations](#donations)
- [Contribution](#contribution)
- [Help and Support](#help-and-support)

## Overview

Perplexica is an open-source AI-powered searching tool or an AI-powered search engine that goes deep into the internet to find answers. Inspired by Perplexity AI, this enhanced version provides a robust, open-source option that not just searches the web but understands your questions. It uses advanced machine learning algorithms like similarity searching and embeddings to refine results and provides clear answers with sources cited.

Perplexica now supports multiple search engines including SearxNG, Brave Search, and Serper (Google), giving you flexibility in how you search while ensuring up-to-date information without compromising your privacy. This version also introduces a comprehensive authentication system, allowing for private deployments and user management.

Want to know more about its architecture and how it works? You can read it [here](https://github.com/sumitchatterjee13/perplexica_v2/tree/main/docs/architecture/README.md).

## Preview

![video-preview](.assets/perplexica-preview.gif)

## Features

- **Local LLMs**: You can make use local LLMs such as Llama3 and Mixtral using Ollama.
- **Two Main Modes:**
  - **Copilot Mode:** (In development) Boosts search by generating different queries to find more relevant internet sources. Like normal search instead of just using the context by SearxNG, it visits the top matches and tries to find relevant sources to the user's query directly from the page.
  - **Normal Mode:** Processes your query and performs a web search.
- **Focus Modes:** Special modes to better answer specific types of questions. Perplexica currently has 6 focus modes:
  - **All Mode:** Searches the entire web to find the best results.
  - **Writing Assistant Mode:** Helpful for writing tasks that do not require searching the web.
  - **Academic Search Mode:** Finds articles and papers, ideal for academic research.
  - **YouTube Search Mode:** Finds YouTube videos based on the search query.
  - **Wolfram Alpha Search Mode:** Answers queries that need calculations or data analysis using Wolfram Alpha.
  - **Reddit Search Mode:** Searches Reddit for discussions and opinions related to the query.
- **Multiple Search Engines:** Choose between SearxNG, Brave Search, and Serper (Google) to power your searches. Select your preferred engine in the settings page.
- **Authentication System**: Secure your Perplexica instance with a built-in authentication system. Manage users, and ensure private access, especially when deployed to the cloud. The first admin user can be easily set up, and subsequent users can be managed through an admin interface.
- **Current Information:** Some search tools might give you outdated info because they use data from crawling bots and convert them into embeddings and store them in a index. Unlike them, Perplexica uses real-time search engines to get results and rerank to find the most relevant sources, ensuring you always get the latest information without the overhead of daily data updates.
- **API**: Integrate Perplexica into your existing applications and make use of its capibilities.

It has many more features like image and video search. Some of the planned features are mentioned in [upcoming features](#upcoming-features).

## Installation

Perplexica can be installed and run using npm. Follow these steps to get started:

1. Clone the Perplexica repository:

   ```bash
   git clone https://github.com/sumitchatterjee13/perplexica_v2.git
   ```

2. After cloning, navigate to the directory containing the project files.

   ```bash
   cd perplexica_v2
   ```

### Environment Configuration

3. Copy the `sample.env` file to `.env` in the root directory. 

   ```bash
   cp sample.env .env
   ```

4. Populate the `.env` file with your necessary API keys and configurations. Key fields include:

   - `SETUP_KEY`: **Required for initial admin setup**. A secret key you define. This key will be used once to set up the first admin account via the `/setup` page.
   - `OPENAI_API_KEY`: Your OpenAI API key. **Fill this if you wish to use OpenAI's models**.
   - `OLLAMA_URL`: Your Ollama API URL (e.g., `http://localhost:11434`). **Fill this if you wish to use Ollama's models**.
   - `GROQ_API_KEY`: Your Groq API key. **Fill this if you wish to use Groq's hosted models**.
   - `ANTHROPIC_API_KEY`: Your Anthropic API key. **Fill this if you wish to use Anthropic models**.
   - `BRAVE_API_KEY`: Your Brave Search API key. **Fill this if you wish to use Brave Search**.
   - `SERPER_API_KEY`: Your Serper API key. **Fill this if you wish to use Serper (Google Search)**.
   - `SEARXNG_API_URL`: The URL for your SearXNG instance if you choose to use it (e.g., `https://searx.example.com`).
   - `SELECTED_SEARCH_ENGINE`: Choose which search engine to use (`searxng`, `brave`, or `serper`). Defaults to `searxng` if not specified.
   - `SIMILARITY_MEASURE`: The similarity measure to use (This is filled by default; you can leave it as is if you are unsure about it.)
   - `NEXTAUTH_URL`: Your application's base URL (e.g., `http://localhost:3000`). **Required for authentication**.
   - `NEXTAUTH_SECRET`: A secret key for NextAuth. Generate a strong random string for this. **Required for authentication**.

     **Note**: API keys for LLMs and search engines can also be configured from the settings page after initial setup, but `SETUP_KEY`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` must be in the `.env` file.

### Running the Application

5. Install the dependencies:

   ```bash
   npm install
   ```

6. Build the application:

   ```bash
   npm run build
   ```

7. Start the application:

   ```bash
   npm run start
   ```

8. Perplexica should now be accessible at http://localhost:3000 (or your configured `NEXTAUTH_URL`).

See the [installation documentation](https://github.com/sumitchatterjee13/perplexica_v2/tree/main/docs/installation) for more information like updating, etc.

### Ollama Connection Errors

If you're encountering an Ollama connection error, it is likely due to the backend being unable to connect to Ollama's API. To fix this issue you can:

1. **Check your Ollama API URL:** Ensure that the API URL is correctly set in the `.env` file (`OLLAMA_URL`) or in the settings menu within the application.
2. **Linux Users - Expose Ollama to Network:**
   - If Ollama is running on the same machine but outside a container, ensure it's configured to listen on `0.0.0.0` or your specific network IP.
   - Inside `/etc/systemd/system/ollama.service`, you might need to add `Environment="OLLAMA_HOST=0.0.0.0"`. Then restart Ollama by `systemctl daemon-reload` and `systemctl restart ollama`. For more information see [Ollama docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux).
   - Ensure that the port (default is 11434) is not blocked by your firewall.

## Admin User Setup & Authentication

Perplexica includes an authentication system and an admin interface for user management, allowing you to control who can access your instance.

### Initial Admin Setup

1.  **Set `SETUP_KEY`**: Before starting the application for the first time, ensure you have set a unique `SETUP_KEY` in your `.env` file. This key is crucial for securing the initial admin account creation process.
2.  **Navigate to `/setup`**: Once the application is running, open your browser and go to `http://yourdomain.com/setup` (e.g., `http://localhost:3000/setup`).
3.  **Create Admin Account**: You will be prompted to enter the `SETUP_KEY` you defined in the `.env` file. After successful validation, you can create the first admin user account by providing a username, password, and other details.
4.  **Login**: After creating the admin account, the `/setup` page will no longer be accessible (or will require the `SETUP_KEY` again if not completed). You can now log in with your new admin credentials through the regular login page.

**Important**: The `SETUP_KEY` is only used for this initial admin creation. Once the first admin is created, this key's primary purpose is fulfilled. For security, ensure it's a strong, unique key.

### User Management

Once logged in as an admin user, you can manage other users:

1.  **Accessing Admin Page:** Access the admin panel from the user dropdown menu in the top-right corner.
2.  **Admin Capabilities:** From the admin panel, you can:
    *   View all users in the system.
    *   Add new users with either admin or regular user roles.
    *   Edit existing user details including username, name, and role.
    *   Reset user passwords.
    *   Delete users from the system.

**Security Considerations:** Admin users have full control over user management. Assign admin privileges carefully.

### Recent UI Improvements

The admin interface has been improved with the following enhancements:

- **Responsive Table Layout:** The user management table now properly handles content overflow with automatic horizontal scrolling when needed.
- **Improved Content Wrapping:** Table cell content now wraps appropriately to maintain layout integrity across different screen sizes.
- **Enhanced Action Buttons:** Action buttons in the table now wrap when space is limited, ensuring they remain accessible on smaller screens.

These improvements ensure the admin interface remains usable across various device sizes and screen resolutions.

## Using as a Search Engine

If you wish to use Perplexica as an alternative to traditional search engines like Google or Bing, or if you want to add a shortcut for quick access from your browser's search bar, follow these steps:

1. Open your browser's settings.
2. Navigate to the 'Search Engines' section.
3. Add a new site search with the following URL: `http://localhost:3000/?q=%s`. Replace `localhost` with your IP address or domain name, and `3000` with the port number if Perplexica is not hosted locally.
4. Click the add button. Now, you can use Perplexica directly from your browser's search bar.

## Using Perplexica's API

Perplexica also provides an API for developers looking to integrate its powerful search engine into their own applications. You can run searches, use multiple models and get answers to your queries.

For more details, check out the full documentation [here](https://github.com/sumitchatterjee13/perplexica_v2/tree/main/docs/API/SEARCH.md).

## Expose Perplexica to network

Perplexica runs on Next.js and handles all API requests. It works right away on the same network and stays accessible even with port forwarding, provided your `NEXTAUTH_URL` in the `.env` file is correctly set to the externally accessible URL.

## Upcoming Features

- [x] Add settings page
- [x] Adding support for local LLMs
- [x] History Saving features
- [x] Introducing various Focus Modes
- [x] Adding API support
- [ ] User Authentication & Management (Basic implementation done, further enhancements planned)
- [ ] Option to choose between different LLMs for Copilot mode
- [ ] Better source handling and summarization
- [ ] Option to select multiple sources for answer generation
- [ ] Image and Video search improvements
- [ ] More Focus Modes
- [ ] Improved UI/UX

## Support Us

Perplexica is a community-driven project. We rely on your support to keep the project going and to continue developing new features. If you find Perplexica useful, please consider supporting original creator.

### Donations

You can support original creator by donating to our project. We accept donations through the following channels:

- [Patreon](https://www.patreon.com/ItzCrazyKns)
- [Ko-fi](https://ko-fi.com/itzcrazykns)

**Note**: Please verify if these donation links are still active for the new repository owner or if they need to be updated.

## Contribution

We welcome contributions from everyone. If you have an idea for a new feature, or if you want to help us fix bugs, please feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/sumitchatterjee13/perplexica_v2).

