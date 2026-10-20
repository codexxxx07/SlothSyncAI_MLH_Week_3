const DEFAULT_ENDPOINT = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

export const OllamaService = {
  getEndpoint: () => {
    return localStorage.getItem('ollama_endpoint') || DEFAULT_ENDPOINT;
  },

  setEndpoint: (endpoint) => {
    localStorage.setItem('ollama_endpoint', endpoint);
  },

  getModel: () => {
    return localStorage.getItem('ollama_model') || DEFAULT_MODEL;
  },

  setModel: (model) => {
    localStorage.setItem('ollama_model', model);
  },

  testConnection: async () => {
    try {
      const endpoint = OllamaService.getEndpoint();
      const response = await fetch(`${endpoint}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to connect to Ollama');
      }
      const data = await response.json();
      return { success: true, models: data.models || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  classifyFile: async (fileInfo) => {
    try {
      const endpoint = OllamaService.getEndpoint();
      const model = OllamaService.getModel();

      const prompt = `Classify this file and suggest a better filename if needed.

File Information:
- Name: ${fileInfo.name}
- Extension: ${fileInfo.extension}
- Size: ${fileInfo.size} bytes
- Modified: ${new Date(fileInfo.modified * 1000).toISOString()}

Available Categories:
- Documents
- Images
- Videos
- Audio
- Programming and Development
- Design and Creative Assets
- Archives
- Spreadsheets and Data
- Presentations
- Installers
- Miscellaneous

Return a JSON object with this exact structure:
{
  "category": "chosen category",
  "suggested_filename": "better name if unclear, or null if current name is good",
  "explanation": "brief reason for the classification"
}

Do not invent details not evident from the filename and extension. Preserve important identifiers like dates or project codes if present.`;

      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate classification');
      }

      const data = await response.json();

      try {
        const parsed = JSON.parse(data.response);
        return {
          success: true,
          category: parsed.category,
          suggestedFilename: parsed.suggested_filename,
          explanation: parsed.explanation,
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse AI response',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  batchClassify: async (files, batchSize = 5) => {
    const results = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => OllamaService.classifyFile(file))
      );
      results.push(...batchResults);
    }

    return results;
  },
};
