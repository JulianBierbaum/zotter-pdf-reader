# Zotter PDF Reader 

## Core Features

- **PDF Upload**: Easily upload PDF documents for analysis.
- **Dynamic Checklist Definition**: Create, edit, remove, and reorder checklist items. You can also generate a checklist from a PDF using AI.
- **Gemini 2.5 Flash Integration**: Leverages GenAI to process uploaded PDFs against the defined checklist, with clear indications of uncertainties.
- **Intuitive Result Display**: View analysis results in a clear checklist format with checkmarks, crosses, and uncertainty notes.
- **Result History**: Access a history of all previous analyses, with links to detailed result pages.
- **Secure Access**: A simple password-based login system protects your analysis sessions.
- **German Interface**: The application is fully localized in German for a native user experience.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Before running the application, you need to set up your environment variables. Create a `.env.local` file in the root of the project and add the following:

```
# The password used to log in to the application.
APP_PASSWORD=your_secure_password

# Optional: Your Google AI API Key for Genkit
GOOGLE_API_KEY=your_google_ai_api_key
```

### Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.





### Deploy Webhook
https://cnz000675.virtual.local:9443/api/stacks/webhooks/7a224806-2cb8-430e-a3ef-ac292e7347bb

https://docs.portainer.io/user/docker/stacks/webhooks
