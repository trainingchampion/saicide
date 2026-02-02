import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the @google/genai library. This will be automatically picked up by Jest.
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
      generateImages: jest.fn(),
      generateVideos: jest.fn(),
    },
    operations: {
        getVideosOperation: jest.fn(),
    }
  })),
  Modality: {
    IMAGE: 'IMAGE',
    AUDIO: 'AUDIO',
  }
}));

import aiService from '../services/geminiService';
import { SecurityPolicy } from '../types';

describe('aiService', () => {

  beforeEach(() => {
    // Clear mock history before each test
    mockGenerateContent.mockClear();
  });

  describe('getChatResponse', () => {
    it('should call Gemini API with correct parameters for a gemini model', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Hello from Gemini!', candidates: [] });

      await aiService.getChatResponse({
        prompt: 'test prompt',
        modelId: 'gemini-2.5-flash',
        useThinking: true,
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: 'test prompt',
        config: {
          systemInstruction: "You are S.AI, a helpful AI assistant specialized in software development, cloud infrastructure, and security.",
          thinkingConfig: { thinkingBudget: 24576 },
        },
      });
    });

    it('should include maps grounding when useMaps is true', async () => {
        mockGenerateContent.mockResolvedValue({ text: 'Nearby!', candidates: [{groundingMetadata: {groundingChunks: [{maps: {uri: 'test.com'}}]}}] });
        const location = { latitude: 34, longitude: -118 };
        await aiService.getChatResponse({
            prompt: 'restaurants near me',
            modelId: 'gemini-2.5-pro',
            useMaps: true,
            location: location
        });

        expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
            config: expect.objectContaining({
                tools: [{ googleMaps: {} }],
                toolConfig: { retrievalConfig: { latLng: location } }
            })
        }));
    });

    it('should return a mock response for non-gemini models', async () => {
        const response = await aiService.getChatResponse({ prompt: 'hello', modelId: 'gpt-4o' });
        expect(response.text).toContain('mock response from GPT-4o');
        expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API failed'));
        const response = await aiService.getChatResponse({ prompt: 'fail test', modelId: 'gemini-2.5-flash'});
        expect(response.text).toContain('Sorry, I encountered an error');
    });
  });

  describe('generateTerraform', () => {
    it('should parse a multi-file response correctly', async () => {
        const mockApiResponse = `
// FILE: main.tf
resource "aws_instance" "web" {}

// FILE: variables.tf
variable "instance_type" {}
        `;
        mockGenerateContent.mockResolvedValue({ text: mockApiResponse, candidates: [] });

        const files = await aiService.generateTerraform('AWS', 'test', 'gemini-2.5-pro', []);
        
        expect(files).toHaveLength(2);
        expect(files[0].fileName).toBe('main.tf');
        expect(files[0].content).toContain('resource "aws_instance" "web" {}');
        expect(files[1].fileName).toBe('variables.tf');
        expect(files[1].content).toContain('variable "instance_type" {}');
    });

    it('should handle a single-file response without delimiters', async () => {
        mockGenerateContent.mockResolvedValue({ text: 'resource "local_file" "test" {}', candidates: [] });
        const files = await aiService.generateTerraform('AWS', 'test', 'gemini-2.5-pro', []);

        expect(files).toHaveLength(1);
        expect(files[0].fileName).toBe('main.tf');
        expect(files[0].content).toBe('resource "local_file" "test" {}');
    });

    it('should include security policies in the system instruction', async () => {
        mockGenerateContent.mockResolvedValue({ text: '// FILE: main.tf\ncontent', candidates: [] });
        const policies: SecurityPolicy[] = [{
            id: 's3-public',
            title: 'No Public S3 Buckets',
            severity: 'critical',
            description: 'Prevent public S3 buckets.',
            enabled: true,
            violationsCount: 0,
            issueTypes: []
        }];

        await aiService.generateTerraform('AWS', 'test', 'gemini-2.5-pro', policies);
        
        expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
            config: expect.objectContaining({
                systemInstruction: expect.stringContaining('No Public S3 Buckets: Prevent public S3 buckets.')
            })
        }));
    });
  });
});